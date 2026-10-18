import os
import csv
import urllib.request
from scientific_forensic_detector import ScientificForensicDetector

detector = ScientificForensicDetector()

# Load 5 Real and 5 Fake from Kaggle dataset
csv_path = r'C:\Users\warri\.cache\kagglehub\datasets\chuneeb\deepfake-detection-dataset-2026\versions\1\FINAL_DATASET.csv'
test_samples = []

os.makedirs('kaggle_test_cache', exist_ok=True)

with open(csv_path, encoding='utf-8') as f:
    r = csv.DictReader(f)
    reals = [row for row in r if row['label'] == 'REAL'][:5]
    f.seek(0)
    next(r)
    fakes = [row for row in r if row['label'] == 'FAKE'][:5]

for i, row in enumerate(reals):
    local_path = os.path.join('kaggle_test_cache', f'real_{i+1}.jpg')
    if not os.path.exists(local_path):
        try:
            urllib.request.urlretrieve(row['image_url'], local_path)
        except Exception as e:
            continue
    test_samples.append((local_path, 'REAL', row['fake_method']))

for i, row in enumerate(fakes):
    local_path = os.path.join('kaggle_test_cache', f'fake_{i+1}.jpg')
    if not os.path.exists(local_path):
        try:
            urllib.request.urlretrieve(row['image_url'], local_path)
        except Exception as e:
            continue
    test_samples.append((local_path, 'FAKE', row['fake_method']))

# Also add our benchmark images
if os.path.exists('sample_test.jpg'):
    test_samples.append(('sample_test.jpg', 'FAKE', 'Diffusion'))
if os.path.exists('ai_generated_face.jpg'):
    test_samples.append(('ai_generated_face.jpg', 'FAKE', 'Diffusion'))

print("="*110)
print(f"{'FILE':<26} | {'GROUND TRUTH':<12} | {'VERDICT':<26} | {'CONF':<8} | {'NYQUIST':<10} | {'NOISE':<8}")
print("="*110)

confidences = []
for path, gt, method in test_samples:
    try:
        res = detector.analyze(path)
        conf_str = res['confidence']
        conf_val = float(conf_str.replace('%', ''))
        confidences.append(conf_val)
        print(f"{os.path.basename(path):<26} | {gt:<12} | {res['verdict']:<26} | {conf_str:<8} | {res['metrics']['spectral_nyquist_energy']:<10.6f} | {res['metrics']['bg_sensor_noise_variance']:<8.2f}")
    except Exception as e:
        print(f"Error analyzing {path}: {e}")

print("="*110)
print(f"Confidence summary: min={min(confidences)}%, max={max(confidences)}%, unique values={len(set(confidences))}/{len(confidences)}")
