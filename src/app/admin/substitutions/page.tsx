'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  UserCheck,
  Clock,
  Car,
  RotateCcw,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import {
  fetchSubstitutionsFromFirestore,
  revertBackupAssignmentInFirestore,
} from '@/lib/firebaseService';
import { WasherSubstitutionAudit } from '@/lib/types';

export default function AdminSubstitutionsPage() {
  const [substitutions, setSubstitutions] = useState<WasherSubstitutionAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  const loadSubstitutions = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const records = await fetchSubstitutionsFromFirestore();
      setSubstitutions(records);
    } catch (err) {
      console.warn('Error fetching substitutions from Firestore:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSubstitutions();
  }, [loadSubstitutions]);

  const handleRevert = async (subId: string) => {
    if (!window.confirm('Are you sure you want to revert this backup assignment back to the original washer?')) {
      return;
    }
    setRevertingId(subId);
    try {
      const ok = await revertBackupAssignmentInFirestore(subId);
      if (ok) {
        await loadSubstitutions(true);
      }
    } catch (err) {
      console.error('Error reverting substitution:', err);
    } finally {
      setRevertingId(null);
    }
  };

  const activeSubstitutions = substitutions.filter((s) => s.status === 'Active');

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Shift Rebalancing &amp; Coverage Audit Trail
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Washer Substitutions &amp; Leaves
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => loadSubstitutions(true)}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Refresh substitutions"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              {activeSubstitutions.length === 0
                ? 'All Routes Operating Normally'
                : `${activeSubstitutions.length} Active Substitution${activeSubstitutions.length === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>

        {/* Audit Logs Section */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="premium-card p-12 bg-white border border-slate-200/90 text-center space-y-3 max-w-lg mx-auto shadow-xs">
              <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Loading live substitution audit trail...</p>
            </div>
          ) : substitutions.length === 0 ? (
            <div className="premium-card p-12 bg-white border border-slate-200/90 text-center space-y-3 max-w-lg mx-auto shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <RefreshCw className="w-7 h-7" />
              </div>
              <h2 className="text-base font-extrabold text-[#0B132B]">
                No Active Substitutions or Leave Requests
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                All daily car wash routes are currently operating on normal schedule with primary washer partners. Emergency backup requests and leave approvals initiated by washers will appear here with full audit trail.
              </p>
            </div>
          ) : (
            substitutions.map((l) => {
              const isActive = l.status === 'Active';
              return (
                <div
                  key={l.id}
                  className={`premium-card p-6 bg-white border shadow-xs space-y-4 ${
                    isActive ? 'border-purple-200 ring-1 ring-purple-100' : 'border-slate-200/90 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-extrabold text-[#0B132B]">
                            {l.originalWasher} → Backup {l.backupWasher}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {l.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Initiated by: <strong>{l.initiatedBy}</strong>
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <button
                        type="button"
                        onClick={() => handleRevert(l.id)}
                        disabled={revertingId === l.id}
                        className="self-start sm:self-center px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${revertingId === l.id ? 'animate-spin' : ''}`} />
                        <span>{revertingId === l.id ? 'Reverting...' : 'Revert to Primary'}</span>
                      </button>
                    )}
                  </div>

                  {/* Telemetry metadata grid */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600 border border-slate-200/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Society</span>
                      <strong className="text-slate-900 truncate block">{l.society}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Duration</span>
                      <strong className="text-slate-900 block">{l.dates}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Reassigned Worklist</span>
                      <strong className="text-purple-700 block">{l.carsAffected} Vehicles</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Reason</span>
                      <strong className="text-slate-900 truncate block">{l.reason || 'Leave / Unavailable'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="font-mono">Audit ID: {l.id}</span>
                    <span>Assigned at: {new Date(l.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
