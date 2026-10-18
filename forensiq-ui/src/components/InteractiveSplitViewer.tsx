import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Layers, 
  Activity, 
  Cpu, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Move, 
  SlidersHorizontal, 
  Split, 
  Blend, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gauge
} from 'lucide-react';
import type { ForensicCase } from '../data/sampleCases';

interface InteractiveSplitViewerProps {
  currentCase: ForensicCase;
}

type CompareMode = 'split-v' | 'split-h' | 'blend' | 'flicker';

export const InteractiveSplitViewer: React.FC<InteractiveSplitViewerProps> = ({ currentCase }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [compareMode, setCompareMode] = useState<CompareMode>('split-v');
  const [activeLayer, setActiveLayer] = useState<'heatmap' | 'fft' | 'noise'>('heatmap');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [interactionMode, setInteractionMode] = useState<'compare' | 'pan'>('compare');
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isSnapping, setIsSnapping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlickerActive, setIsFlickerActive] = useState(false);
  const [flickerState, setFlickerState] = useState<'original' | 'overlay'>('original');

  const viewportRef = useRef<HTMLDivElement>(null);
  const cachedRectRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const flickerTimerRef = useRef<number | null>(null);

  // Strobe / Flicker effect
  useEffect(() => {
    if (isFlickerActive) {
      flickerTimerRef.current = window.setInterval(() => {
        setFlickerState(prev => prev === 'original' ? 'overlay' : 'original');
      }, 450);
    } else {
      if (flickerTimerRef.current) clearInterval(flickerTimerRef.current);
    }
    return () => {
      if (flickerTimerRef.current) clearInterval(flickerTimerRef.current);
    };
  }, [isFlickerActive]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Instant calculation using cached viewport bounds (Zero-Reflow 120fps tracking)
  const calculatePosition = useCallback((clientX: number, clientY: number) => {
    const rect = cachedRectRef.current;
    if (!rect) return;

    if (compareMode === 'split-v' || compareMode === 'blend') {
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const pct = (x / rect.width) * 100;
      setSliderPos(Math.round(pct * 10) / 10);
    } else if (compareMode === 'split-h') {
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
      const pct = (y / rect.height) * 100;
      setSliderPos(Math.round(pct * 10) / 10);
    }
  }, [compareMode]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    setIsPointerDown(true);
    setIsSnapping(false);
    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // Cache viewport bounding rect ONCE on pointer down (avoids layout thrashing on move)
    if (viewportRef.current) {
      const r = viewportRef.current.getBoundingClientRect();
      cachedRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    }

    // Capture pointer so moving outside the element does not interrupt dragging
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

    if (interactionMode === 'compare') {
      calculatePosition(e.clientX, e.clientY);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) return;

    if (interactionMode === 'compare') {
      // Sync with monitor refresh rate via requestAnimationFrame
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        calculatePosition(clientX, clientY);
      });
    } else if (interactionMode === 'pan' && zoom > 1) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const dx = (clientX - dragStartRef.current.x) / zoom;
        const dy = (clientY - dragStartRef.current.y) / zoom;
        setPan(prev => ({
          x: Math.max(-200, Math.min(200, prev.x + dx * 0.5)),
          y: Math.max(-200, Math.min(200, prev.y + dy * 0.5))
        }));
        dragStartRef.current = { x: clientX, y: clientY };
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPointerDown(false);
    cachedRectRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePresetSnap = (val: number) => {
    setIsSnapping(true);
    setSliderPos(val);
    setTimeout(() => setIsSnapping(false), 250);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactionMode !== 'compare') return;
    setIsSnapping(true);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSliderPos(prev => Math.max(0, prev - 2));
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSliderPos(prev => Math.min(100, prev + 2));
    }
    setTimeout(() => setIsSnapping(false), 150);
  };

  const handleReset = () => {
    setIsSnapping(true);
    setZoom(1);
    setSliderPos(50);
    setPan({ x: 0, y: 0 });
    setInteractionMode('compare');
    setIsFlickerActive(false);
    setTimeout(() => setIsSnapping(false), 250);
  };

  const getOverlayImage = () => {
    switch (activeLayer) {
      case 'fft':
        return currentCase.fftSpectrumImage;
      case 'noise':
        return currentCase.noiseResidualImage;
      case 'heatmap':
      default:
        return currentCase.heatmapOverlay;
    }
  };

  const getLayerTitle = () => {
    switch (activeLayer) {
      case 'fft':
        return '2D FFT Nyquist Spectrum (Inferno Colormap)';
      case 'noise':
        return 'CMOS Silicon Shot Noise (Viridis Colormap)';
      case 'heatmap':
      default:
        return 'ViT Attention Rollout Halo (Spectral Gradient)';
    }
  };

  return (
    <div 
      className={`flex flex-col gap-4 w-full transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#090A0C] p-6 overflow-y-auto' : ''
      }`}
    >
      {/* Viewer Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        {/* Layer Selection Pill */}
        <div className="flex items-center gap-1 p-1 bg-[#15171C] rounded-2xl border border-white/[0.08]">
          <button
            onClick={() => setActiveLayer('heatmap')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeLayer === 'heatmap'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ViT Attention</span>
          </button>
          <button
            onClick={() => setActiveLayer('fft')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeLayer === 'fft'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2D FFT Nyquist</span>
          </button>
          <button
            onClick={() => setActiveLayer('noise')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeLayer === 'noise'
                ? 'bg-white text-[#090A0C] font-semibold shadow-sm'
                : 'text-[#A1A1AA] hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>CMOS Noise</span>
          </button>
        </div>

        {/* Comparison Mode, Pan/Zoom & Fullscreen Controls */}
        <div className="flex items-center gap-2">
          {/* Comparison Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#15171C] p-1 rounded-2xl border border-white/[0.08]">
            <button
              onClick={() => {
                setCompareMode('split-v');
                setIsFlickerActive(false);
                setInteractionMode('compare');
              }}
              className={`p-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                compareMode === 'split-v' && !isFlickerActive
                  ? 'bg-white text-[#090A0C] font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Vertical Split Wipe"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vertical</span>
            </button>

            <button
              onClick={() => {
                setCompareMode('split-h');
                setIsFlickerActive(false);
                setInteractionMode('compare');
              }}
              className={`p-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                compareMode === 'split-h' && !isFlickerActive
                  ? 'bg-white text-[#090A0C] font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Horizontal Split Wipe"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 rotate-90" />
              <span className="hidden sm:inline">Horizontal</span>
            </button>

            <button
              onClick={() => {
                setCompareMode('blend');
                setIsFlickerActive(false);
                setInteractionMode('compare');
              }}
              className={`p-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                compareMode === 'blend' && !isFlickerActive
                  ? 'bg-white text-[#090A0C] font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Alpha Opacity Blend"
            >
              <Blend className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Opacity</span>
            </button>

            <button
              onClick={() => {
                setIsFlickerActive(!isFlickerActive);
                setCompareMode('flicker');
              }}
              className={`p-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                isFlickerActive
                  ? 'bg-amber-400 text-[#090A0C] font-bold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Strobe Comparison"
            >
              <Flame className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Strobe</span>
            </button>
          </div>

          {/* Pan Toggle */}
          <div className="flex items-center gap-1 bg-[#15171C] p-1 rounded-2xl border border-white/[0.08]">
            <button
              onClick={() => {
                setInteractionMode(prev => prev === 'pan' ? 'compare' : 'pan');
                if (zoom === 1 && interactionMode !== 'pan') setZoom(1.5);
              }}
              className={`p-1.5 px-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                interactionMode === 'pan'
                  ? 'bg-white text-[#090A0C] font-semibold'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
              title="Drag to Pan across pixels"
            >
              <Move className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pan</span>
            </button>
          </div>

          {/* Zoom & Fullscreen */}
          <div className="flex items-center gap-1 bg-[#15171C] p-1 rounded-2xl border border-white/[0.08]">
            <button
              onClick={() => setZoom((prev) => Math.min(3.0, prev + 0.25))}
              className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition"
              title="Zoom In (up to 3.0x)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom((prev) => Math.max(1, prev - 0.25))}
              className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.05] transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Focus"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Draggable Split Canvas (touch-none eliminates gesture delays) */}
      <div
        ref={viewportRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative w-full ${isFullscreen ? 'h-[calc(100vh-210px)]' : 'h-[520px]'} rounded-2xl overflow-hidden select-none border border-white/10 shadow-2xl bg-black focus:outline-none focus:ring-1 focus:ring-white/30 touch-none ${
          interactionMode === 'pan' 
            ? 'cursor-grab active:cursor-grabbing' 
            : compareMode === 'split-v' || compareMode === 'blend'
            ? 'cursor-col-resize'
            : 'cursor-row-resize'
        }`}
      >
        {/* UNIFIED TRANSFORM STAGE (No CSS transitions during drag; zero latency tracking) */}
        <div 
          className={`relative w-full h-full will-change-transform ${
            isSnapping ? 'transition-transform duration-200 ease-out' : ''
          }`}
          style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        >
          {/* Base Layer: Forensic Overlay Layer */}
          <div className="absolute inset-0 w-full h-full">
            <img
              src={getOverlayImage()}
              alt="Forensic Overlay"
              className="w-full h-full object-cover filter contrast-125 pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Foreground Layer: Original Input Image */}
          {compareMode === 'blend' ? (
            /* Opacity Blend Mode */
            <div 
              className={`absolute inset-0 w-full h-full pointer-events-none ${
                isSnapping ? 'transition-opacity duration-200' : ''
              }`}
              style={{ opacity: 1 - (sliderPos / 100) }}
            >
              <img
                src={currentCase.originalImage}
                alt="Original"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          ) : compareMode === 'flicker' ? (
            /* Strobe Flicker Mode */
            <div 
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ opacity: flickerState === 'original' ? 1 : 0 }}
            >
              <img
                src={currentCase.originalImage}
                alt="Original"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          ) : compareMode === 'split-v' ? (
            /* Vertical Split Wipe */
            <div
              className={`absolute inset-0 h-full overflow-hidden pointer-events-none ${
                isSnapping ? 'transition-all duration-200 ease-out' : ''
              }`}
              style={{
                clipPath: `inset(0 ${(100 - sliderPos)}% 0 0)`,
              }}
            >
              <img
                src={currentCase.originalImage}
                alt="Original"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          ) : (
            /* Horizontal Split Wipe */
            <div
              className={`absolute inset-0 w-full overflow-hidden pointer-events-none ${
                isSnapping ? 'transition-all duration-200 ease-out' : ''
              }`}
              style={{
                clipPath: `inset(0 0 ${(100 - sliderPos)}% 0)`,
              }}
            >
              <img
                src={currentCase.originalImage}
                alt="Original"
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          )}

          {/* THE ZERO-LATENCY DIVIDER WIRE & PORCELAIN GRAB HANDLE */}
          {compareMode === 'split-v' && (
            <div
              className={`absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,0.7)] z-20 pointer-events-none will-change-[left] ${
                isSnapping ? 'transition-all duration-200 ease-out' : ''
              }`}
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full btn-porcelain border border-white/50 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                <div className="flex items-center justify-between w-6 text-[#090A0C]">
                  <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          )}

          {compareMode === 'split-h' && (
            <div
              className={`absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,0.7)] z-20 pointer-events-none will-change-[top] ${
                isSnapping ? 'transition-all duration-200 ease-out' : ''
              }`}
              style={{ top: `${sliderPos}%` }}
            >
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full btn-porcelain border border-white/50 flex items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
                <div className="flex flex-col items-center justify-between h-6 text-[#090A0C]">
                  <ChevronLeft className="w-3.5 h-3.5 rotate-90 stroke-[2.5]" />
                  <ChevronRight className="w-3.5 h-3.5 rotate-90 stroke-[2.5]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Floating Evidence Tags */}
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono font-medium text-white/90 uppercase tracking-wider">
            {getLayerTitle()}
          </div>
        </div>

        <div className="absolute top-4 right-4 z-30 pointer-events-none">
          <div className="px-3 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-[11px] font-mono font-medium text-white/90 uppercase tracking-wider">
            {compareMode === 'blend' ? `Opacity Blend: ${Math.round(sliderPos)}% Overlay` :
             compareMode === 'flicker' ? `Strobe Active: ${flickerState.toUpperCase()}` :
             'Original Capture (Left) vs Mathematical Layer (Right)'}
          </div>
        </div>

        {/* Bottom Floating Scrubber & Telemetry Coordinates */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-full bg-black/85 backdrop-blur-md border border-white/15 flex items-center gap-4 text-xs font-mono text-[#A1A1AA] pointer-events-auto shadow-2xl">
          <div className="flex items-center gap-2 text-white font-medium">
            <Gauge className="w-3.5 h-3.5 text-white/70" />
            <span>
              {compareMode === 'blend' ? `Overlay: ${Math.round(sliderPos)}%` : `Split: ${Math.round(sliderPos)}%`}
            </span>
          </div>

          <span className="w-1 h-1 rounded-full bg-white/20"></span>

          <span>Zoom: <strong className="text-white font-mono">{zoom.toFixed(2)}x</strong></span>

          {interactionMode === 'pan' && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>Pan: <strong className="text-white font-mono">{Math.round(pan.x)}, {Math.round(pan.y)}</strong></span>
            </>
          )}

          {/* Quick Preset Buttons (triggers smooth snapping) */}
          <span className="w-1 h-1 rounded-full bg-white/20"></span>
          <div className="flex items-center gap-1 text-[10px]">
            <button
              onClick={() => handlePresetSnap(0)}
              className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.15] text-[#EDEDEF] transition"
            >
              Raw (0%)
            </button>
            <button
              onClick={() => handlePresetSnap(50)}
              className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.15] text-[#EDEDEF] transition"
            >
              50/50
            </button>
            <button
              onClick={() => handlePresetSnap(100)}
              className="px-2 py-0.5 rounded bg-white/[0.06] hover:bg-white/[0.15] text-[#EDEDEF] transition"
            >
              Layer (100%)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
