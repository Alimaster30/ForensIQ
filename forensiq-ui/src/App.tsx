import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useLenisGsap } from './hooks/useLenisGsap';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GaplessBentoGrid } from './components/GaplessBentoGrid';
import { WorkbenchView } from './components/WorkbenchView';
import { InvestigationHistoryView } from './components/InvestigationHistoryView';
import { DeveloperApiView } from './components/DeveloperApiView';
import { Footer } from './components/Footer';
import { SAMPLE_CASES } from './data/sampleCases';
import type { ForensicCase } from './data/sampleCases';
import type { AuditRecord } from './data/auditHistory';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'workbench' | 'history' | 'api'>('landing');
  const [selectedCase, setSelectedCase] = useState<ForensicCase>(SAMPLE_CASES[0]);
  const viewContainerRef = useRef<HTMLDivElement>(null);

  // Initialize unified Lenis smooth scroll + GSAP ticker
  const lenisController = useLenisGsap();

  // Scroll to top and execute smooth view transition on navigation
  const handleNavigate = (view: 'landing' | 'workbench' | 'history' | 'api') => {
    if (viewContainerRef.current) {
      gsap.to(viewContainerRef.current, {
        opacity: 0,
        y: -10,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentView(view);
          lenisController.scrollTo(0, { immediate: true });
          gsap.fromTo(
            viewContainerRef.current,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
          );
        },
      });
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectSample = (c: ForensicCase) => {
    setSelectedCase(c);
  };

  const handleInspectFromHistory = (record: AuditRecord) => {
    const isSynthetic = record.verdict === 'SYNTHETIC';
    const mappedCase: ForensicCase = {
      id: record.id,
      title: record.fileName,
      subtitle: `${record.dataset} Specimen`,
      verdict: isSynthetic ? 'AI GENERATED (SYNTHETIC)' : 'AUTHENTIC REAL PHOTO',
      confidence: record.confidence,
      metrics: {
        spectral_nyquist_energy: record.nyquistEnergy,
        bg_sensor_noise_variance: record.bgNoiseVar,
        faceswap_prob: record.faceswapProb,
      },
      reasons: [
        record.nyquistEnergy > 0.0008
          ? `Spectral Nyquist checkerboard energy (${record.nyquistEnergy.toFixed(6)}) exceeds physical optical limit (<0.000600).`
          : `Normal optical spectral rolloff (${record.nyquistEnergy.toFixed(6)}): No periodic upsampler grid artifacts.`,
        record.bgNoiseVar > 2.0
          ? `Physical CMOS sensor shot noise present (Noise variance: ${record.bgNoiseVar.toFixed(1)}).`
          : `Synthetic background void: Near-zero noise variance (${record.bgNoiseVar.toFixed(1)}).`
      ],
      summary: record.summary,
      originalImage: isSynthetic ? '/benchmarks/case-02/original.jpg' : '/benchmarks/case-01/original.jpg',
      heatmapOverlay: isSynthetic ? '/benchmarks/case-02/original_vit_overlay.jpg' : '/benchmarks/case-01/original_vit_overlay.jpg',
      fftSpectrumImage: isSynthetic ? '/benchmarks/case-02/original_fft_spectrum.jpg' : '/benchmarks/case-01/original_fft_spectrum.jpg',
      noiseResidualImage: isSynthetic ? '/benchmarks/case-02/original_noise_residual.jpg' : '/benchmarks/case-01/original_noise_residual.jpg',
      flaggedZones: [
        { zone: '2D FFT Nyquist Rolloff', intensity: record.nyquistEnergy > 0.0008 ? 0.92 : 0.14, description: 'Frequency boundary analysis' },
        { zone: 'CMOS Sensor Shot Noise', intensity: record.bgNoiseVar < 2.0 ? 0.88 : 0.18, description: 'Poisson-Gaussian photon noise variance' }
      ]
    };
    setSelectedCase(mappedCase);
    handleNavigate('workbench');
  };

  return (
    <div className="relative min-h-screen bg-[#090A0C] text-[#EDEDEF] flex flex-col justify-between selection:bg-white selection:text-black">
      {/* Physical Analog Grain Texture (Kills AI Flatness) */}
      <div className="tactile-grain"></div>

      {/* Subtle Optical Illumination Diffuser */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-white/[0.018] blur-[180px] pointer-events-none rounded-full z-0"></div>

      {/* Persistent Floating Glass Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main View Container with Barba.js compatible wrapper */}
      <main 
        ref={viewContainerRef}
        data-barba="container"
        data-barba-namespace={currentView}
        className="relative z-10 w-full flex-1"
      >
        {currentView === 'landing' && (
          <div className="flex flex-col">
            <HeroSection
              onSelectSample={handleSelectSample}
              samples={SAMPLE_CASES}
              onLaunchWorkbench={() => handleNavigate('workbench')}
            />

            <div id="bento">
              <GaplessBentoGrid />
            </div>

            {/* Middle Feature Teaser */}
            <section className="w-full max-w-6xl mx-auto px-4 py-20">
              <div className="double-bezel">
                <div className="double-bezel-inner p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="flex flex-col gap-3 max-w-xl">
                    <div className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA]">
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Live Empirical Verification Engine</span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                      Ready to test your own images against the 3 physical layers?
                    </h3>
                    <p className="text-sm text-[#A1A1AA] leading-relaxed">
                      Upload any JPEG or PNG to inspect raw Fourier frequencies, measure background CMOS noise variance, and view ViT transformer attention heatmaps.
                    </p>
                  </div>

                  <button
                    onClick={() => handleNavigate('workbench')}
                    className="group flex items-center gap-3 pl-6 pr-2 py-2.5 rounded-full btn-porcelain text-xs font-semibold shrink-0"
                  >
                    <span>Open Interactive Lab</span>
                    <div className="w-7 h-7 rounded-full bg-black/5 flex items-center justify-center transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                      <ArrowUpRight className="w-4 h-4 text-[#090A0C]" />
                    </div>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === 'workbench' && (
          <WorkbenchView
            currentCase={selectedCase}
            onSelectCase={handleSelectSample}
          />
        )}

        {currentView === 'history' && (
          <InvestigationHistoryView onInspectRecord={handleInspectFromHistory} />
        )}

        {currentView === 'api' && (
          <DeveloperApiView />
        )}
      </main>

      {/* Architectural Obsidian Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
