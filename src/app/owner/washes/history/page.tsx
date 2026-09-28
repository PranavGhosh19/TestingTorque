'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Clock,
  ShieldCheck,
  ChevronRight,
  Filter,
  ArrowLeft,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import OwnerProofCalendar from '@/components/OwnerProofCalendar';
import ChangeWasherModal from '@/components/modals/ChangeWasherModal';

export default function WashHistoryPage() {
  const { washes } = useStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [assignedWasher, setAssignedWasher] = useState('Amit Kumar');
  const [showChangeWasherModal, setShowChangeWasherModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'home' | 'away' | 'detail' | 'sunday'
  >('all');

  const filteredWashes = washes.filter((w) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'home') return (w.service_type || 'home') === 'home';
    if (activeFilter === 'away') return w.service_type === 'away';
    if (activeFilter === 'detail') return w.service_type === 'detail';
    if (activeFilter === 'sunday') return w.is_sunday_priority;
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Services' },
    { id: 'home', label: 'Home (₹599/mo)' },
    { id: 'away', label: 'Away Mode (Travel)' },
    { id: 'detail', label: 'Detailing Studio' },
    { id: 'sunday', label: 'Sunday Priority' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-28 md:pb-16 selection:bg-blue-500 selection:text-white">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* TOP HEADER */}
      <div className="bg-[#0B132B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/dashboard"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Verified Audit Records
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Wash History & Proof Matrix
              </h1>
            </div>
          </div>

          {/* VIEW TOGGLE: CALENDAR VS TIMELINE */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar View</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#080D1A] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Timeline List</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ============================================================ */}
        {/* TOP BANNER: ASSIGNED WASHER (LEFT) & CHANGE NOW (RIGHT)      */}
        {/* ============================================================ */}
        <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-white/10 via-white/5 to-[#0B132B] border border-white/15 backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 luxury-sheen">
          {/* Top Left: Assigned Washer: Amit Kumar */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/20 shrink-0 shadow-md">
              <Image
                src="/images/washer_amit.jpg"
                alt={assignedWasher}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Society Dedicated Partner
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  ★ 4.9 Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Assigned Washer:{' '}
                <span className="text-emerald-300 font-extrabold">{assignedWasher}</span>
              </h2>
            </div>
          </div>

          {/* Top Right: Don't like his services? Change now */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowChangeWasherModal(true)}
              className="text-xs font-bold text-slate-300 hover:text-white transition-all group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 active:scale-95 cursor-pointer shadow-md"
            >
              <span className="text-slate-300">Don&apos;t like his services?</span>
              <span className="text-blue-400 group-hover:text-blue-300 font-black underline underline-offset-2 flex items-center gap-1">
                Change now
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          </div>
        </div>
        {/* ============================================================ */}
        {/* VIEW 1: INTERACTIVE MODERN UI CALENDAR (DEFAULT)             */}
        {/* ============================================================ */}
        {viewMode === 'calendar' ? (
          <div className="space-y-6">
            <OwnerProofCalendar />
          </div>
        ) : (
          /* ============================================================ */
          /* VIEW 2: TIMELINE AUDIT LIST WITH CATEGORY FILTERS            */
          /* ============================================================ */
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    tab.id === 'detail' ? 'hidden md:inline-block' : ''
                  } ${
                    activeFilter === tab.id
                      ? 'bg-white text-[#080D1A] shadow-md'
                      : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Month Heading */}
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1 font-mono">
              <span>September 2026</span>
              <span>{filteredWashes.length} Audit Entries</span>
            </div>

            {/* Timeline Stack */}
            <div className="space-y-3.5">
              {filteredWashes.map((wash) => {
                const isReplacement = wash.is_backup_covered;
                const isSunday = wash.is_sunday_priority;
                const isAway = wash.service_type === 'away';
                const isDetail = wash.service_type === 'detail';
                const isUnavailable = wash.status === 'vehicle_unavailable';

                return (
                  <div
                    key={wash.id}
                    className={`p-5 rounded-3xl bg-white/5 border backdrop-blur-xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      isUnavailable
                        ? 'border-amber-400/30 bg-amber-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isUnavailable
                            ? 'bg-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                            : isAway
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : isDetail
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                            : isReplacement
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                            : isSunday
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                            : 'bg-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        }`}
                      >
                        {isUnavailable ? (
                          <AlertTriangle className="w-5 h-5 text-slate-950" />
                        ) : isAway ? (
                          <span className="text-base">🚗</span>
                        ) : isDetail ? (
                          <Sparkles className="w-5 h-5 text-purple-300" />
                        ) : isReplacement ? (
                          <RefreshCw className="w-5 h-5" />
                        ) : isSunday ? (
                          <Sparkles className="w-5 h-5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-slate-950" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-black text-white">
                            {wash.scheduled_date} — {wash.city || 'Delhi'}
                          </span>
                          <span className="text-xs text-slate-500">•</span>

                          {isUnavailable ? (
                            <span className="text-[11px] font-black text-amber-300 flex items-center gap-1 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                              Customer / Vehicle Unavailable
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed ✓
                            </span>
                          )}

                          {/* Tier Badge */}
                          <span
                            className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                              isUnavailable
                                ? 'bg-white/10 text-slate-300 border-white/15'
                                : isAway
                                ? 'bg-amber-500/10 text-amber-300 border-amber-400/30'
                                : isDetail
                                ? 'bg-purple-500/10 text-purple-300 border-purple-400/30'
                                : 'bg-blue-500/10 text-blue-300 border-blue-400/30'
                            }`}
                          >
                            {isUnavailable
                              ? 'Bay Photo Verified'
                              : isAway
                              ? 'Away Mode'
                              : isDetail
                              ? 'Detailing'
                              : 'Torque Home'}
                          </span>

                          {isUnavailable && (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                              Washer payout: Protected ✓
                            </span>
                          )}

                          {isReplacement && (
                            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-400/30">
                              Peer Handover: Rahul
                            </span>
                          )}

                          {isSunday && (
                            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                              Sunday Priority (₹50)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {isUnavailable
                            ? 'Washer reached assigned bay during scheduled window, but vehicle was not available. Washer: Present ✓ • Service: Not possible • Washer payout: Protected ✓ (Not classified as missed by washer).'
                            : isAway
                            ? `Away wash verified in ${wash.city || 'Jaipur'} at ${wash.parking_location} by ${wash.washer_name}.`
                            : isDetail
                            ? `Studio Detail service completed by ${wash.washer_name}.`
                            : isReplacement
                            ? 'Washer on approved leave. Handed over and covered by peer washer Rahul Sharma.'
                            : `Society bay wash verified at ${wash.parking_location} by ${wash.washer_name}.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-center shrink-0">
                      <Link
                        href={`/owner/washes/${wash.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-black text-white bg-white/10 hover:bg-white/20 border border-white/15 px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
                      >
                        <span>View Proof</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CHANGE WASHER MODAL */}
      <ChangeWasherModal
        isOpen={showChangeWasherModal}
        onClose={() => setShowChangeWasherModal(false)}
        currentWasherName={assignedWasher}
        onWasherChanged={(newWasher) => setAssignedWasher(newWasher)}
      />

      <OwnerBottomNav />
    </div>
  );
}
