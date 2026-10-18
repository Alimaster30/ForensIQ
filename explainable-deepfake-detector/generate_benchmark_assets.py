import os
import shutil
import cv2
from PIL import Image
from scientific_forensic_detector import ScientificForensicDetector

BENCHMARK_SOURCES = [
    {
        "id": "case-01",
        "title": "Photorealistic AI Male Portrait",
        "path": r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792268443392_0a39a6a2.png"
    },
    {
        "id": "case-02",
        "title": "Authentic Smartphone Portrait",
        "path": r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792268053801_144ed7a2.png"
    },
    {
        "id": "case-03",
        "title": "Real Photo with Snapchat AR Lip Filter",
        "path": r"E:\Mubashir\IMG-20241212-WA0053.jpg"
    },
    {
        "id": "case-04",
        "title": "Viral Political Meme (President in Luxury Car)",
        "path": r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792277252962_2ceb273e.png"
    },
    {
        "id": "case-05",
        "title": "Virtual AI Influencer in Outdoor Patio",
        "path": r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792277754318_1c5f4fa2.jpg"
    }
]

TARGET_BASE = r"D:\Projects\Meso - 4\forensiq-ui\public\benchmarks"

detector = ScientificForensicDetector()
results_summary = []

for item in BENCHMARK_SOURCES:
    case_dir = os.path.join(TARGET_BASE, item["id"])
    os.makedirs(case_dir, exist_ok=True)

    print(f"\nProcessing {item['id']}: {item['title']}...")
    img = Image.open(item["path"]).convert("RGB")
    orig_target = os.path.join(case_dir, "original.jpg")
    img.save(orig_target, quality=92)

    # Analyze with detector
    res = detector.analyze(orig_target, output_dir=case_dir)

    results_summary.append({
        "id": item["id"],
        "title": item["title"],
        "verdict": res["verdict"],
        "confidence": res["confidence"],
        "metrics": res["metrics"],
        "reasons": res["reasons"],
        "summary": res["summary"],
        "originalImage": f"/benchmarks/{item['id']}/original.jpg",
        "heatmapOverlay": f"/benchmarks/{item['id']}/original_vit_overlay.jpg",
        "fftSpectrumImage": f"/benchmarks/{item['id']}/original_fft_spectrum.jpg",
        "noiseResidualImage": f"/benchmarks/{item['id']}/original_noise_residual.jpg"
    })
    print(f"Generated 4 real visual assets for {item['id']} successfully!")

import json
print("\n=== GENERATED BENCHMARK DATA SUMMARY ===")
print(json.dumps(results_summary, indent=2))

with open(r"D:\Projects\Meso - 4\explainable-deepfake-detector\generated_benchmarks.json", "w") as f:
    json.dump(results_summary, f, indent=2)

print("\nSaved generated_benchmarks.json successfully!")
