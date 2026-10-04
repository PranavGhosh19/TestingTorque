'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';

export default function AdminComplaintsPage() {
  const { exceptions, resolveException } = useStore();

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              Quality Assurance Desk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Customer Exceptions & Complaints
            </h1>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {exceptions.filter((e) => !e.resolved).length === 0 ? 'Zero Open Complaints' : `${exceptions.filter((e) => !e.resolved).length} Pending Review`}
          </span>
        </div>

        <div className="space-y-4">
          {exceptions.length === 0 ? (
            <div className="premium-card p-12 bg-white border border-slate-200/90 text-center space-y-3 max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-base font-extrabold text-[#0B132B]">
                No Open Customer Complaints
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quality escalations, missed wash alerts, and vehicle touchup requests will appear here for operational review and credit resolution.
              </p>
            </div>
          ) : (
            exceptions.map((exc) => (
              <div
                key={exc.id}
                className={`premium-card p-6 bg-white border shadow-xs space-y-3 ${
                  exc.resolved ? 'border-slate-200 opacity-60' : 'border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-base font-bold text-[#0B132B]">{exc.title}</h2>
                    <p className="text-xs text-slate-600 mt-1">{exc.description}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{exc.time}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs flex items-center justify-between text-slate-600">
                  <span>Society: <strong>{exc.society}</strong></span>
                  <span>Vehicle: <strong>{exc.vehicle}</strong></span>
                  <span>Washer: <strong>{exc.washer}</strong></span>
                </div>

                <div className="pt-2 flex justify-end">
                  {!exc.resolved ? (
                    <button
                      onClick={() => resolveException(exc.id)}
                      className="px-4 py-2 rounded-xl bg-[#0B132B] text-white font-bold text-xs"
                    >
                      Resolve & Grant Touchup Credit
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ Closed
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
