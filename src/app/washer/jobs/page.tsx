'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ListChecks, CheckCircle2, Play, AlertTriangle, MapPin, Clock, Search } from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import WasherWashWorkflowModal from '@/components/modals/WasherWashWorkflowModal';
import CustomerUnavailableModal from '@/components/modals/CustomerUnavailableModal';
import { RouteStop } from '@/lib/types';

export default function WasherJobsPage() {
  const { routeStops } = useStore();
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [showWashModal, setShowWashModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = routeStops.filter(
    (s) =>
      s.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.registration_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.parking_location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Daily Roster
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
                Assigned Vehicles
              </h1>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              {routeStops.length} Assigned
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search car, reg plate, or parking bay..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {filtered.map((stop) => {
          const isDone = stop.status === 'completed';
          const isCurrent = stop.status === 'current';

          return (
            <div
              key={stop.stop_number}
              className="premium-card p-4 sm:p-5 bg-white border-slate-200/90 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : stop.stop_number}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0B132B]">
                      {stop.vehicle_name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {stop.registration_number}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-slate-700">
                      {stop.parking_location}
                    </span>
                    <span>•</span>
                    <span>{stop.scheduled_time}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isDone ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Completed ✓
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedStop(stop);
                      setShowWashModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Wash</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <WasherWashWorkflowModal
        stop={selectedStop}
        isOpen={showWashModal}
        onClose={() => setShowWashModal(false)}
      />
      <CustomerUnavailableModal
        stop={selectedStop}
        isOpen={showUnavailableModal}
        onClose={() => setShowUnavailableModal(false)}
      />

      <WasherBottomNav />
    </div>
  );
}
