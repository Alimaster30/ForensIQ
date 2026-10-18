import time
from scientific_forensic_detector import ScientificForensicDetector

detector = ScientificForensicDetector()
test_img = r"D:\Projects\Meso - 4\explainable-deepfake-detector\sample_test.jpg"

# Benchmark current unoptimized execution
t0 = time.time()
res_full = detector.analyze(test_img)
t_full = time.time() - t0
print(f"Full pipeline time (including ViT): {t_full*1000:.1f} ms")

# Benchmark Tier 0 (Physics only)
import cv2
t0 = time.time()
img_bgr = cv2.imread(test_img)
gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
nyquist = detector.analyze_fft_nyquist(gray)
noise = detector.analyze_sensor_noise(gray)
t_physics = time.time() - t0
print(f"Tier 0 Physics time: {t_physics*1000:.1f} ms")
print(f"Speedup factor: {t_full / t_physics:.1f}x faster!")
