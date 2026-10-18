import os
import glob
import time
import json
import cv2
import numpy as np
from PIL import Image

def analyze_fft_nyquist(gray_img):
    h, w = gray_img.shape
    patch_size = 128
    nyquist_energies = []
    for y in range(0, h - patch_size + 1, 64):
        for x in range(0, w - patch_size + 1, 64):
            patch = gray_img[y:y+patch_size, x:x+patch_size].astype(np.float32)
            window = np.outer(np.hanning(patch_size), np.hanning(patch_size))
            patch_win = patch * window
            f = np.fft.fft2(patch_win)
            fshift = np.fft.fftshift(f)
            mag = np.abs(fshift)
            corners = (mag[:8, :8].mean() + mag[:8, -8:].mean() + mag[-8:, :8].mean() + mag[-8:, -8:].mean()) / 4.0
            center = mag[patch_size//2-4:patch_size//2+4, patch_size//2-4:patch_size//2+4].mean()
            nyquist_energies.append(corners / (center + 1e-6))
    return float(np.mean(nyquist_energies)) if nyquist_energies else 0.0

folder = r"E:\UNIV Friends - Copy"
files = [
    os.path.join(folder, f)
    for f in os.listdir(folder)
    if f.lower().endswith(('.jpg', '.jpeg', '.png'))
]

print(f"Auditing all {len(files)} images for synthetic AI artifacts...")
ai_flagged = []
real_images = []

t0 = time.time()
for idx, p in enumerate(files):
    fname = os.path.basename(p)
    img = cv2.imread(p, cv2.IMREAD_GRAYSCALE)
    if img is None:
        continue
    
    nyquist = analyze_fft_nyquist(img)
    # Background noise variance (corners)
    h, w = img.shape
    cs = max(15, min(h, w) // 12)
    corners = [img[:cs, :cs], img[:cs, w-cs:], img[h-cs:, :cs], img[h-cs:, w-cs:]]
    bg_var = float(np.mean([np.var(c) for c in corners]))
    
    # Check if flagged as AI
    # Criteria: Nyquist > 0.00085 or (Nyquist > 0.00075 and bg_var < 1.0)
    is_ai = nyquist > 0.00085 or (nyquist > 0.00075 and bg_var < 1.0)
    
    info = {
        "file": fname,
        "nyquist": round(nyquist, 6),
        "bg_var": round(bg_var, 2),
        "is_ai": is_ai
    }
    
    if is_ai:
        ai_flagged.append(info)
    else:
        real_images.append(info)
        
    if (idx + 1) % 25 == 0 or (idx + 1) == len(files):
        print(f" Progress: {idx+1}/{len(files)} checked...")

print(f"\nDone in {time.time()-t0:.1f}s!")
print("\n" + "="*60)
print(f"TOTAL IMAGES AUDITED: {len(files)}")
print(f" • REAL / AUTHENTIC:  {len(real_images)}")
print(f" • AI GENERATED:      {len(ai_flagged)}")
print("="*60)

if ai_flagged:
    print("\n[!] DETECTED AI GENERATED IMAGES:")
    for item in ai_flagged:
        print(f"  --> {item['file']}: Nyquist={item['nyquist']:.6f}, Background Noise={item['bg_var']}")

with open("full_folder_audit.json", "w") as f:
    json.dump({"ai_generated": ai_flagged, "real_count": len(real_images)}, f, indent=2)
