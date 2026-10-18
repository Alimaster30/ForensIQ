import React, { useState } from 'react';
import { Terminal, Copy, Check, Activity, Cpu, Layers, Play, RefreshCw, CheckCircle2 } from 'lucide-react';

export const DeveloperApiView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'python' | 'curl' | 'fastapi' | 'fetch'>('python');
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const snippets = {
    python: `# Install dependencies: pip install torch torchvision opencv-python numpy
from scientific_forensic_detector import ScientificForensicDetector

# Initialize the 3-layer scientific forensic engine
detector = ScientificForensicDetector()

# Analyze suspect image with Nyquist 2D FFT, CMOS sensor noise, and ViT rollout
result = detector.analyze(
    image_path="evidence.jpg",
    output_dir="outputs"
)

print(f"Forensic Verdict: {result['verdict']} ({result['confidence']})")
print(f"Pipeline Tier:    {result['metrics'].get('pipeline_tier')}")
print(f"Inference Latency: {result['metrics'].get('inference_ms')} ms")
print(f"2D FFT Nyquist:   {result['metrics']['spectral_nyquist_energy']:.6f}")
print(f"CMOS Noise Floor: {result['metrics']['bg_sensor_noise_variance']:.2f}")

for reason in result['reasons']:
    print(f"- {reason}")`,

    curl: `# Upload any image to the ForensIQ REST service
curl -X POST "http://localhost:8000/api/detect" \\
  -H "Accept: application/json" \\
  -F "file=@/path/to/suspect_portrait.jpg"

# Sample JSON Response:
# {
#   "status": "success",
#   "verdict": "AI GENERATED (SYNTHETIC)",
#   "confidence": "98.5%",
#   "metrics": {
#     "pipeline_tier": "Tier 0 (Fast Physical Optics & Fourier Triage)",
#     "inference_ms": 18.9,
#     "spectral_nyquist_energy": 0.001294,
#     "bg_sensor_noise_variance": 0.00,
#     "dqt_compression_scale": 1.00
#   },
#   "reasons": [
#     "Spectral Nyquist checkerboard energy exceeds natural camera ceiling (<0.000600)."
#   ]
# }`,

    fastapi: `from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from scientific_forensic_detector import ScientificForensicDetector
import tempfile, os

app = FastAPI(title="ForensIQ API", version="2.4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = ScientificForensicDetector()

@app.post("/api/detect")
async def detect_image(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = detector.analyze(tmp_path, output_dir="outputs")
        return {"status": "success", "filename": file.filename, **result}
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)`,

    fetch: `// Modern TypeScript / JavaScript client execution
async function analyzeEvidence(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:8000/api/detect', {
    method: 'POST',
    body: formData,
  });

  const forensicResult = await response.json();
  console.log('Verdict:', forensicResult.verdict);
  console.log('Tier:', forensicResult.metrics.pipeline_tier);
  console.log('Latency:', forensicResult.metrics.inference_ms, 'ms');
  return forensicResult;
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const testHealthEndpoint = async () => {
    setTestStatus('loading');
    const start = performance.now();
    try {
      const res = await fetch('http://localhost:8000/api/health');
      const elapsed = performance.now() - start;
      setLatency(elapsed);
      if (res.ok) {
        const json = await res.json();
        setTestOutput(JSON.stringify(json, null, 2));
        setTestStatus('success');
      } else {
        setTestOutput(`HTTP Error: ${res.status} ${res.statusText}`);
        setTestStatus('error');
      }
    } catch {
      setTestOutput('Connection failed: Ensure Python backend is running on http://127.0.0.1:8000');
      setTestStatus('error');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-32 pb-24">
      {/* Header */}
      <div className="flex flex-col gap-3 max-w-2xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A1A1AA] w-fit">
          <Terminal className="w-3.5 h-3.5 text-white/80" />
          <span>Developer SDK & Headless Integration</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#EDEDEF] leading-tight">
          Integrate ForensIQ into any production pipeline.
        </h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          Embed explainable forensic evaluation directly into moderation workflows, legal evidence ingestion pipelines, or identity verification microservices.
        </p>
      </div>

      {/* Code Snippet Box */}
      <div className="glass-panel rounded-2xl overflow-hidden mb-12">
        {/* Terminal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-[#121317] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
            <span className="ml-3 font-mono text-xs text-[#71717A]">forensiq-client-sdk</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#18191F] p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveTab('python')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeTab === 'python' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Python SDK
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeTab === 'curl' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                cURL
              </button>
              <button
                onClick={() => setActiveTab('fastapi')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeTab === 'fastapi' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                FastAPI Server
              </button>
              <button
                onClick={() => setActiveTab('fetch')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
                  activeTab === 'fetch' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                TypeScript / Fetch
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-mono text-white transition hover:border-white/25"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A1A1AA]" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <pre className="p-6 overflow-x-auto text-xs font-mono text-[#EDEDEF] bg-[#0A0B0E] leading-relaxed">
          <code>{snippets[activeTab]}</code>
        </pre>
      </div>

      {/* Live API Health & Sandbox Probe */}
      <div className="p-6 rounded-2xl glass-panel border border-white/[0.06] mb-16 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div className="flex flex-col gap-1">
            <span className="font-display text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Live Endpoint Sandbox
            </span>
            <span className="text-xs text-[#A1A1AA]">
              Test connectivity to the local FastAPI microservice running on <code className="font-mono text-white">http://localhost:8000</code>
            </span>
          </div>

          <button
            onClick={testHealthEndpoint}
            disabled={testStatus === 'loading'}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-porcelain text-xs font-semibold self-start sm:self-auto disabled:opacity-50"
          >
            {testStatus === 'loading' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#090A0C]" />
                <span>Pinging Engine...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[#090A0C] fill-[#090A0C]" />
                <span>Ping GET /api/health</span>
              </>
            )}
          </button>
        </div>

        {testOutput && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#71717A]">
              <span className="flex items-center gap-2">
                {testStatus === 'success' ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    200 OK
                  </span>
                ) : (
                  <span className="text-rose-400">Connection Failed</span>
                )}
              </span>
              {latency && <span>RTT: {latency.toFixed(1)} ms</span>}
            </div>
            <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-xs text-white overflow-x-auto">
              <code>{testOutput}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Response Schema Reference Grid */}
      <div className="flex flex-col gap-6">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#EDEDEF]">
          Output Schema & Mathematical Thresholds
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
              <Activity className="w-4 h-4 text-[#EDEDEF]" />
            </div>
            <div className="font-mono text-sm font-bold text-white">
              spectral_nyquist_energy
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Energy ratio concentrated at high-frequency corners of 2D Fourier shift. Real camera lenses keep values below <span className="font-mono text-emerald-400">0.000600</span>. Neural latent decoders spike above <span className="font-mono text-rose-400">0.000800</span>.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
              <Cpu className="w-4 h-4 text-[#EDEDEF]" />
            </div>
            <div className="font-mono text-sm font-bold text-white">
              bg_sensor_noise_variance
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Physical CMOS silicon Poisson-Gaussian photon shot noise floor. Natural smartphone camera sensors exhibit noise variance above <span className="font-mono text-emerald-400">2.0</span>. Pure synthetic diffusion models output mathematical sterility approaching <span className="font-mono text-rose-400">0.00</span>.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-panel flex flex-col gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
              <Layers className="w-4 h-4 text-[#EDEDEF]" />
            </div>
            <div className="font-mono text-sm font-bold text-white">
              faceswap_prob & local_anomaly
            </div>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Self-attention rollout across 16x16 transformer patches. Exposes boundary blending cutlines around the jawline, hair transitions, and localized AR beauty filter discontinuities (e.g. 24x lip gradient spikes).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
