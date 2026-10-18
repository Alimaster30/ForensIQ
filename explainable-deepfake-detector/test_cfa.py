import cv2
import numpy as np

def measure_cfa_periodicity(img_path):
    img = cv2.imread(img_path)
    if img is None:
        return None
    # Use green channel which has highest sampling rate (50% in Bayer RGGB)
    g = img[:, :, 1].astype(np.float32)
    h, w = g.shape

    # Crop central region to avoid vignetting/letterboxing
    h_start, h_end = h // 4, 3 * h // 4
    w_start, w_end = w // 4, 3 * w // 4
    g_crop = g[h_start:h_end, w_start:w_end]

    # Predict G using simple cross interpolation (standard bilinear kernel)
    kernel = np.array([[0, 0.25, 0],
                       [0.25, 0, 0.25],
                       [0, 0.25, 0]], dtype=np.float32)
    g_pred = cv2.filter2D(g_crop, -1, kernel)
    res = np.abs(g_crop - g_pred)

    # Subdivide into 4 sub-lattices (2x2 grid)
    l00 = res[0::2, 0::2]
    l01 = res[0::2, 1::2]
    l10 = res[1::2, 0::2]
    l11 = res[1::2, 1::2]

    vars_lattice = [np.var(l00), np.var(l01), np.var(l10), np.var(l11)]
    min_v = min(vars_lattice)
    max_v = max(vars_lattice)
    cfa_ratio = max_v / (min_v + 1e-6)

    # Fourier peak energy at (pi, pi) of residual
    f_res = np.fft.fft2(res[:512, :512] if res.shape[0] >= 512 and res.shape[1] >= 512 else res)
    fshift = np.fft.fftshift(f_res)
    mag = np.abs(fshift)
    cy, cx = mag.shape[0] // 2, mag.shape[1] // 2
    # Check periodic demosaicing peak vs local neighborhood
    peak = mag[0, 0] + mag[0, -1] + mag[-1, 0] + mag[-1, -1]

    return {
        "cfa_ratio": round(float(cfa_ratio), 4),
        "lattice_vars": [round(float(v), 2) for v in vars_lattice]
    }

test_files = [
    ("REAL Portrait", r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792268053801_144ed7a2.png"),
    ("AI Portrait", r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792268443392_0a39a6a2.png"),
    ("REAL Snapchat Filter", r"E:\Mubashir\IMG-20241212-WA0053.jpg"),
    ("AI Trump Meme", r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792277252962_2ceb273e.png"),
    ("AI Milla Sofia", r"C:\Users\warri\.gemini\antigravity\brain\dc880d05-af74-436f-8fc5-59fdee4f5358\.user_uploaded\media_1792277754318_1c5f4fa2.jpg")
]

for label, path in test_files:
    res = measure_cfa_periodicity(path)
    print(f"{label:22} -> CFA Ratio: {res['cfa_ratio']:.4f} | Lattices: {res['lattice_vars']}")
