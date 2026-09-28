'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, Clock, MapPin, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';

export default function AdminOperationsPage() {
  const { routeStops, societies } = useStore();

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Realtime Telemetry
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Live Wash Stream
            </h1>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
            ● Streaming Updates
          </span>
        </div>

        {/* Live stream cards */}
        <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 shadow-xs overflow-hidden">
          {routeStops.map((stop) => {
            const isDone = stop.status === 'completed';

            return (
              <div
                key={stop.stop_number}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors text-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : stop.stop_number}
                  </div>
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {stop.vehicle_name} ({stop.registration_number})
                    </div>
                    <div className="text-slate-500 mt-0.5 flex items-center gap-2">
                      <span>{stop.parking_location}</span>
                      <span>•</span>
                      <span>Owner: {stop.owner_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-600 font-bold">
                    {stop.scheduled_time}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                    }`}
                  >
                    {isDone ? 'Verified ✓' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
