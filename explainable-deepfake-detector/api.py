import os
import shutil
import tempfile
import base64
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from scientific_forensic_detector import ScientificForensicDetector

app = FastAPI(
    title="ForensIQ API",
    description="Explainable Scientific AI Image & Deepfake Forensics Service",
    version="2.4.0"
)

# Enable CORS for local and web frontends
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure outputs directory exists
OUTPUTS_DIR = Path(__file__).parent / "outputs"
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/reports", StaticFiles(directory=str(OUTPUTS_DIR)), name="reports")

# Initialize the detector once on startup
detector = None

@app.on_event("startup")
def startup_event():
    global detector
    print("Initializing ScientificForensicDetector core...")
    detector = ScientificForensicDetector()
    print("ForensIQ forensic core loaded and ready.")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ForensIQ Scientific Forensics",
        "version": "2.5.0",
        "pipelines": [
            "Generative AI Vision Transformer (Diffusion/GAN)",
            "2D Fourier Nyquist Spectral Analysis",
            "CMOS Silicon Sensor Shot Noise Variance",
            "ViT Transformer Self-Attention Rollout"
        ]
    }

@app.post("/api/detect")
async def detect_image(file: UploadFile = File(...)):
    global detector
    if detector is None:
        detector = ScientificForensicDetector()

    # Validate image extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".jfif"}
    filename = file.filename or "upload.jpg"
    ext = Path(filename).suffix.lower()
    if not ext or ext not in allowed_extensions:
        # Default to .jpg if missing or unknown
        ext = ".jpg"

    content = await file.read()
    if not content or len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Save incoming upload to temporary file using mkstemp (Windows lock-safe)
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=ext)
    with os.fdopen(tmp_fd, "wb") as f_out:
        f_out.write(content)

    try:
        # Run scientific analysis with deep ViT attention rollout
        result = detector.analyze(tmp_path, output_dir=str(OUTPUTS_DIR), deep_scan=True)
        layers = result.get("visual_layers", {})

        def get_layer_uri(p):
            if p and os.path.exists(p):
                try:
                    with open(p, "rb") as img_file:
                        encoded = base64.b64encode(img_file.read()).decode("utf-8")
                        return f"data:image/jpeg;base64,{encoded}"
                except Exception:
                    return f"http://localhost:8000/reports/{os.path.basename(p)}"
            return None

        vit_overlay_url = get_layer_uri(layers.get("vit_overlay"))
        fft_spectrum_url = get_layer_uri(layers.get("fft_spectrum"))
        noise_residual_url = get_layer_uri(layers.get("noise_residual"))
        full_report_url = get_layer_uri(layers.get("full_report"))

        return {
            "status": "success",
            "filename": filename,
            "verdict": result.get("verdict"),
            "confidence": result.get("confidence"),
            "metrics": result.get("metrics"),
            "reasons": result.get("reasons"),
            "summary": result.get("summary"),
            "report_url": full_report_url,
            "visual_layers": {
                "vit_overlay_url": vit_overlay_url,
                "fft_spectrum_url": fft_spectrum_url,
                "noise_residual_url": noise_residual_url,
                "full_report_url": full_report_url
            }
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
