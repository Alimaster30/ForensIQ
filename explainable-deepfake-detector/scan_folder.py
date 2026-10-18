import os
import time
import json
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

def run_batch_scan(folder_path, output_json="audit_results.json"):
    files = [
        os.path.join(folder_path, f)
        for f in os.listdir(folder_path)
        if f.lower().endswith(('.jpg', '.jpeg', '.png'))
    ]
    print(f"Total images found in {folder_path}: {len(files)}")

    print("Loading Vision Transformer deepfake model...")
    model_name = "dima806/deepfake_vs_real_image_detection"
    processor = AutoImageProcessor.from_pretrained(model_name)
    model = AutoModelForImageClassification.from_pretrained(model_name).to("cpu")
    model.eval()

    t0 = time.time()
    batch_size = 16
    results = []

    for i in range(0, len(files), batch_size):
        batch_paths = files[i:i+batch_size]
        imgs = []
        valid_paths = []
        for p in batch_paths:
            try:
                im = Image.open(p).convert("RGB")
                imgs.append(im)
                valid_paths.append(p)
            except Exception as e:
                print(f"Error opening {p}: {e}")

        if not imgs:
            continue

        inputs = processor(images=imgs, return_tensors="pt")
        with torch.no_grad():
            logits = model(**inputs).logits
            probs = torch.softmax(logits, dim=-1)

        for path, prob in zip(valid_paths, probs):
            real_p = float(prob[0])
            fake_p = float(prob[1])
            results.append({
                "file": os.path.basename(path),
                "path": path,
                "real_prob": round(real_p, 4),
                "fake_prob": round(fake_p, 4),
                "verdict": "REAL" if real_p >= 0.5 else "FAKE"
            })
        print(f" Scanned {min(i+batch_size, len(files))}/{len(files)} images...")

    elapsed = time.time() - t0
    print(f"\nCompleted scan of {len(results)} images in {elapsed:.1f} seconds!")

    # Summary
    real_count = sum(1 for r in results if r["verdict"] == "REAL")
    fake_count = sum(1 for r in results if r["verdict"] == "FAKE")
    suspicious = [r for r in results if r["fake_prob"] > 0.05]

    print("\n" + "="*60)
    print("AUDIT SUMMARY:")
    print(f" Total Images Scanned: {len(results)}")
    print(f" Authentic (Real):     {real_count}")
    print(f" Flagged (Fake):       {fake_count}")
    print(f" Any with >5% fake:    {len(suspicious)}")
    print("="*60)

    if suspicious:
        print("\nImages with elevated fake probabilities (>5%):")
        for s in suspicious:
            print(f" • {s['file']}: Fake={s['fake_prob']*100:.1f}%, Real={s['real_prob']*100:.1f}% [{s['verdict']}]")

    with open(output_json, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nFull results saved to {output_json}")

if __name__ == "__main__":
    folder = r"E:\UNIV Friends - Copy"
    run_batch_scan(folder)
