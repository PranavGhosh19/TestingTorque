'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Car,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Building2,
  ArrowRight,
  ShieldAlert,
  Clock,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';

export default function AdminDashboardPage() {
  const { societies, exceptions, resolveException } = useStore();
  const [selectedExceptionFilter, setSelectedExceptionFilter] = useState<'all' | 'unresolved'>('unresolved');

  const filteredExceptions = exceptions.filter((e) =>
    selectedExceptionFilter === 'all' ? true : !e.resolved
  );

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Operations Control Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Realtime Exceptions & Society Ops
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Live Sync:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              99.8% Healthy
            </span>
          </div>
        </div>

        {/* TOP FOUR STAT CARDS (Section 20) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Active Vehicles
            </span>
            <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
              8,421
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +142 this week
            </span>
          </div>

          {/* Card 2 */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Today&apos;s Washes
            </span>
            <div className="text-3xl font-extrabold text-[#0B132B] mt-1">
              7,940
            </div>
            <span className="text-[11px] text-blue-600 font-semibold block mt-1">
              8,421 scheduled daily
            </span>
          </div>

          {/* Card 3 */}
          <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Completion Rate
            </span>
            <div className="text-3xl font-extrabold text-emerald-600 mt-1">
              94.3%
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Target benchmark: &gt;92%
            </span>
          </div>

          {/* Card 4 (Exceptions) */}
          <div className="premium-card p-5 bg-white border-amber-300 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
              Open Issues / Exceptions
            </span>
            <div className="text-3xl font-extrabold text-amber-600 mt-1">
              27
            </div>
            <span className="text-[11px] text-amber-700 font-semibold block mt-1">
              Requires Ops Intervention
            </span>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT: LIVE OPERATIONS & EXCEPTIONS PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: LIVE OPERATIONS TABLE (Section 20) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B132B]">
                  Live Society Operations
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time society progress & capacity health
                </p>
              </div>
              <Link
                href="/admin/societies"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Manage All Societies →
              </Link>
            </div>

            <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Society</th>
                    <th className="p-4 text-center">Progress</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {societies.map((soc) => (
                    <tr key={soc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {soc.name}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {soc.address} • {soc.active_washers} Washers
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800 text-sm">
                        {soc.completed_count} / {soc.total_today}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            soc.status_indicator === 'green'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : soc.status_indicator === 'yellow'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          <span>
                            {soc.status_indicator === 'green'
                              ? '🟢 Normal'
                              : soc.status_indicator === 'yellow'
                              ? '🟡 Minor Delay'
                              : '🔴 Bottleneck'}
                          </span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href="/admin/societies"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800"
                        >
                          Allocate
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: EXCEPTIONS RESOLUTION QUEUE (Section 20) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#0B132B]">
                  Exception Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Where operations managers resolve delays
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setSelectedExceptionFilter('unresolved')}
                  className={`px-2 py-1 rounded-md ${
                    selectedExceptionFilter === 'unresolved'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Open Only
                </button>
                <button
                  onClick={() => setSelectedExceptionFilter('all')}
                  className={`px-2 py-1 rounded-md ${
                    selectedExceptionFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredExceptions.map((exc) => (
                <div
                  key={exc.id}
                  className={`premium-card p-4 bg-white border shadow-xs space-y-2.5 transition-all ${
                    exc.resolved ? 'border-slate-200 opacity-60' : 'border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-600 text-sm">⚠</span>
                      <h3 className="text-xs font-extrabold text-[#0B132B]">
                        {exc.title}
                      </h3>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {exc.time}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {exc.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex justify-between">
                    <span>
                      <strong>Society:</strong> {exc.society}
                    </span>
                    <span>
                      <strong>Partner:</strong> {exc.washer}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400">
                      Target: {exc.vehicle}
                    </span>
                    {!exc.resolved ? (
                      <button
                        onClick={() => resolveException(exc.id)}
                        className="px-3 py-1.5 rounded-lg bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-[11px] shadow-xs active:scale-[0.98]"
                      >
                        Resolve Exception
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ Resolved
                      </span>
                    )}
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
