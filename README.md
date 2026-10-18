# ForensIQ

> **Scientific & Explainable Deepfake Forensics Platform**  
> Physical optics, 2D Fourier Nyquist spectral analysis, and multi-scale Vision Transformer attention rollout for verifiable synthetic media detection.

---

## Overview

**ForensIQ** is a dual-tier, explainable forensic suite designed to detect and explain AI-generated synthetic imagery and face-swap manipulations. Rather than relying solely on black-box neural network predictions, ForensIQ grounds its verdicts in physical camera optical constraints, frequency domain periodic harmonics, and continuous Bayesian evidence calibration.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INPUT IMAGE / SPECIMEN                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│     TIER 0: OPTICAL PHYSICS     │             │       TIER 1: DEEP VIT          │
├─────────────────────────────────┤             ├─────────────────────────────────┤
│ • 2D FFT Nyquist Checkerboard   │             │ • Vision Transformer Attention  │
│ • CMOS Silicon Sensor Noise     │             │ • Facial Perimeter Splicing     │
│ • Dynamic JPEG DQT Compensation │             │ • Localized Gradient Anomaly    │
└────────────────┬────────────────┘             └────────────────┬────────────────┘
                 │                                               │
                 └───────────────────────┬───────────────────────┘
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │    CONTINUOUS BAYESIAN EVIDENCE CALIBRATION   │
                 ├───────────────────────────────────────────────┤
                 │ • Multi-sensor likelihood synthesis           │
                 │ • Continuous distribution (no plateaus)       │
                 │ • SHA-256 Cryptographic Evidence Ledger       │
                 └───────────────────────────────────────────────┘
```

---

## Core Capabilities

### 1. Dual-Tier Forensic Pipeline
* **Tier 0: Fast Physical Optics & Fourier Triage (<20ms)**
  * **2D Fast Fourier Transform (FFT)**: Identifies high-frequency periodic grid spikes and spectral checkerboard patterns caused by transposed-convolution upsampling in latent diffusion decoders (Stable Diffusion, Midjourney, Flux, GANs).
  * **Poisson-Gaussian CMOS Sensor Noise Floor**: Measures authentic photon shot noise variance ($\sigma^2$) across high-frequency residuals. Digital generators produce sterile sensor voids ($\sigma^2 < 1.0$), while authentic camera sensors generate continuous physical noise floors.
  * **Dynamic JPEG Quantization Compensation**: Extracts Discrete Cosine Transform (DCT) luminance high-frequency quantization values to adaptively normalize thresholds against web re-compression.
* **Tier 1: Multi-Scale Vision Transformer (ViT) Attention Rollout**
  * Pinpoints facial boundary splicing anomalies and attention halos along facial contours typical of DeepFaceLab, FaceSwap, and Roop.

### 2. Continuous Bayesian Evidence Calibration
* Replaces legacy hard clamping plateaus with a continuous multi-sensor likelihood function.
* Factors in Nyquist excess ratio, CMOS sensor noise floor void coefficients, and ViT boundary log-odds to yield realistic confidence scores across all specimen types.

### 3. Zero-Latency Interactive Split Inspector
* **Zero-Reflow Tracking**: Caches viewport bounding geometry on pointer activation and batches updates with `requestAnimationFrame` for 120Hz monitor synchronization.
* **4 Forensic Inspection Modes**:
  1. **Vertical Split Wipe** — Precision comparison with porcelain handle.
  2. **Horizontal Split Wipe** — Top-to-bottom boundary scan.
  3. **Alpha Opacity Blend** — Dynamic cross-fade between original and forensic overlay.
  4. **Optical Strobe** — High-frequency flicker comparison for ocular anomaly detection.
* **Multi-Layer Visualization**: Instant toggle between ViT Attention Heatmap, 2D FFT Nyquist Spectrum (Inferno Colormap), and CMOS Sensor Residual (Viridis Colormap).

### 4. Forensic Evidence Ledger & Export
* Cryptographic dossier generation with SHA-256 hash fingerprints for chain-of-custody tracking.
* Direct Markdown Evidence Ledger copy and formatted PDF export.

---

## Repository Structure

```
ForensIQ/
├── forensiq-ui/                   # Frontend Web Application
│   ├── src/
│   │   ├── components/            # UI components (SplitViewer, Workbench, Navbar, etc.)
│   │   ├── data/                  # Verified sample cases & audit history
│   │   ├── hooks/                 # Smooth scroll (Lenis) & GSAP hooks
│   │   └── App.tsx                # Main view orchestrator
│   ├── public/                    # Static assets & benchmark specimen sets
│   ├── package.json
│   └── vite.config.ts
│
├── explainable-deepfake-detector/ # Python Forensic Backend & Core Engine
│   ├── scientific_forensic_detector.py # Core physics & ViT forensic detector
│   ├── run_api.py                 # FastAPI backend server
│   ├── requirements.txt           # Python dependencies
│   └── outputs/                   # Generated diagnostic reports & overlays
│
└── .gitignore                     # Root gitignore protecting dependencies & caches
```

---

## Quickstart

### Prerequisites
* **Node.js**: v18+ and `npm`
* **Python**: 3.10+ (with virtual environment support)

---

### 1. Launch Backend API Server

```bash
cd explainable-deepfake-detector

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate      # Windows
source venv/bin/activate    # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI engine (Port 8000)
python run_api.py
```

Check health status:
```bash
curl http://127.0.0.1:8000/api/health
```

---

### 2. Launch Frontend Application

```bash
cd forensiq-ui

# Install dependencies
npm install

# Start Vite dev server (Port 5173)
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## API Reference

### Analyze Image
`POST /api/detect`

**Request:** `multipart/form-data` with `file: <binary image>`

**Response Example:**
```json
{
  "status": "success",
  "filename": "specimen_01.jpg",
  "verdict": "AUTHENTIC REAL PHOTO",
  "confidence": "93.3%",
  "metrics": {
    "spectral_nyquist_energy": 0.000398,
    "bg_sensor_noise_variance": 219.22,
    "faceswap_prob": 0.0074,
    "dqt_compression_scale": 1.0,
    "inference_ms": 18.2,
    "pipeline_tier": "Tier 0 (Fast Physical Optics & Fourier Triage)"
  },
  "reasons": [
    "Normal optical lens rolloff (0.000398): No neural upsampler checkerboard grid artifacts detected.",
    "Physical CMOS sensor shot noise present (Noise variance: 219.22): Consistent with natural optical camera capture."
  ],
  "visual_layers": {
    "vit_overlay_url": "http://localhost:8000/reports/tmp_vit_overlay.jpg",
    "fft_spectrum_url": "http://localhost:8000/reports/tmp_fft_spectrum.jpg",
    "noise_residual_url": "http://localhost:8000/reports/tmp_noise_residual.jpg",
    "full_report_url": "http://localhost:8000/reports/tmp_forensic_report.jpg"
  }
}
```

---

## Design System Directives

ForensIQ adheres to an Obsidian & Porcelain aesthetic:
* **Background Surface**: `#090A0C` obsidian glass
* **Borders**: `.double-bezel` concentric micro-borders with subtle white alpha transparencies
* **Buttons**: Porcelain-white CTAs (`.btn-porcelain`) with nested trailing action chips
* **Typography**: Space Grotesk (display), Geist (body), JetBrains Mono (forensic telemetry)
* **Zero Emojis**: Strictly technical, military-scientific typographic icons.

---

## License

MIT License. Designed and engineered for transparent, verifiable digital media authentication.
