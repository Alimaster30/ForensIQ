import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, RefreshCw, FileCheck, Layers, FolderUp, Camera, Cpu, Wand2, ShieldAlert, Binary } from 'lucide-react';
import { SAMPLE_CASES } from '../data/sampleCases';
import type { ForensicCase } from '../data/sampleCases';
import { InteractiveSplitViewer } from './InteractiveSplitViewer';
import { ForensicMetricsPanel } from './ForensicMetricsPanel';
import { BatchAuditView } from './BatchAuditView';

interface WorkbenchViewProps {
  currentCase: ForensicCase;
  onSelectCase: (c: ForensicCase) => void;
}

export const WorkbenchView: React.FC<WorkbenchViewProps> = ({ currentCase, onSelectCase }) => {
  const [labMode, setLabMode] = useState<'single' | 'batch'>('single');
  const [analyzing, setAnalyzing] = useState(false);
  const [customCase, setCustomCase] = useState<ForensicCase | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeCase = customCase || currentCase;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    const imageUrl = URL.createObjectURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/detect', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const layers = data.visual_layers || {};
        const newCase: ForensicCase = {
          id: `custom-${Date.now()}`,
          title: file.name,
          subtitle: `User Uploaded Specimen (${(file.size / 1024).toFixed(0)} KB)`,
          verdict: data.verdict,
          confidence: data.confidence,
          metrics: {
            spectral_nyquist_energy: data.metrics.spectral_nyquist_energy,
            bg_sensor_noise_variance: data.metrics.bg_sensor_noise_variance,
            faceswap_prob: data.metrics.faceswap_prob,
            inference_ms: data.metrics.inference_ms,
            pipeline_tier: data.metrics.pipeline_tier,
            dqt_compression_scale: data.metrics.dqt_compression_scale,
          },
          reasons: data.reasons,
          summary: data.summary,
          originalImage: imageUrl,
          heatmapOverlay: layers.vit_overlay_url || imageUrl,
          fftSpectrumImage: layers.fft_spectrum_url || imageUrl,
          noiseResidualImage: layers.noise_residual_url || imageUrl,
          flaggedZones: [
            { zone: 'Spectral Nyquist Area', intensity: data.metrics.spectral_nyquist_energy > 0.0008 ? 0.92 : 0.15, description: 'Periodic high-frequency evaluation' },
            { zone: 'CMOS Shot Noise Residual', intensity: data.metrics.bg_sensor_noise_variance < 2.0 ? 0.88 : 0.20, description: 'Sensor substrate variance' }
          ]
        };
        setCustomCase(newCase);
        setLabMode('single');
        setAnalyzing(false);
      } else {
        alert('Forensic API returned an error: ' + res.statusText);
        setAnalyzing(false);
        return;
      }
    } catch (err) {
      console.error('Forensic backend connection error:', err);
      alert('Unable to connect to ForensIQ Python Backend at http://localhost:8000. Please ensure the backend server is running.');
      setAnalyzing(false);
      return;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pt-32 pb-24">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A1A1AA] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            <span>Laboratory Workbench</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#EDEDEF] leading-tight">
            Scientific Inspection Workbench
          </h1>
          <p className="text-sm text-[#A1A1AA] leading-relaxed">
            Drag and drop suspect media or select pre-analyzed benchmark specimens to interactively toggle ViT attention heatmaps, 2D Fourier spectra, and CMOS noise variance.
          </p>
        </div>

        {/* Action Controls & Single vs Batch Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Lab Mode Pill Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#15171C] rounded-2xl border border-white/[0.08]">
            <button
              onClick={() => setLabMode('single')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                labMode === 'single'
                  ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Single Specimen Lab</span>
            </button>
            <button
              onClick={() => setLabMode('batch')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition ${
                labMode === 'batch'
                  ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              <FolderUp className="w-3.5 h-3.5" />
              <span>Bulk Batch Audit</span>
            </button>
          </div>

          {/* Quick Single Upload Button */}
          {labMode === 'single' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={analyzing}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl btn-porcelain text-xs font-semibold disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#090A0C]" />
                    <span>Auditing Layers...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-[#090A0C]" />
                    <span>Upload New Image</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RENDER BATCH AUDIT VIEW OR SINGLE SPECIMEN VIEW */}
      {labMode === 'batch' ? (
        <BatchAuditView 
          onInspectCase={(c) => {
            setCustomCase(c);
            setLabMode('single');
          }}
        />
      ) : (
        <>
          {/* Benchmark Specimen Carousel / Selector */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#71717A] tracking-widest uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-white/70" />
                <span>Select Benchmark Specimen:</span>
              </span>
              {customCase && (
                <button
                  onClick={() => setCustomCase(null)}
                  className="text-xs font-mono text-white hover:underline"
                >
                  Reset to Benchmarks
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {SAMPLE_CASES.map((c) => {
                const isSelected = !customCase && activeCase.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCustomCase(null);
                      onSelectCase(c);
                    }}
                    className={`flex flex-col p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/30 shadow-lg scale-[1.01]'
                        : 'bg-white/[0.02] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          c.verdict.includes('AI GENERATED')
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : c.verdict.includes('AR RETOUCHING')
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {c.verdict.includes('AI GENERATED') ? 'SYNTHETIC' : c.verdict.includes('AR RETOUCHING') ? 'FILTER' : 'AUTHENTIC'}
                      </span>
                      <span className="text-[10px] font-mono text-[#71717A]">{c.confidence}</span>
                    </div>

                    <div className="flex items-center gap-2.5 w-full">
                      <img
                        src={c.originalImage}
                        alt={c.title}
                        className={`w-10 h-10 rounded-xl object-cover border shrink-0 bg-black transition-all ${
                          isSelected
                            ? c.verdict.includes('AI GENERATED')
                              ? 'border-rose-500/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                              : c.verdict.includes('AR RETOUCHING')
                              ? 'border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                              : 'border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                            : 'border-white/10'
                        }`}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs font-medium text-[#EDEDEF] truncate w-full">
                          {c.title}
                        </span>
                        <span className="text-[10px] text-[#71717A] font-mono truncate w-full mt-0.5">
                          Nyquist: {c.metrics.spectral_nyquist_energy.toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Dual-Column Workbench */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Draggable Split Canvas (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="double-bezel">
                <div className="double-bezel-inner p-3">
                  <InteractiveSplitViewer currentCase={activeCase} />
                </div>
              </div>

              {/* Qualitative Rationale Accordion */}
              <div className="p-6 rounded-2xl glass-panel flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider">
                    Forensic Rationale & Findings
                  </span>
                  <span className="text-xs font-mono text-[#EDEDEF]">
                    {activeCase.reasons.length} Mathematical Markers
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  {activeCase.reasons.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-black/25 border border-white/[0.05] text-xs text-[#EDEDEF]"
                    >
                      <FileCheck className="w-4 h-4 text-white/80 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Scientific Metrics Panel (5 cols) */}
            <div className="lg:col-span-5">
              <ForensicMetricsPanel currentCase={activeCase} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
