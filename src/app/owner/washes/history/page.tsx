'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import OwnerProofCalendar from '@/components/OwnerProofCalendar';
import ChangeWasherModal from '@/components/modals/ChangeWasherModal';
import { fetchOwnerDashboardFromFirestore } from '@/lib/firebaseService';

export default function WashHistoryPage() {
  const router = useRouter();
  const { washes, isLoggedIn, isHydrated, user, vehicles } = useStore();
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');

  const resolvedInitialWasher =
    user?.assigned_washer_name ||
    vehicles[0]?.assigned_washer_name ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null) ||
    'Assigned Partner';

  const [assignedWasher, setAssignedWasher] = useState(resolvedInitialWasher);
  const [washerAvatar, setWasherAvatar] = useState('/images/washer_amit.jpg');
  const [showChangeWasherModal, setShowChangeWasherModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'home' | 'away' | 'detail' | 'sunday'
  >('all');

  useEffect(() => {
    let isMounted = true;
    const loadWasherData = async () => {
      const localName =
        user?.assigned_washer_name ||
        vehicles[0]?.assigned_washer_name ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null);

      if (localName && localName !== 'Amit Kumar') {
        setAssignedWasher(localName);
      }

      if (user?.id || user?.phone) {
        try {
          const fbData = await fetchOwnerDashboardFromFirestore(user.id, user.phone);
          if (!isMounted) return;
          if (fbData.assignedWasher?.name) {
            setAssignedWasher(fbData.assignedWasher.name);
            if (fbData.assignedWasher.avatar) {
              setWasherAvatar(fbData.assignedWasher.avatar);
            }
          } else if (fbData.user?.assigned_washer_name) {
            setAssignedWasher(fbData.user.assigned_washer_name);
          }
        } catch (err) {
          console.warn('History washer lookup notice:', err);
        }
      }
    };
    loadWasherData();
    return () => {
      isMounted = false;
    };
  }, [user.id, user.phone, user.assigned_washer_name, vehicles]);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#2DD4A0]" />
        <p className="text-xs tracking-widest text-white/50 font-mono uppercase">Authenticating...</p>
      </div>
    );
  }

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
    { id: 'away', label: 'Away Mode' },
    { id: 'detail', label: 'Detailing Studio' },
    { id: 'sunday', label: 'Sunday Priority' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* TOP HEADER */}
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/dashboard"
              className="p-2.5 rounded-xl bg-[#161C25] border border-white/[0.08] text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
                Verified Audit Records
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Wash History & Proof Matrix
              </h1>
            </div>
          </div>

          {/* VIEW TOGGLE: CALENDAR VS TIMELINE */}
          <div className="flex items-center gap-1.5 bg-[#11161D] p-1.5 rounded-full border border-white/[0.08] self-start sm:self-auto">
            <button
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#2DD4A0] text-[#0A0D12] shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-[#0A0D12] shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Timeline</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ASSIGNED WASHER CARD */}
        <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <Image
                src={washerAvatar || '/images/washer_amit.jpg'}
                alt={assignedWasher}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2DD4A0]">
                  Society Dedicated Specialist
                </span>
                <span className="text-[10px] font-bold text-white bg-[#161C25] px-2 py-0.5 rounded-full border border-white/[0.08]">
                  ★ 4.9 Verified
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Assigned Specialist: <span className="text-[#2DD4A0]">{assignedWasher}</span>
              </h2>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => setShowChangeWasherModal(true)}
              className="text-xs font-bold text-white/80 hover:text-white inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161C25] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            >
              <span>Change Specialist</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#2DD4A0]" />
            </button>
          </div>
        </div>

        {/* VIEW 1: INTERACTIVE MODERN UI CALENDAR */}
        {viewMode === 'calendar' ? (
          <div className="space-y-6">
            <OwnerProofCalendar />
          </div>
        ) : (
          /* VIEW 2: TIMELINE AUDIT LIST WITH CATEGORY FILTERS */
          <div className="space-y-5">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    tab.id === 'detail' ? 'hidden md:inline-block' : ''
                  } ${
                    activeFilter === tab.id
                      ? 'bg-[#2DD4A0] text-[#0A0D12] shadow-sm'
                      : 'bg-[#11161D] text-white/70 hover:text-white border border-white/[0.08]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Month Heading */}
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white/40 px-1">
              <span>September 2026</span>
              <span>{filteredWashes.length} Audit Entries</span>
            </div>

            {/* Timeline Stack */}
            <div className="space-y-3">
              {filteredWashes.map((wash) => {
                const isReplacement = wash.is_backup_covered;
                const isSunday = wash.is_sunday_priority;
                const isAway = wash.service_type === 'away';
                const isDetail = wash.service_type === 'detail';
                const isUnavailable = wash.status === 'vehicle_unavailable';

                return (
                  <div
                    key={wash.id}
                    className={`p-5 rounded-[20px] bg-[#11161D] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isUnavailable
                        ? 'border-amber-400/30 bg-amber-500/[0.03]'
                        : 'border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isUnavailable
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                            : isAway
                            ? 'bg-[#161C25] text-[#2DD4A0] border border-[#2DD4A0]/30'
                            : 'bg-[#2DD4A0]/15 text-[#2DD4A0] border border-[#2DD4A0]/30'
                        }`}
                      >
                        {isUnavailable ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        ) : isAway ? (
                          <span className="text-base">🚗</span>
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-[#2DD4A0]" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">
                            {wash.scheduled_date} — {wash.city || 'Delhi'}
                          </span>
                          <span className="text-xs text-white/30">•</span>

                          {isUnavailable ? (
                            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                              Bay Audited • Unavailable
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-[#2DD4A0] flex items-center gap-1 bg-[#2DD4A0]/10 px-2.5 py-0.5 rounded-full border border-[#2DD4A0]/20">
                              <CheckCircle2 className="w-3 h-3" />
                              Completed ✓
                            </span>
                          )}

                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-[#161C25] text-white/70 border border-white/[0.06]">
                            {isUnavailable ? 'Bay Logged' : isAway ? 'Away Mode' : 'Torque Home'}
                          </span>
                        </div>

                        <p className="text-xs text-white/60 leading-relaxed">
                          {isUnavailable
                            ? 'Specialist reached assigned bay during scheduled window. Bay photo audited.'
                            : isAway
                            ? `Away wash verified in ${wash.city || 'Jaipur'} at ${wash.parking_location} by ${wash.washer_name}.`
                            : `Society bay wash verified at ${wash.parking_location} by ${wash.washer_name}.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end sm:justify-center shrink-0">
                      <Link
                        href={`/owner/washes/${wash.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#161C25] hover:bg-white/10 border border-white/[0.08] px-4 py-2 rounded-full transition-all active:scale-95"
                      >
                        <span>View Proof</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#2DD4A0]" />
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
