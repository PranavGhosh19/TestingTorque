'use client';

import React from 'react';
import TorqueLogo from './TorqueLogo';

interface LoadingScreenProps {
  message?: string;
  submessage?: string;
  fullscreen?: boolean;
}

/**
 * Torque Care Official Loading Screen
 * Features the signature Torque Care shield emblem and wordmark lockup,
 * luxury ambient mint/neon photonic glows, precision scanning progress line,
 * and automotive-grade monospace status indicators.
 */
export default function LoadingScreen({
  message = 'PREPARING YOUR EXPERIENCE',
  submessage = 'Verified Vehicle Care',
  fullscreen = true,
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-label="Loading Torque Care"
      className={`${
        fullscreen ? 'fixed inset-0 z-50 min-h-screen min-h-dvh' : 'relative w-full py-16'
      } flex flex-col items-center justify-center bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black overflow-hidden px-4`}
    >
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-[#2DD4A0]/10 rounded-full blur-[130px] pointer-events-none -z-10 animate-torque-glow" />
      <div className="fixed bottom-10 right-10 w-[380px] h-[380px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* CENTERPIECE CARD */}
      <div className="relative flex flex-col items-center justify-center p-8 sm:p-11 rounded-[28px] bg-[#11161D]/80 border border-white/[0.08] backdrop-blur-2xl shadow-2xl shadow-black/80 max-w-sm w-full text-center">
        {/* Soft radial backdrop behind the shield */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#2DD4A0]/15 rounded-full blur-2xl pointer-events-none animate-pulse" />

        {/* TORQUE CARE EMBLEM & WORDMARK */}
        <div className="relative transition-transform duration-300 hover:scale-[1.02]">
          <TorqueLogo emblemSize={52} />
        </div>

        {/* PRECISION SCANNING LUMINANCE BAR */}
        <div className="w-44 sm:w-52 h-[3px] rounded-full bg-white/[0.08] overflow-hidden relative mt-8">
          <div className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#2DD4A0] to-transparent animate-torque-shimmer" />
        </div>

        {/* STATUS INDICATOR & LABELS */}
        <div className="mt-5 space-y-1.5 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4A0] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4A0]" />
            </span>
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-[#2DD4A0]">
              {message}
            </span>
          </div>
          {submessage && (
            <p className="text-[11px] font-sans tracking-wide text-white/40">
              {submessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
