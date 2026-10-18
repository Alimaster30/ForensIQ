import React, { useState } from 'react';
import { ScanEye, Terminal, History, Sliders, ArrowUpRight, Menu, X, Zap } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'workbench' | 'history' | 'api';
  onNavigate: (view: 'landing' | 'workbench' | 'history' | 'api') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: 'landing' | 'workbench' | 'history' | 'api') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-none">
      <nav className="glass-pill px-5 py-3 rounded-full flex items-center justify-between pointer-events-auto shadow-2xl">
        {/* Brand */}
        <button 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-105 group-hover:bg-white/10">
            <ScanEye className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base tracking-tight text-white">ForensIQ</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-[#A1A1AA] border border-white/10 font-medium">
                2.4
              </span>
            </div>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-[#15171C]/80 p-1 rounded-full border border-white/[0.06]">
          <button
            onClick={() => handleNavClick('landing')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === 'landing'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleNavClick('workbench')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === 'workbench'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Workbench
          </button>
          <button
            onClick={() => handleNavClick('history')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === 'history'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Corpus
          </button>
          <button
            onClick={() => handleNavClick('api')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              currentView === 'api'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            API & CLI
          </button>
        </div>

        {/* Action Button & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2">
          {/* Status Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>18ms Core</span>
          </div>

          <button
            onClick={() => handleNavClick('workbench')}
            className="group flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full btn-porcelain text-xs font-semibold"
          >
            <span>Launch Lab</span>
            <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-[#090A0C]" />
            </div>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10 transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-3xl glass-panel border border-white/10 pointer-events-auto flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <button
            onClick={() => handleNavClick('landing')}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition ${
              currentView === 'landing' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#EDEDEF] hover:bg-white/[0.05]'
            }`}
          >
            <span>Overview</span>
          </button>
          <button
            onClick={() => handleNavClick('workbench')}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition ${
              currentView === 'workbench' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#EDEDEF] hover:bg-white/[0.05]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#A1A1AA]" />
              Workbench
            </span>
          </button>
          <button
            onClick={() => handleNavClick('history')}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition ${
              currentView === 'history' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#EDEDEF] hover:bg-white/[0.05]'
            }`}
          >
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#A1A1AA]" />
              Corpus Forensics
            </span>
          </button>
          <button
            onClick={() => handleNavClick('api')}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition ${
              currentView === 'api' ? 'bg-white text-[#090A0C] font-semibold' : 'text-[#EDEDEF] hover:bg-white/[0.05]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#A1A1AA]" />
              API & CLI
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
