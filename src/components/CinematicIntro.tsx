'use client';

import React, { useEffect, useState, useRef } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

export default function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const [isExiting, setIsExiting] = useState(false);
  const audioPlayedRef = useRef(false);

  // Play minimalist cinematic tone using Web Audio API
  useEffect(() => {
    if (audioPlayedRef.current) return;
    audioPlayedRef.current = true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Deep cinematic sub-bass rumble
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 1.8);
      gain1.gain.setValueAtTime(0.001, ctx.currentTime);
      gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3);
      gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 2.5);

      // Crystalline electric chord harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime + 0.3);
      osc2.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 2.0);
      gain2.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain2.gain.setValueAtTime(0.0001, ctx.currentTime + 0.3);
      gain2.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.6);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.2);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.3);
      osc2.stop(ctx.currentTime + 2.4);
    } catch {
      // Audio playback silently skips if restricted by browser autoplay policy
    }
  }, []);

  // Timer
  useEffect(() => {
    const duration = 2800; // 2.8 seconds total
    const timer = setTimeout(() => {
      handleFinish();
    }, duration);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleFinish();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  const handleFinish = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  return (
    <div
      onClick={handleFinish}
      className={`fixed inset-0 z-[100] bg-[#050811] flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Cinematic Ambient Radial Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0, 209, 255, 0.22) 0%, rgba(14, 26, 56, 0.45) 35%, rgba(5, 8, 17, 0.95) 70%, #050811 100%)',
        }}
      />

      {/* Netflix-Style Vertical Light Ribbons */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40">
        <div
          className="w-1.5 h-[80vh] bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[6px]"
          style={{ animation: 'ribbonFloat 4s ease-in-out infinite' }}
        />
        <div
          className="w-1.5 h-[70vh] bg-gradient-to-b from-transparent via-blue-500 to-transparent blur-[8px] mx-8"
          style={{ animation: 'ribbonFloat 3.5s ease-in-out infinite 0.4s' }}
        />
        <div
          className="w-1 h-[60vh] bg-gradient-to-b from-transparent via-purple-500 to-transparent blur-[7px]"
          style={{ animation: 'ribbonFloat 4.2s ease-in-out infinite 0.8s' }}
        />
      </div>

      {/* Center Cinematic Logo Container */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Main Logo with camera push and glow sheen */}
        <div
          className="relative overflow-hidden p-4 rounded-3xl"
          style={{
            animation: 'netflixZoom 2.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Authentic Logo Image */}
          <img
            src="/images/aidgrid-logo.png"
            alt="AIDGRID"
            className="w-72 sm:w-96 md:w-[480px] h-auto object-contain filter drop-shadow-[0_0_40px_rgba(0,209,255,0.65)]"
          />

          {/* High-Velocity Light Sheen Sweep across the letters */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.85) 50%, transparent 100%)',
              width: '40%',
              animation: 'netflixSheen 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s infinite',
            }}
          />
        </div>

        {/* Minimalist Subtitle Reveal */}
        <div
          className="mt-4 text-center space-y-2 opacity-0 animate-fadeIn"
          style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}
        >
          <div className="flex items-center justify-center gap-2">
            <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-cyan-400"></span>
            <p className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.35em] sm:tracking-[0.5em] text-cyan-200 uppercase">
              Public issues • Accountable action
            </p>
            <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-cyan-400"></span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-semibold text-slate-400 tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            <span>CIVIC INTELLIGENCE ENGINE • CODE-ARENAX 2026</span>
          </div>
        </div>
      </div>




    </div>
  );
}
