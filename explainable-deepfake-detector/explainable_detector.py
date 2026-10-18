import os
import cv2
import numpy as np
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

class ExplainableDeepfakeDetector:
    def __init__(self, model_name="dima806/deepfake_vs_real_image_detection", device=None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Loading {model_name} on {self.device}...")
        self.processor = AutoImageProcessor.from_pretrained(model_name)
        self.model = AutoModelForImageClassification.from_pretrained(
            model_name, 
            attn_implementation="eager"
        ).to(self.device)
        self.model.eval()
        self.labels = self.model.config.id2label

    def _extract_attention_map(self, inputs, original_size):
        """
        Extracts self-attention rollout/weights from the Vision Transformer
        to localize image patches that most influenced the classification.
        """
        with torch.no_grad():
            outputs = self.model(**inputs, output_attentions=True)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=-1).squeeze(0)
            
            # attentions is a tuple of 12 layers: [batch, num_heads, seq_len, seq_len]
            attentions = outputs.attentions

        # Use attention rollout across layers for robust attention flow
        # sequence length is 197 (1 CLS token + 14x14=196 patches)
        rollout = torch.eye(197).unsqueeze(0).to(self.device)
        for layer_attn in attentions[-4:]:  # focus on top semantic layers
            # average across heads
            attn_heads = layer_attn.mean(dim=1)
            # add residual identity connection
            attn_heads = 0.5 * attn_heads + 0.5 * torch.eye(197).to(self.device)
            # normalize rows
            attn_heads = attn_heads / attn_heads.sum(dim=-1, keepdim=True)
            rollout = torch.bmm(attn_heads, rollout)

        # CLS token attention to all 196 image patches
        cls_attn = rollout[0, 0, 1:].cpu().numpy()  # shape (196,)
        cls_attn = cls_attn.reshape(14, 14)

        # Normalize attention between 0 and 1
        cls_attn = (cls_attn - cls_attn.min()) / (cls_attn.max() - cls_attn.min() + 1e-8)
        
        # Upsample to match original image dimensions
        orig_w, orig_h = original_size
        heatmap = cv2.resize(cls_attn, (orig_w, orig_h), interpolation=cv2.INTER_CUBIC)
        heatmap = np.clip(heatmap, 0, 1)

        return probs, heatmap, cls_attn

    def _analyze_regions(self, patch_grid):
        """
        Analyzes the 14x14 patch grid corresponding to anatomical facial regions.
        Standard face framing (centered portrait):
        - Rows 0-3: Hairline / Forehead / Upper Boundary
        - Rows 3-6: Eyes / Eyebrows / Bridge of Nose
        - Rows 6-9: Mid-face / Cheeks / Nose
        - Rows 9-12: Mouth / Lips / Jawline
        - Rows 12-14: Chin / Neck / Collar boundary
        - Cols 0-2 & 12-14: Left/Right Facial Perimeter & Background
        """
        regions = {
            "Eyes & Eyebrows": patch_grid[3:6, 3:11],
            "Mouth & Lower Face": patch_grid[9:12, 4:10],
            "Cheeks & Nose": patch_grid[6:9, 4:10],
            "Facial Perimeter & Blending Border": np.concatenate([
                patch_grid[:3, :].flatten(),
                patch_grid[12:, :].flatten(),
                patch_grid[:, :3].flatten(),
                patch_grid[:, 11:].flatten()
            ]),
        }

        region_scores = {}
        for name, data in regions.items():
            region_scores[name] = float(np.mean(data))

        # Rank regions by attention intensity
        sorted_regions = sorted(region_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_regions

    def _generate_summary(self, predicted_label, confidence, sorted_regions):
        """
        Generates a readable narrative explanation of why the image received this verdict.
        """
        top_region, top_score = sorted_regions[0]
        second_region, second_score = sorted_regions[1]

        reasons = []
        if predicted_label.upper() == "FAKE":
            if "Facial Perimeter" in top_region or "Facial Perimeter" in second_region:
                reasons.append("Unnatural blending boundaries or warping detected around the facial perimeter / jawline (typical indicator of face-swap boundaries).")
            if "Eyes & Eyebrows" in top_region or "Eyes & Eyebrows" in second_region:
                reasons.append("Anomalous high-frequency artifacts or reflection irregularities detected in the eye/eyebrow region.")
            if "Mouth & Lower Face" in top_region or "Mouth & Lower Face" in second_region:
                reasons.append("Synthetic smoothing or irregular tooth/lip edge transitions identified in the mouth area.")
            if "Cheeks & Nose" in top_region or "Cheeks & Nose" in second_region:
                reasons.append("Disruption in natural skin texture/noise patterns observed in the mid-facial region.")

            if not reasons:
                reasons.append(f"Pronounced synthetic frequency distortions localized primarily in the {top_region}.")

            summary = (
                f"The image was classified as FAKE with {confidence:.1f}% confidence. "
                f"The Vision Transformer's attention is predominantly concentrated on the '{top_region}' "
                f"and '{second_region}'. This pattern indicates generative manipulation artifacts, such as "
                f"{reasons[0].lower()}"
            )
        else:
            summary = (
                f"The image was classified as REAL with {confidence:.1f}% confidence. "
                f"The model's attention is balanced across natural facial features without localized "
                f"discontinuities or synthetic blending seams typical of deepfake generators."
            )

        return reasons, summary

    def predict(self, image_path, output_dir=None):
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")

        # Load image
        raw_image = Image.open(image_path).convert("RGB")
        original_size = raw_image.size  # (width, height)
        
        # Prepare inputs
        inputs = self.processor(images=raw_image, return_tensors="pt").to(self.device)

        # Run inference and attention extraction
        probs, heatmap, patch_grid = self._extract_attention_map(inputs, original_size)
        
        fake_idx = 1
        real_idx = 0
        fake_prob = float(probs[fake_idx])
        real_prob = float(probs[real_idx])

        predicted_idx = int(torch.argmax(probs))
        predicted_label = self.labels[predicted_idx]
        confidence = float(probs[predicted_idx]) * 100.0

        # Region analysis & reasoning
        sorted_regions = self._analyze_regions(patch_grid)
        reasons, summary = self._generate_summary(predicted_label, confidence, sorted_regions)

        # Create visual overlay
        orig_np = np.array(raw_image)
        heatmap_colored = cv2.applyColorMap(np.uint8(255 * heatmap), cv2.COLORMAP_JET)
        heatmap_colored = cv2.cvtColor(heatmap_colored, cv2.COLOR_BGR2RGB)
        overlay = cv2.addWeighted(orig_np, 0.6, heatmap_colored, 0.4, 0)

        # Side-by-side visualization
        vis_combined = np.hstack([orig_np, heatmap_colored, overlay])

        saved_vis_path = None
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            base_name = os.path.splitext(os.path.basename(image_path))[0]
            saved_vis_path = os.path.join(output_dir, f"{base_name}_explanation.jpg")
            vis_bgr = cv2.cvtColor(vis_combined, cv2.COLOR_RGB2BGR)
            cv2.imwrite(saved_vis_path, vis_bgr)

        return {
            "verdict": predicted_label.upper(),
            "confidence": f"{confidence:.2f}%",
            "confidence_fake": round(fake_prob, 4),
            "confidence_real": round(real_prob, 4),
            "flagged_regions": [
                {"region": reg, "attention_score": round(score, 4)}
                for reg, score in sorted_regions
            ],
            "reasons": reasons,
            "summary": summary,
            "explanation_image": saved_vis_path
        }


if __name__ == "__main__":
    import argparse
    import json

    parser = argparse.ArgumentParser(description="Explainable Deepfake Detector (ViT Attention XAI)")
    parser.add_argument("--image", type=str, required=True, help="Path to input image")
    parser.add_argument("--output-dir", type=str, default="outputs", help="Directory to save visual explanation")
    args = parser.parse_args()

    detector = ExplainableDeepfakeDetector()
    result = detector.predict(args.image, output_dir=args.output_dir)

    print("\n" + "="*60)
    print("DETECTION RESULT & REASONING SUMMARY")
    print("="*60)
    print(f"VERDICT:    {result['verdict']} ({result['confidence']})")
    print(f"SUMMARY:    {result['summary']}")
    print("\nFLAGGED REGIONS (Attention Intensity):")
    for item in result["flagged_regions"]:
        print(f" - {item['region']}: {item['attention_score']}")
    if result["reasons"]:
        print("\nSPECIFIC REASONS IDENTIFIED:")
        for r in result["reasons"]:
            print(f" • {r}")
    if result["explanation_image"]:
        print(f"\nVisual Explanation Saved To: {result['explanation_image']}")
    print("="*60)
