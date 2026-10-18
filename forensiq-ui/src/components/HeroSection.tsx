import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { UploadCloud, ArrowUpRight, Sparkles, Camera, Cpu, Wand2, ShieldAlert, Binary } from 'lucide-react';
import type { ForensicCase } from '../data/sampleCases';

interface HeroSectionProps {
  onSelectSample: (c: ForensicCase) => void;
  samples: ForensicCase[];
  onLaunchWorkbench: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectSample,
  samples,
  onLaunchWorkbench,
}) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-headline', {
        opacity: 0,
        y: 24,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
      });

      gsap.from('.hero-cta', {
        opacity: 0,
        y: 16,
        duration: 0.8,
        delay: 0.35,
        ease: 'power2.out',
      });

      gsap.from('.hero-dropzone', {
        opacity: 0,
        scale: 0.97,
        duration: 0.9,
        delay: 0.5,
        ease: 'power3.out',
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={heroRef} className="relative w-full pt-44 pb-24 px-4 flex flex-col items-center text-center overflow-hidden forensic-grid">
      {/* Subtle Diffused Illumination Cone (No Neon Blobs) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-white/[0.025] blur-[140px] rounded-full pointer-events-none"></div>

      {/* Main Headline Container (Strictly 2-Line Iron Rule) */}
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 relative z-10">
        <div className="hero-headline inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-[#A1A1AA]">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span>Scientific Image Authenticity Lab</span>
        </div>

        <h1 className="hero-headline font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#EDEDEF] max-w-5xl leading-[1.1]">
          See the mathematical evidence behind every pixel.
        </h1>

        <p className="hero-headline text-base sm:text-lg text-[#A1A1AA] max-w-2xl font-sans leading-relaxed">
          ForensIQ cuts through AI photorealism by interrogating 2D Fourier Nyquist frequencies, physical CMOS sensor shot noise, and Vision Transformer attention rollout.
        </p>

        {/* High-Contrast Porcelain & Glass CTAs */}
        <div className="hero-cta flex flex-wrap items-center justify-center gap-4 mt-2">
          <button
            onClick={onLaunchWorkbench}
            className="group flex items-center gap-3 pl-6 pr-2 py-2 rounded-full btn-porcelain text-xs font-semibold"
          >
            <span>Launch Forensic Workbench</span>
            <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="w-4 h-4 text-[#090A0C]" />
            </div>
          </button>
          <a
            href="#bento"
            className="px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-[#EDEDEF] text-xs font-medium border border-white/10 transition duration-300"
          >
            Explore Scientific Layers
          </a>
        </div>
      </div>

      {/* Double-Bezel Dropzone & Benchmark Specimen Selector */}
      <div className="hero-dropzone w-full max-w-4xl mx-auto mt-16 double-bezel relative z-10">
        <div className="double-bezel-inner p-8 flex flex-col items-center gap-6">
          <div 
            onClick={onLaunchWorkbench}
            className="w-full border border-dashed border-white/15 hover:border-white/30 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer group bg-black/20"
          >
            <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-300">
              <UploadCloud className="w-6 h-6 text-[#EDEDEF]" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-white">
                Drag and drop any suspect image to run full forensic audit
              </span>
              <span className="text-xs text-[#71717A] mt-1 font-mono">
                Supports JPEG, PNG, WebP up to 50MB. Analyzed locally in memory.
              </span>
            </div>
          </div>

          {/* Quick Benchmark Specimen Selector */}
          <div className="w-full flex flex-col items-start gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-white/70" />
              <span>Or test with a pre-analyzed benchmark specimen:</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 w-full">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    onSelectSample(s);
                    onLaunchWorkbench();
                  }}
                  className="flex flex-col items-start p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/20 transition text-left group"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-semibold ${
                      s.verdict.includes('AI GENERATED') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      s.verdict.includes('RETOUCHING') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {s.verdict.includes('AI GENERATED') ? 'SYNTHETIC' : s.verdict.includes('RETOUCHING') ? 'FILTER' : 'AUTHENTIC'}
                    </span>
                    <span className="text-[10px] font-mono text-[#71717A]">{s.confidence}</span>
                  </div>

                  <div className="flex items-center gap-2.5 w-full">
                    <img
                      src={s.originalImage}
                      alt={s.title}
                      className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0 bg-black"
                    />
                    <span className="text-xs font-medium text-[#EDEDEF] truncate w-full group-hover:text-white transition-colors">
                      {s.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
