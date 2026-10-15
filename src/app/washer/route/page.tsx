'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import WasherWashWorkflowModal from '@/components/modals/WasherWashWorkflowModal';
import { RouteStop } from '@/lib/types';

export default function WasherRoutePage() {
  const { routeStops } = useStore();
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [showWashModal, setShowWashModal] = useState(false);
  const [clusterFilter, setClusterFilter] = useState<'all' | 'block_b' | 'block_c' | 'block_d'>('all');

  const filteredStops = routeStops.filter((s) => {
    if (clusterFilter === 'all') return true;
    if (clusterFilter === 'block_b') return s.parking_location.includes('Block B');
    if (clusterFilter === 'block_c') return s.parking_location.includes('Block C');
    if (clusterFilter === 'block_d') return s.parking_location.includes('Block D');
    return true;
  });

  const handleStartStop = (stop: RouteStop) => {
    setSelectedStop(stop);
    setShowWashModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* Header */}
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/washer/dashboard"
              className="p-2.5 rounded-xl bg-[#161C25] text-white/70 hover:text-white border border-white/[0.08]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
                Clustered Route Engine
              </span>
              <h1 className="text-lg font-black text-white">
                Today&apos;s Optimal Route
              </h1>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 px-3 py-1 rounded-full">
            Max Velocity Mode
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* INTERACTIVE BASEMENT MAP SIMULATOR */}
        <div className="bg-[#11161D] text-white p-6 rounded-[20px] border border-white/[0.08] overflow-hidden relative shadow-2xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-[#2DD4A0] font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2DD4A0] animate-ping" />
              LIVE BLUEPRINT • GREEN VALLEY BASEMENT -1
            </span>
            <span className="text-white/50 font-mono text-[11px]">Walking: ~240m total</span>
          </div>

          {/* SVG Basement Blueprint & Clustered Route Points */}
          <div className="relative aspect-16/9 sm:aspect-21/9 bg-[#0A0D12] rounded-xl border border-white/[0.06] p-4 overflow-hidden flex items-center justify-center">
            {/* Grid Floor Lines */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2DD4A0_1px,transparent_1px)] [background-size:20px_20px]" />

            {/* SVG Connecting Route Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points="40,90 90,60 140,75 190,45 250,55 310,80 370,50 430,70 500,40 560,75"
                fill="none"
                stroke="#2DD4A0"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                className="opacity-75"
              />
            </svg>

            {/* Parking Block Pillars & Waypoints */}
            <div className="relative w-full h-full flex items-center justify-between px-4 z-10">
              {routeStops.slice(0, 6).map((stop) => {
                const isCurrent = stop.status === 'current';
                const isDone = stop.status === 'completed';

                return (
                  <button
                    key={stop.stop_number}
                    onClick={() => handleStartStop(stop)}
                    className="flex flex-col items-center group focus:outline-hidden transition-transform hover:scale-110 cursor-pointer"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shadow-md transition-all ${
                        isDone
                          ? 'bg-[#2DD4A0] text-[#0A0D12]'
                          : isCurrent
                          ? 'bg-white text-[#0A0D12] ring-4 ring-[#2DD4A0]/40 animate-pulse'
                          : 'bg-[#161C25] text-white/60 border border-white/[0.1]'
                      }`}
                    >
                      {isDone ? '✓' : stop.stop_number}
                    </div>
                    <span className="text-[10px] text-white/50 mt-1 font-mono hidden sm:block">
                      {stop.vehicle_name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Micro Badge */}
            <div className="absolute bottom-2 left-2 bg-[#11161D]/80 backdrop-blur-sm border border-white/[0.08] text-[10px] px-2.5 py-1 rounded font-mono text-white/60">
              Clustered: Block B → Block C → Block D
            </div>
          </div>
        </div>

        {/* Cluster Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setClusterFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              clusterFilter === 'all'
                ? 'bg-[#2DD4A0] text-[#0A0D12]'
                : 'bg-[#11161D] text-white/70 border border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            All 12 Stops
          </button>
          <button
            onClick={() => setClusterFilter('block_b')}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              clusterFilter === 'block_b'
                ? 'bg-[#2DD4A0] text-[#0A0D12]'
                : 'bg-[#11161D] text-white/70 border border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            Block B (5 cars)
          </button>
          <button
            onClick={() => setClusterFilter('block_c')}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              clusterFilter === 'block_c'
                ? 'bg-[#2DD4A0] text-[#0A0D12]'
                : 'bg-[#11161D] text-white/70 border border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            Block C (4 cars)
          </button>
          <button
            onClick={() => setClusterFilter('block_d')}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              clusterFilter === 'block_d'
                ? 'bg-[#2DD4A0] text-[#0A0D12]'
                : 'bg-[#11161D] text-white/70 border border-white/[0.08] hover:bg-white/[0.04]'
            }`}
          >
            Block D (3 cars)
          </button>
        </div>

        {/* Route Stops List */}
        <div className="space-y-3">
          {filteredStops.map((stop) => {
            const isDone = stop.status === 'completed';
            const isUnavailable = stop.status === 'vehicle_unavailable';
            const isCurrent = stop.status === 'current';

            return (
              <div
                key={stop.stop_number}
                className={`p-5 rounded-[20px] bg-[#11161D] border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-[#2DD4A0] shadow-lg ring-1 ring-[#2DD4A0]/30'
                    : isDone
                    ? 'border-white/[0.06] opacity-75'
                    : isUnavailable
                    ? 'border-amber-400/30 bg-amber-500/[0.03]'
                    : 'border-white/[0.08]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                      isDone
                        ? 'bg-[#2DD4A0]/20 text-[#2DD4A0]'
                        : isUnavailable
                        ? 'bg-amber-400/20 text-amber-300'
                        : isCurrent
                        ? 'bg-[#2DD4A0] text-[#0A0D12]'
                        : 'bg-[#161C25] text-white/50 border border-white/[0.06]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isUnavailable ? (
                      <ShieldCheck className="w-5 h-5 text-amber-300" />
                    ) : (
                      stop.stop_number
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white">
                        {stop.vehicle_name}
                      </h3>
                      {/* IND PLATE */}
                      <div className="inline-flex items-center bg-[#E5E7EB] text-[#111827] rounded-sm border border-slate-400 overflow-hidden font-mono text-[9px] font-bold tracking-widest">
                        <span className="bg-[#1E3A8A] text-white px-1 text-[7px] font-sans flex flex-col items-center justify-center leading-none">
                          <span className="text-[5px]">🇮🇳</span>
                          <span>IND</span>
                        </span>
                        <span className="px-1.5 py-0.5">{stop.registration_number}</span>
                      </div>
                      {isUnavailable && (
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                          Unavailable • Bay Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/50 mt-1 flex items-center gap-2 font-mono">
                      <span className="text-white/80">
                        {stop.parking_location}
                      </span>
                      <span>•</span>
                      <span>{stop.scheduled_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isDone ? (
                    <span className="text-[11px] font-mono font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 px-3 py-1 rounded-full border border-[#2DD4A0]/20">
                      ✓ Done
                    </span>
                  ) : isUnavailable ? (
                    <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                      Protected ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartStop(stop)}
                      className={`px-4 py-2 rounded-full font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] shadow-sm'
                          : 'bg-[#161C25] hover:bg-white/10 text-white border border-white/[0.08]'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isCurrent ? 'Start Wash' : 'Open'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <WasherWashWorkflowModal
        stop={selectedStop}
        isOpen={showWashModal}
        onClose={() => setShowWashModal(false)}
      />

      <WasherBottomNav />
    </div>
  );
}
