import React from 'react';
import { Activity, Cpu, Layers, ShieldCheck } from 'lucide-react';

export const GaplessBentoGrid: React.FC = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-24 md:py-36">
      {/* Editorial Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div className="flex flex-col gap-3 max-w-2xl">
          <span className="text-xs font-mono tracking-widest text-[#71717A] uppercase">
            Scientific Foundations
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[#EDEDEF] leading-tight">
            Three immutable physical laws AI models fail to reproduce.
          </h2>
        </div>
        <p className="text-sm text-[#A1A1AA] max-w-sm leading-relaxed">
          Superficial classifiers inspect fragile skin textures. ForensIQ verifies physical optics, silicon sensor noise, and transformer attention mathematics.
        </p>
      </div>

      {/* Gapless Bento Grid with grid-flow-dense */}
      <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] grid-flow-dense gap-4">
        {/* Cell 1: 2D FFT Frequency Forensics (Spans 2 cols, 1 row) */}
        <div className="md:col-span-2 row-span-1 glass-panel rounded-2xl p-8 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
              <Activity className="w-4 h-4 text-[#EDEDEF]" />
            </div>
            <span className="text-xs font-mono text-[#71717A]">LAYER 01 / SPECTRAL</span>
          </div>

          <div className="relative z-10 max-w-lg">
            <h3 className="font-display text-xl font-bold text-white mb-2">
              Spectral Nyquist Checkerboard Analysis
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
              Neural network latent decoders and transposed convolutions generate periodic high-frequency checkerboard spikes at the 2D Fourier Nyquist corners. Physical camera lenses smoothly attenuate these extreme frequencies via optical diffraction.
            </p>
          </div>

          {/* Metric Pill Callout */}
          <div className="absolute bottom-6 right-6 z-10 px-3.5 py-1.5 rounded-lg bg-black/40 border border-white/10 font-mono text-xs text-[#EDEDEF]">
            Threshold: &gt; 0.000800
          </div>
        </div>

        {/* Cell 2: CMOS Sensor Noise Floor (Spans 1 col, 2 rows) */}
        <div className="md:col-span-1 md:row-span-2 glass-panel rounded-2xl p-8 relative overflow-hidden group flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between relative z-10 mb-6">
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4 text-[#EDEDEF]" />
              </div>
              <span className="text-xs font-mono text-[#71717A]">LAYER 02 / SENSOR</span>
            </div>

            <h3 className="font-display text-xl font-bold text-white mb-3">
              Physical CMOS Sensor Shot Noise
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed mb-6">
              Every camera sensor captures Poisson-Gaussian photon shot noise uniformly across the silicon substrate. AI generators output mathematical voids with zero camera noise variance.
            </p>
          </div>

          {/* Visual Sensor Graph Mock */}
          <div className="p-4 rounded-xl bg-black/30 border border-white/[0.06] font-mono text-xs flex flex-col gap-2">
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Real Camera:</span>
              <span className="text-emerald-400 font-bold">218.76 (Authentic)</span>
            </div>
            <div className="flex justify-between text-[#A1A1AA]">
              <span>Synthetic Void:</span>
              <span className="text-rose-400 font-bold">0.00 (Sterile)</span>
            </div>
          </div>
        </div>

        {/* Cell 3: ViT Attention Rollout (Spans 1 col, 1 row) */}
        <div className="md:col-span-1 row-span-1 glass-panel rounded-2xl p-8 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
              <Layers className="w-4 h-4 text-[#EDEDEF]" />
            </div>
            <span className="text-xs font-mono text-[#71717A]">LAYER 03 / ATTENTION</span>
          </div>

          <h3 className="font-display text-xl font-bold text-white mb-2">
            ViT Splicing Attention
          </h3>
          <p className="text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
            Self-attention rollout across 16x16 transformer patches exposes boundary cutlines and localized facial manipulation halos.
          </p>
        </div>

        {/* Cell 4: Empirical Benchmark Validation (Spans 1 col, 1 row) */}
        <div className="md:col-span-1 row-span-1 glass-panel rounded-2xl p-8 relative overflow-hidden group">
          <div className="flex items-start justify-between relative z-10 mb-4">
            <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4 text-[#EDEDEF]" />
            </div>
            <span className="text-xs font-mono text-[#71717A]">CORPUS BENCHMARK</span>
          </div>

          <div className="font-mono text-2xl font-bold text-[#EDEDEF] mb-1">
            134 Specimens
          </div>
          <h4 className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider mb-2">
            Empirically Calibrated
          </h4>
          <p className="text-xs text-[#71717A] leading-relaxed">
            Tested across Midjourney v6, Flux, Stable Diffusion, smartphone optical captures, and localized AR beauty filter overlays.
          </p>
        </div>
      </div>
    </section>
  );
};
