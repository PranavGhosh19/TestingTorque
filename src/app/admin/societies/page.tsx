'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Car, CheckCircle2, TrendingUp, Plus, ShieldCheck, ArrowRight } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';

export default function AdminSocietiesPage() {
  const { societies } = useStore();
  const [selectedSocietyId, setSelectedSocietyId] = useState(societies[0]?.id || 'soc_green_valley');

  const selectedSociety = societies.find((s) => s.id === selectedSocietyId) || societies[0];

  const washerAllocations = [
    { name: 'Amit Kumar', vehicles: 34, rating: '4.9', status: 'Optimal (85% capacity)' },
    { name: 'Rahul Sharma', vehicles: 33, rating: '4.8', status: 'Optimal (82% capacity)' },
    { name: 'Suresh Verma', vehicles: 33, rating: '4.9', status: 'Optimal (82% capacity)' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clustered Territory Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Society Operations & Allocations
            </h1>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Onboard New Society</span>
          </button>
        </div>

        {/* Selected Society Spotlight (Section 21) */}
        <div className="premium-card p-6 sm:p-8 bg-white border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Primary Cluster Entity
              </span>
              <h2 className="text-2xl font-extrabold text-[#0B132B] mt-2">
                {selectedSociety.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{selectedSociety.address}</p>
            </div>

            {/* Quick Society Picker */}
            <select
              value={selectedSocietyId}
              onChange={(e) => setSelectedSocietyId(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0B132B] focus:outline-hidden"
            >
              {societies.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4 Core Society Metrics (Section 21) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-semibold block">Total Vehicles</span>
              <div className="text-2xl font-extrabold text-[#0B132B] mt-1">
                {selectedSociety.total_vehicles}
              </div>
              <span className="text-[10px] text-slate-400">Subscribed</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-semibold block">Active Washers</span>
              <div className="text-2xl font-extrabold text-[#0B132B] mt-1">
                {selectedSociety.active_washers}
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">Full Staffing</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-semibold block">Daily Capacity</span>
              <div className="text-2xl font-extrabold text-[#0B132B] mt-1">
                {selectedSociety.daily_capacity}
              </div>
              <span className="text-[10px] text-slate-400">Max limit</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-xs text-emerald-700 font-semibold block">Today&apos;s Completion</span>
              <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                {selectedSociety.today_completion_rate}%
              </div>
              <span className="text-[10px] text-emerald-600 font-bold">91 / 100 Finished</span>
            </div>
          </div>

          {/* WASHER ALLOCATION BREAKDOWN (Section 21) */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
                Washer Route Allocation
              </h3>
              <span className="text-xs font-bold text-blue-600 cursor-pointer hover:underline">
                Rebalance Routes Automatically
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {washerAllocations.map((w, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#0B132B]">
                      {w.name}
                    </span>
                    <span className="text-xs font-bold text-amber-600">
                      ★ {w.rating}
                    </span>
                  </div>

                  <div className="text-2xl font-extrabold text-blue-600">
                    {w.vehicles}{' '}
                    <span className="text-xs font-semibold text-slate-500">vehicles</span>
                  </div>

                  <div className="text-[11px] text-slate-500">{w.status}</div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(w.vehicles / 40) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
