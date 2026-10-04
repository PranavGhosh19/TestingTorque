'use client';

import React from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Calendar, ShieldCheck } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export interface SubstitutionRecord {
  id: string;
  originalWasher: string;
  backupWasher: string;
  society: string;
  dates: string;
  carsAffected: number;
  status: string;
}

export default function AdminSubstitutionsPage() {
  const leaves: SubstitutionRecord[] = [];

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
            {leaves.length === 0 ? 'All Routes Operating Normally' : `${leaves.length} Active Substitutions`}
          </span>
        </div>

        <div className="space-y-4">
          {leaves.length === 0 ? (
            <div className="premium-card p-12 bg-white border border-slate-200/90 text-center space-y-3 max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h2 className="text-base font-extrabold text-[#0B132B]">
                No Active Substitutions or Leave Requests
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                All daily car wash routes are currently operating on normal schedule with primary washer partners. Emergency backup requests and leave approvals will appear here.
              </p>
            </div>
          ) : (
            leaves.map((l) => (
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}
