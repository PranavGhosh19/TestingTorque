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
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/washer/dashboard"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Clustered Route Engine
              </span>
              <h1 className="text-lg font-extrabold text-[#0B132B]">
                Today&apos;s Optimal Route
              </h1>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            Max Washes / Hour Mode
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* INTERACTIVE BASEMENT MAP SIMULATOR (Section 14) */}
        <div className="premium-card bg-[#0B132B] text-white p-5 rounded-3xl overflow-hidden relative shadow-lg">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              LIVE ROUTE • GREEN VALLEY BASEMENT -1
            </span>
            <span className="text-slate-400">Walking Dist: ~240m total</span>
          </div>

          {/* Interactive SVG Basement Blueprint & Clustered Route Points */}
          <div className="relative aspect-16/9 sm:aspect-21/9 bg-slate-900/90 rounded-2xl border border-white/10 p-4 overflow-hidden flex items-center justify-center">
            {/* Grid Floor Lines */}
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4F7CFF_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* SVG Connecting Route Path */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points="40,90 90,60 140,75 190,45 250,55 310,80 370,50 430,70 500,40 560,75"
                fill="none"
                stroke="#4F7CFF"
                strokeWidth="2.5"
                strokeDasharray="6,4"
                className="opacity-75"
              />
            </svg>

            {/* Parking Block Pillars & Waypoints */}
            <div className="relative w-full h-full flex items-center justify-between px-4 z-10">
              {routeStops.slice(0, 6).map((stop, i) => {
                const isCurrent = stop.status === 'current';
                const isDone = stop.status === 'completed';

                return (
                  <button
                    key={stop.stop_number}
                    onClick={() => handleStartStop(stop)}
                    className="flex flex-col items-center group focus:outline-hidden transition-transform hover:scale-110"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition-all ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 text-white ring-4 ring-blue-400/40 animate-pulse'
                          : 'bg-slate-800 text-slate-300 border border-slate-600'
                      }`}
                    >
                      {isDone ? '✓' : stop.stop_number}
                    </div>
                    <span className="text-[10px] text-slate-300 mt-1 font-mono hidden sm:block">
                      {stop.vehicle_name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Micro Badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-[10px] px-2 py-1 rounded text-slate-300">
              Auto-clustered by Block B → Block C → Block D
            </div>
          </div>
        </div>

        {/* Cluster Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setClusterFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              clusterFilter === 'all'
                ? 'bg-[#0B132B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All 12 Stops
          </button>
          <button
            onClick={() => setClusterFilter('block_b')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              clusterFilter === 'block_b'
                ? 'bg-[#0B132B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cluster 1: Block B (5 cars)
          </button>
          <button
            onClick={() => setClusterFilter('block_c')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              clusterFilter === 'block_c'
                ? 'bg-[#0B132B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cluster 2: Block C (4 cars)
          </button>
          <button
            onClick={() => setClusterFilter('block_d')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              clusterFilter === 'block_d'
                ? 'bg-[#0B132B] text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cluster 3: Block D (3 cars)
          </button>
        </div>

        {/* Route Stops List (Section 14) */}
        <div className="space-y-3">
          {filteredStops.map((stop) => {
            const isDone = stop.status === 'completed';
            const isUnavailable = stop.status === 'vehicle_unavailable';
            const isCurrent = stop.status === 'current';

            return (
              <div
                key={stop.stop_number}
                className={`premium-card p-4 sm:p-5 bg-white border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'border-2 border-blue-600 shadow-md ring-2 ring-blue-500/10'
                    : isDone
                    ? 'border-slate-200/70 bg-slate-50/50'
                    : isUnavailable
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : isUnavailable
                        ? 'bg-amber-100 text-amber-800'
                        : isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : isUnavailable ? (
                      <ShieldCheck className="w-5 h-5 text-amber-700" />
                    ) : (
                      stop.stop_number
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-[#0B132B]">
                        {stop.vehicle_name}
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {stop.registration_number}
                      </span>
                      {isUnavailable && (
                        <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          Vehicle Unavailable • Payout Protected
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {stop.parking_location}
                      </span>
                      <span>•</span>
                      <span>{stop.scheduled_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-emerald-700 mr-1">
                    +₹{stop.payout_amount}
                  </span>

                  {isDone ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      ✓ Done
                    </span>
                  ) : isUnavailable ? (
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                      Present ✓ (Not Missed)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleStartStop(stop)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-[#0B132B] hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>{isCurrent ? 'Start Wash' : 'Open'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <WasherWashWorkflowModal
        stop={selectedStop}
        isOpen={showWashModal}
        onClose={() => setShowWashModal(false)}
      />

      <WasherBottomNav />
    </div>
  );
}
