import React from 'react';
import { ScanEye } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'landing' | 'workbench' | 'history' | 'api') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#090A0C]/90 backdrop-blur-md pt-16 pb-12 mt-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand & Mission */}
          <div className="flex flex-col gap-4 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white">
                <ScanEye className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-white">ForensIQ</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-[#A1A1AA] border border-white/10 font-medium">
                2.4
              </span>
            </div>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Open-source scientific image forensics platform combining 2D Fourier Nyquist frequency analysis, CMOS sensor shot noise variance, and Vision Transformer attention rollout.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs font-mono">
            <div className="flex flex-col gap-3">
              <span className="text-[#EDEDEF] font-semibold uppercase tracking-wider text-[11px]">System</span>
              <button onClick={() => onNavigate('landing')} className="text-[#71717A] hover:text-white text-left transition">Overview</button>
              <button onClick={() => onNavigate('workbench')} className="text-[#71717A] hover:text-white text-left transition">Workbench Lab</button>
              <button onClick={() => onNavigate('history')} className="text-[#71717A] hover:text-white text-left transition">Audit Corpus</button>
              <button onClick={() => onNavigate('api')} className="text-[#71717A] hover:text-white text-left transition">Developer API</button>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[#EDEDEF] font-semibold uppercase tracking-wider text-[11px]">Scientific Layers</span>
              <span className="text-[#71717A]">2D FFT Nyquist</span>
              <span className="text-[#71717A]">CMOS Noise Floor</span>
              <span className="text-[#71717A]">ViT Transformer Rollout</span>
              <span className="text-[#71717A]">Laplacian Gradient</span>
            </div>

            <div className="flex flex-col gap-3">
              <span className="text-[#EDEDEF] font-semibold uppercase tracking-wider text-[11px]">Integrations</span>
              <span className="text-[#71717A]">Python 3.10+ SDK</span>
              <span className="text-[#71717A]">FastAPI Microservice</span>
              <span className="text-[#71717A]">PyTorch / Torchvision</span>
              <span className="text-[#71717A]">OpenCV C++ Engine</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.05] text-xs text-[#71717A] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>All 3 Forensic Inference Pipelines Active</span>
          </div>
          <div>
            Pure Scientific Forensics. Zero Synthetic Slop.
          </div>
        </div>
      </div>
    </footer>
  );
};
