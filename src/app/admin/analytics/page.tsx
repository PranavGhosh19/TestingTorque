'use client';

import React from 'react';
import { BarChart3, TrendingUp, Users, ShieldCheck, Clock } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminAnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Performance Metrics
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            Operational Velocity & Analytics
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Avg Wash Duration</span>
            <div className="text-3xl font-extrabold text-[#0B132B]">11.4 mins</div>
            <p className="text-xs text-emerald-600 font-semibold">Optimal two-bucket adherence</p>
          </div>

          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Monthly Retention</span>
            <div className="text-3xl font-extrabold text-blue-600">96.8%</div>
            <p className="text-xs text-slate-500">Industry benchmark 72%</p>
          </div>

          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Bay Verification Rate</span>
            <div className="text-3xl font-extrabold text-emerald-600">99.4%</div>
            <p className="text-xs text-slate-500">Parking bay match accuracy</p>
          </div>
        </div>
      </main>
    </div>
  );
}
