'use client';

import React from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminSubstitutionsPage() {
  const leaves = [
    {
      id: 'sub_01',
      originalWasher: 'Amit Kumar',
      backupWasher: 'Rahul Sharma',
      society: 'Green Valley Residency',
      dates: '10 Oct → 12 Oct',
      carsAffected: 34,
      status: 'Approved & Covered',
    },
    {
      id: 'sub_02',
      originalWasher: 'Ramesh Singh',
      backupWasher: 'Suresh Verma',
      society: 'Palm Residency',
      dates: 'Today',
      carsAffected: 30,
      status: 'Emergency Backup Active',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Shift Rebalancing
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Washer Substitutions & Leaves
            </h1>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Zero Uncovered Routes
          </span>
        </div>

        <div className="space-y-4">
          {leaves.map((l) => (
            <div
              key={l.id}
              className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-extrabold text-[#0B132B]">
                    {l.originalWasher} → Backup {l.backupWasher}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  {l.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between text-slate-600">
                <span>Society: <strong>{l.society}</strong></span>
                <span>Duration: <strong>{l.dates}</strong></span>
                <span>Vehicles: <strong>{l.carsAffected} Cars</strong></span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
