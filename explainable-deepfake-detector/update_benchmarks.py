import os
import requests
import json
from PIL import Image
from scientific_forensic_detector import ScientificForensicDetector

BENCHMARKS = [
    {
        "id": "case-01",
        "title": "Authentic Smartphone Portrait",
        "subtitle": "Natural optical camera capture against interior wall",
        "url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
        "verdict": "AUTHENTIC REAL PHOTO"
    },
    {
        "id": "case-02",
        "title": "Photorealistic AI Male Portrait",
        "subtitle": "Generated via Latent Diffusion (Midjourney/Flux)",
        "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        "verdict": "AI GENERATED (SYNTHETIC)"
    },
    {
        "id": "case-03",
        "title": "Real Photo with Snapchat AR Lip Filter",
        "subtitle": "Camera portrait with localized digital makeup overlay",
        "url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        "verdict": "AUTHENTIC WITH AR RETOUCHING"
    },
    {
        "id": "case-04",
        "title": "Viral Political Meme (President in Luxury Car)",
        "subtitle": "Synthetic generation circulated on social media",
        "url": "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
        "verdict": "AI GENERATED (SYNTHETIC)"
    },
    {
        "id": "case-05",
        "title": "Virtual AI Influencer in Outdoor Patio",
        "subtitle": "Stable Diffusion / SDXL synthetic influencer persona",
        "url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        "verdict": "AI GENERATED (SYNTHETIC)"
    }
]

detector = ScientificForensicDetector()
results = []

for b in BENCHMARKS:
    out_dir = os.path.abspath(f"../forensiq-ui/public/benchmarks/{b['id']}")
    os.makedirs(out_dir, exist_ok=True)
    img_path = os.path.join(out_dir, "original.jpg")
    
    print(f"Downloading {b['id']} from Unsplash...")
    resp = requests.get(b['url'], timeout=15)
    with open(img_path, "wb") as f:
        f.write(resp.content)
    
    print(f"Analyzing {b['id']} with ScientificForensicDetector...")
    res = detector.analyze(img_path, output_dir=out_dir)
    res["id"] = b["id"]
    res["title"] = b["title"]
    res["subtitle"] = b["subtitle"]
    results.append(res)
    print(f"Done {b['id']}: {res['verdict']} ({res['confidence']})")

with open("benchmark_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("All 5 benchmarks downloaded and processed successfully.")
