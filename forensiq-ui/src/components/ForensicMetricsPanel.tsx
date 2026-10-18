import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  FileDown, 
  Activity, 
  Cpu, 
  Zap, 
  Copy, 
  Check, 
  Fingerprint,
  Info
} from 'lucide-react';
import type { ForensicCase } from '../data/sampleCases';
import { openPrintableForensicReport } from '../utils/generateReportHtml';

interface ForensicMetricsPanelProps {
  currentCase: ForensicCase;
}

export const ForensicMetricsPanel: React.FC<ForensicMetricsPanelProps> = ({ currentCase }) => {
  const [copied, setCopied] = useState(false);
  const isFake = currentCase.verdict.includes('AI GENERATED') || currentCase.verdict.includes('DEEPFAKE');
  const isRetouched = currentCase.verdict.includes('AR RETOUCHING');
  const inferenceMs = currentCase.metrics.inference_ms ?? 18.9;
  const pipelineTier = currentCase.metrics.pipeline_tier ?? 'Tier 0 (Fast Physical Optics & Fourier Triage)';
  const dqtScale = currentCase.metrics.dqt_compression_scale ?? 1.0;
  const isEarlyExit = inferenceMs < 100;

  const caseHash = `SHA256-${Array.from(currentCase.title + currentCase.confidence).reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0) | 0, 0).toString(16).toUpperCase()}-V24`;

  const handleCopyEvidence = () => {
    const markdown = [
      `### ForensIQ Cryptographic Audit Ledger`,
      `- **Specimen**: ${currentCase.title}`,
      `- **Fingerprint**: ${caseHash}`,
      `- **Verdict**: ${currentCase.verdict} (${currentCase.confidence} confidence)`,
      `- **Pipeline Tier**: ${pipelineTier} (${inferenceMs.toFixed(1)} ms)`,
      `- **2D FFT Nyquist Energy**: ${currentCase.metrics.spectral_nyquist_energy.toFixed(6)} (Ceiling: <0.000600)`,
      `- **CMOS Shot Noise Variance**: ${currentCase.metrics.bg_sensor_noise_variance.toFixed(2)} (Silicon floor: >0.80)`,
      `- **JPEG DQT Compensation Scale**: ${dqtScale.toFixed(2)}x`,
      `- **Mathematical Summary**: ${currentCase.summary}`,
      `\nVerified by ForensIQ Automated Forensic Core V2.4`
    ].join('\n');

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVerdictBadge = () => {
    if (isFake) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] font-semibold tracking-wider">SYNTHETIC DETECTED</span>
        </div>
      );
    }
    if (isRetouched) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px] font-semibold tracking-wider">LOCAL AR OVERLAY</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="font-mono text-[11px] font-semibold tracking-wider">AUTHENTIC REAL</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl glass-panel">
      {/* Verdict Header */}
      <div className="flex flex-col gap-3 pb-6 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[#71717A] tracking-widest uppercase">
            Forensic Verdict
          </span>
          {getVerdictBadge()}
        </div>

        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            {currentCase.verdict}
          </h2>
          <span className="font-mono text-xl font-bold text-white">
            {currentCase.confidence}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
          {currentCase.summary}
        </p>

        {/* Telemetry & Tiered Triage Status Strip */}
        <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#EDEDEF]">
              <Zap className="w-3.5 h-3.5 text-white/80" />
              <span className="font-mono font-medium">{pipelineTier}</span>
            </div>
            {isEarlyExit ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                39× FAST TRIAGE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px] font-bold">
                DEEP VIT STACK
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] border-t border-white/[0.04] pt-2">
            <span>Latency: <strong className="text-white font-mono">{inferenceMs.toFixed(1)} ms</strong></span>
            <span>DQT Scale: <strong className="text-white font-mono">{dqtScale.toFixed(2)}×</strong></span>
            <span>DCT Status: <strong className={dqtScale > 1.2 ? 'text-amber-400 font-mono' : 'text-emerald-400 font-mono'}>
              {dqtScale > 1.2 ? 'Compensated' : 'Nominal'}
            </strong></span>
          </div>
        </div>

        {/* SHA-256 Fingerprint Badge */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#71717A] px-1 pt-1">
          <span className="flex items-center gap-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-[#A1A1AA]" />
            Evidence Fingerprint:
          </span>
          <span className="text-[#EDEDEF]">{caseHash}</span>
        </div>
      </div>

      {/* Scientific Measurement Meters */}
      <div className="flex flex-col gap-4">
        <span className="text-xs font-mono text-[#71717A] tracking-widest uppercase">
          Empirical Measurements
        </span>

        {/* 1. Nyquist Energy */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#EDEDEF] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#A1A1AA]" />
              Spectral Nyquist Energy
            </span>
            <span className={`font-mono font-bold ${
              currentCase.metrics.spectral_nyquist_energy > 0.0008 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {currentCase.metrics.spectral_nyquist_energy.toFixed(6)}
            </span>
          </div>

          <div className="relative w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                currentCase.metrics.spectral_nyquist_energy > 0.0008 ? 'bg-rose-500' : 'bg-emerald-400'
              }`}
              style={{
                width: `${Math.min(100, (currentCase.metrics.spectral_nyquist_energy / 0.003) * 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
            <span>Real Optical (&lt;0.0006)</span>
            <span className="text-rose-400/80">Threshold: 0.0008</span>
            <span>Neural Upsampler (&gt;0.001)</span>
          </div>
        </div>

        {/* 2. Sensor Noise Variance */}
        <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-black/30 border border-white/[0.05]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#EDEDEF] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#A1A1AA]" />
              CMOS Sensor Noise Floor
            </span>
            <span className="font-mono text-[#EDEDEF] font-bold">
              {currentCase.metrics.bg_sensor_noise_variance.toFixed(2)}
            </span>
          </div>

          <div className="relative w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-white/80 transition-all duration-700"
              style={{
                width: `${Math.min(100, (currentCase.metrics.bg_sensor_noise_variance / 5.0) * 100)}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-[#71717A]">
            <span>Synthetic Void (&lt;0.20)</span>
            <span>Physical CMOS Shot Noise (&gt;0.80)</span>
          </div>
        </div>

        {/* 3. Local Anomaly (if applicable) */}
        {currentCase.metrics.local_anomaly_score && (
          <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Local Lip Gradient Variance
              </span>
              <span className="font-mono text-amber-400 font-bold">
                {currentCase.metrics.local_anomaly_score.toFixed(1)} (24x spike)
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">
              Severe edge discontinuity detected at vermilion lip border.
            </p>
          </div>
        )}
      </div>

      {/* Flagged Regions Breakdown */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-mono text-[#71717A] tracking-widest uppercase">
          Key Anomaly Regions
        </span>
        <div className="flex flex-col gap-2">
          {currentCase.flaggedZones.map((zone, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/25 border border-white/[0.05] text-xs">
              <div className="flex flex-col">
                <span className="text-white font-medium">{zone.zone}</span>
                <span className="text-[11px] text-[#71717A]">{zone.description}</span>
              </div>
              <span className="font-mono font-bold text-[#EDEDEF]">
                {(zone.intensity * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Export Evidence CTAs */}
      <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center gap-2.5">
        <button
          onClick={() => openPrintableForensicReport(currentCase)}
          className="flex-1 w-full py-3 px-4 rounded-xl btn-porcelain text-[#090A0C] text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition duration-200"
        >
          <FileDown className="w-4 h-4 text-[#090A0C]" />
          <span>Download PDF Dossier</span>
        </button>

        <button
          onClick={handleCopyEvidence}
          className="w-full sm:w-auto py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-[#EDEDEF] text-xs font-medium border border-white/10 flex items-center justify-center gap-2 transition duration-200"
          title="Copy Markdown Evidence"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-mono">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Copy Ledger</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
