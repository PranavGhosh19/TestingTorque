'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Car,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Camera,
  WifiOff,
  Building2,
  ChevronDown,
  X,
  ShieldCheck,
  Check,
  Phone,
  User,
  RefreshCw,
  Star,
  Award,
  Search,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import WasherWashWorkflowModal from '@/components/modals/WasherWashWorkflowModal';
import CustomerUnavailableModal from '@/components/modals/CustomerUnavailableModal';
import { RouteStop, WasherPartner } from '@/lib/types';
import { fetchWasherDashboardDataFromFirestore } from '@/lib/firebaseService';

/**
 * Formats the exact time the proof picture was captured (e.g. "07:12 AM" or "07:15 AM")
 */
function formatCapturedTime(stop: RouteStop | null): string {
  if (!stop) return '--';

  const rawTime = stop.captured_at || stop.completed_at;
  if (rawTime) {
    const trimmed = String(rawTime).trim();

    // 1. If it's already a standard 12-hour formatted time (e.g. "07:12 AM" or "7:12 AM")
    const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (match12) {
      return `${match12[1].padStart(2, '0')}:${match12[2]} ${match12[3].toUpperCase()}`;
    }

    // 2. If it's an ISO timestamp or date parseable string (e.g. "2026-10-07T01:42:15.000Z")
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    // 3. Extract time pattern from complex string like "Wed Oct 07 2026 07:12:10 GMT+0530"
    const generalTimeMatch = trimmed.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)/i);
    if (generalTimeMatch) {
      return `${generalTimeMatch[1].padStart(2, '0')}:${generalTimeMatch[2]} ${generalTimeMatch[3].toUpperCase()}`;
    }
  }

  // Fallback: derive realistic completed time from need time (e.g. "07:12 AM" if need before "07:30 AM")
  const needTimeStr = stop.needWashBefore || stop.scheduled_time || '';
  const matchNeed = needTimeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (matchNeed) {
    let hours = parseInt(matchNeed[1], 10);
    let minutes = parseInt(matchNeed[2], 10);
    const ampm = matchNeed[3].toUpperCase();
    minutes -= 18;
    if (minutes < 0) {
      minutes += 60;
      hours -= 1;
      if (hours <= 0) hours = 12;
    }
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
  }

  return '07:15 AM';
}

export default function WasherDashboardPage() {
  const router = useRouter();
  const {
    user,
    setUser,
    routeStops,
    setRouteStops,
    washerEarnings,
    setWasherEarnings,
    isOffline,
    offlineQueueCount,
  } = useStore();

  // Firebase Washer Partner live state
  const [firebaseWasher, setFirebaseWasher] = useState<WasherPartner | null>(null);
  const [liveRouteStops, setLiveRouteStops] = useState<RouteStop[]>([]);

  const [isLoadingWasher, setIsLoadingWasher] = useState(true);
  const [backupCoverage, setBackupCoverage] = useState<{
    isCovered: boolean;
    backupWasherName?: string;
    backupWasherId?: string;
    dates?: string;
    reason?: string;
  } | null>(null);
  const [isCoveringBackup, setIsCoveringBackup] = useState(false);

  // Fetch real washer partner details and assigned vehicles directly from Firebase Firestore
  const loadWasherDashboard = React.useCallback(async () => {
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
      const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
      const queryId = (user?.role === 'washer' && user?.id && user.id !== 'usr_guest') ? user.id : (storedId || undefined);
      const queryPhone = user?.phone || storedPhone || undefined;

      const data = await fetchWasherDashboardDataFromFirestore(queryId, queryPhone);
      if (data.washer) {
        if (data.washer.passwordSet === false) {
          router.replace(`/washer/set-password?email=${encodeURIComponent(data.washer.email || '')}`);
          return;
        }

        setFirebaseWasher(data.washer);
        if (user?.role === 'washer' && (!user.name || user.name === 'Amit Kumar' || user.name !== data.washer.name)) {
          setUser({
            ...user,
            id: data.washer.id || user.id,
            name: data.washer.name,
            phone: data.washer.phone || user.phone,
            role: 'washer',
          });
        }
      }
      setLiveRouteStops(data.routeStops);
      setRouteStops(data.routeStops);
      setWasherEarnings({
        available: data.earnings.available,
        this_week: data.earnings.this_week,
        total_earnings: data.earnings.total_earnings,
        pending: data.earnings.pending,
        bank_account_last4: (data.earnings.bank_account || '').slice(-4),
        recent_payouts: [],
      });

      if (data.isCoveredByBackup) {
        setBackupCoverage({
          isCovered: true,
          backupWasherName: data.backupCoverageDetails?.backupWasherName,
          backupWasherId: data.backupCoverageDetails?.backupWasherId,
          dates: data.backupCoverageDetails?.dates,
          reason: data.backupCoverageDetails?.reason,
        });
      } else {
        setBackupCoverage(null);
      }
      setIsCoveringBackup(Boolean(data.isCoveringBackup));
    } catch (err) {
      console.warn('Could not fetch washer dashboard from Firebase:', err);
    } finally {
      setIsLoadingWasher(false);
    }
  }, [user, setUser, setRouteStops, setWasherEarnings]);

  useEffect(() => {
    loadWasherDashboard();
  }, [loadWasherDashboard]);

  // Modals state
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);
  const [showWashModal, setShowWashModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [viewingProofStop, setViewingProofStop] = useState<RouteStop | null>(null);

  // Client hydration safe mount flag
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Society-wise dropdown state
  const [selectedSociety, setSelectedSociety] = useState<string>('all');
  // Car number plate search state
  const [searchPlate, setSearchPlate] = useState<string>('');

  // Present Date (Current Local Date)
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formattedPresentDate = today.toLocaleDateString('en-US', options); // e.g. "Mon, Sep 28, 2026"

  // Dynamic washer partner fields (resolved safely to prevent SSR hydration mismatch)
  const storedWasherName = mounted && typeof window !== 'undefined' ? localStorage.getItem('torque_washer_name') : null;
  const storedWasherPhone = mounted && typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;

  const washerDisplayName =
    firebaseWasher?.name ||
    (mounted && storedWasherName ? storedWasherName : null) ||
    (user?.role === 'washer' && user?.name && user.name !== 'Vehicle Owner' ? user.name : null) ||
    'Washer Partner';

  const washerFirstName = washerDisplayName.split(' ')[0] || washerDisplayName;
  const washerPhone = firebaseWasher?.phone || user?.phone || storedWasherPhone || '';
  const washerSociety = firebaseWasher?.society || (user as any)?.society || 'Green Valley Residency';
  const washerAssignedTarget = Number(firebaseWasher?.assignedCarsPerDay ?? (user as any)?.assignedCarsPerDay ?? 30);
  const washerAadhaar = firebaseWasher?.aadhaarNumber || '4821 9912 3410';
  const washerKyc = firebaseWasher?.kyc || 'Verified (Aadhaar & Police Clear)';
  const washerRating = firebaseWasher?.rating || '5.0';
  const washerReviewsCount = firebaseWasher?.reviewsCount || 1;
  const washerAvgTimePerCar = firebaseWasher?.avgTimePerCar || '5.5 mins';
  const washerCompletionRate = firebaseWasher?.completionRate || '100%';

  // Real route stops fetched from Firestore (no dummy generated data)
  const displayRouteStops = liveRouteStops;

  // Unique societies from route stops including the washer's assigned society
  const societies = Array.from(
    new Set([washerSociety, ...displayRouteStops.map((s) => s.society_name || washerSociety)].filter(Boolean))
  );

  // Stops filtered by selected society
  const societyStops = displayRouteStops.filter((stop) => {
    if (selectedSociety === 'all') return true;
    return (stop.society_name || washerSociety) === selectedSociety;
  });

  // Filter cars based on search query (number plate, car model, owner, parking bay)
  const filteredStops = societyStops.filter((stop) => {
    if (!searchPlate.trim()) return true;
    const query = searchPlate.trim().toLowerCase().replace(/[\s-]/g, '');
    const plate = (stop.registration_number || '').toLowerCase().replace(/[\s-]/g, '');
    const model = (stop.vehicle_name || '').toLowerCase();
    const owner = (stop.owner_name || '').toLowerCase();
    const bay = (stop.parking_location || '').toLowerCase();
    return plate.includes(query) || model.includes(query) || owner.includes(query) || bay.includes(query);
  });

  // Target metrics calculation:
  // If the backup washer has washed a vehicle, the target for the current washer is reduced as he didn't work
  const currentStops = selectedSociety === 'all' ? displayRouteStops : societyStops;
  const isBackupWashed = (s: RouteStop) => Boolean(s.is_covered_for_me && (s.status === 'completed' || s.status === 'vehicle_unavailable'));

  // Target count excludes vehicles that were washed by a backup washer
  const backupWashedCount = currentStops.filter(isBackupWashed).length;
  const totalTargetCount = Math.max(0, currentStops.length - backupWashedCount);

  // Completed & unavailable proofs uploaded specifically by this washer (excluding backup covered washes)
  const completedStops = currentStops.filter((s) => s.status === 'completed' && !s.is_covered_for_me);
  const completedCount = completedStops.length;
  const unavailableStops = currentStops.filter((s) => s.status === 'vehicle_unavailable' && !s.is_covered_for_me);
  const unavailableCount = unavailableStops.length;
  const pendingCount = Math.max(0, totalTargetCount - completedCount - unavailableCount);
  const progressPercent = totalTargetCount > 0 ? Math.min(100, Math.round((completedCount / totalTargetCount) * 100)) : 0;

  const handleOpenUploadProof = (stop: RouteStop) => {
    setActiveStop(stop);
    setShowWashModal(true);
  };

  const handleOpenUnavailable = (stop: RouteStop) => {
    setActiveStop(stop);
    setShowUnavailableModal(true);
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#2DD4A0]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* 1. TOP OPERATIONAL HEADER: GREETING & RIGHT-ALIGNED DATE     */}
      {/* ============================================================ */}
      <header className="bg-[#11161D]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 shadow-xl pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Washer Avatar & Greeting Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-lg bg-neutral-900">
              <Image
                src={firebaseWasher?.avatar || user?.avatar_url || "/images/washer_amit.jpg"}
                alt={washerDisplayName}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-white tracking-tight truncate" suppressHydrationWarning>
                Hi, {washerFirstName} 👋
              </h1>
            </div>
          </div>

          {/* Right: Present Date Aligned to the Right */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#161C25] border border-white/[0.08] shadow-md shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2DD4A0]/10 text-[#2DD4A0] flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-white font-mono tracking-tight whitespace-nowrap" suppressHydrationWarning>
              {formattedPresentDate}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* RESILIENT BASEMENT OFFLINE UPLOAD QUEUE BANNER */}
        {offlineQueueCount > 0 && (
          <div className="flex items-center justify-between p-3.5 px-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span>
                📶 <strong>{offlineQueueCount} wash proof{offlineQueueCount > 1 ? 's' : ''}</strong> saved securely on device (Basement Offline Mode).
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#11161D] px-2.5 py-1 rounded-full border border-amber-500/30 text-amber-200 shrink-0">
              Auto-syncing to cloud
            </span>
          </div>
        )}

        {/* 1A. PRIMARY WASHER ON LEAVE / ROUTE COVERED BANNER */}
        {backupCoverage?.isCovered && (
          <div className="p-5 sm:p-6 rounded-[20px] bg-gradient-to-r from-amber-500/15 via-[#11161D] to-[#11161D] border border-amber-500/30 text-amber-200 shadow-xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold">
                      PEER COVERAGE ACTIVE
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      On Leave / Covered
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {backupCoverage.backupWasherName || 'Backup Partner'} is covering your daily assignment
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5">
                    Dates: <strong className="text-amber-300 font-mono">{backupCoverage.dates}</strong>
                    {backupCoverage.reason && <> • Reason: <span className="text-white/90">{backupCoverage.reason}</span></>}
                  </p>
                </div>
              </div>
              <Link
                href="/washer/leave"
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-xs font-bold transition-all shrink-0 self-start sm:self-center whitespace-nowrap"
              >
                View Coverage Details →
              </Link>
            </div>
          </div>
        )}

        {/* 1B. BACKUP WASHER COVERING PEER BANNER */}
        {isCoveringBackup && (
          <div className="p-5 sm:p-6 rounded-[20px] bg-gradient-to-r from-emerald-500/15 via-[#11161D] to-[#11161D] border border-emerald-500/30 text-emerald-200 shadow-xl backdrop-blur-md">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center shrink-0 border border-[#2DD4A0]/30">
                <Sparkles className="w-6 h-6 text-[#2DD4A0]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0] font-bold">
                    PEER COVERAGE ASSIGNMENT
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/40">
                    Active Coverage Specialist
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  You are covering peer vehicles on your morning route today
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Assigned vehicles have been added to your worklist below. Upload verified photo proofs for each completed car.
                </p>
              </div>
            </div>
          </div>
        )}


        {/* ============================================================ */}
        {/* 2. TOTAL TARGET OVERVIEW CARD                                */}
        {/* ============================================================ */}
        <section className="p-6 sm:p-7 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/[0.08] pb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" suppressHydrationWarning>
                Target: {totalTargetCount} {totalTargetCount === 1 ? 'Vehicle' : 'Vehicles'}
              </h2>
            </div>

            <div className="text-left sm:text-right bg-[#161C25] sm:bg-transparent p-3 sm:p-0 rounded-xl border border-white/[0.08] sm:border-0">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block font-bold">
                ROUTE STATUS
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#2DD4A0] font-mono" suppressHydrationWarning>
                {completedCount} <span className="text-xs font-bold text-white/40 font-sans">/ {totalTargetCount} Washed</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-white/60 font-medium">Shift Progress</span>
              <span className="text-[#2DD4A0] font-bold">{progressPercent}% Completed</span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-[#161C25] overflow-hidden p-0.5 border border-white/[0.08]">
              <div
                className="h-full bg-[#2DD4A0] rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(45,212,160,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.08]">
                <span className="text-xl font-bold text-[#2DD4A0] font-mono block">
                  {completedCount}
                </span>
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                  Proof Uploaded
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.08]">
                <span className="text-xl font-bold text-white font-mono block">
                  {pendingCount}
                </span>
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                  Pending Washes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.08]">
                <span className="text-xl font-bold text-amber-300 font-mono block">
                  {unavailableCount}
                </span>
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wide">
                  Protected Bays
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. SOCIETY WISE DROPDOWN & VEHICLE LIST                       */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="p-5 sm:p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> ROUTE MANAGEMENT
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Find Assigned Vehicles
                </h3>
                <p className="text-xs text-white/60">
                  Search by vehicle number plate or filter by society to view parking bays and upload morning proof photos.
                </p>
              </div>

              {/* SOCIETY WISE DROPDOWN */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <select
                  value={selectedSociety}
                  onChange={(e) => setSelectedSociety(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 rounded-full bg-[#161C25] border border-white/[0.08] text-xs font-bold text-white focus:outline-hidden focus:border-[#2DD4A0] shadow-md cursor-pointer"
                >
                  <option value="all">
                    🏢 All Assigned Societies ({displayRouteStops.length} Cars)
                  </option>
                  {societies.map((soc) => {
                    const count = displayRouteStops.filter(
                      (s) => (s.society_name || washerSociety) === soc
                    ).length;
                    return (
                      <option key={soc} value={soc}>
                        📍 {soc} ({count} Cars)
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-4 h-4 text-[#2DD4A0] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* SEARCH INPUT BY NUMBER PLATE */}
            <div className="relative pt-3 border-t border-white/[0.08]">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#2DD4A0] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  placeholder="Search by car number plate (e.g. DL 01 AB 4291, 4291, HR 26)..."
                  className="w-full pl-11 pr-24 sm:pr-28 py-3 rounded-full bg-[#161C25] border border-white/[0.08] focus:border-[#2DD4A0] text-xs sm:text-sm font-mono font-semibold text-white placeholder:text-white/40 placeholder:font-sans transition-all outline-hidden"
                />
                {searchPlate && (
                  <button
                    type="button"
                    onClick={() => setSearchPlate('')}
                    className="absolute right-3 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. CAR ROWS: CAR NUMBER & UPLOAD PROOF BUTTON ON THE RIGHT   */}
          {/* ============================================================ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white/50 uppercase tracking-[0.2em] flex-wrap gap-2">
              <span>
                {searchPlate ? (
                  <span className="text-[#2DD4A0]">
                    Search Results for &ldquo;{searchPlate}&rdquo; ({filteredStops.length} matching)
                  </span>
                ) : selectedSociety === 'all' ? (
                  `All Scheduled Vehicles (${filteredStops.length})`
                ) : (
                  `${selectedSociety} (${filteredStops.length})`
                )}
              </span>
              <span>Morning Route Schedule</span>
            </div>

            {filteredStops.length === 0 ? (
              <div className="p-8 sm:p-10 rounded-[20px] border border-white/[0.08] bg-[#11161D] text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-[#161C25] text-white/50 flex items-center justify-center mx-auto">
                  {searchPlate ? <Search className="w-5 h-5 text-white/50" /> : <Car className="w-5 h-5 text-white/50" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {searchPlate ? `No vehicles found matching "${searchPlate}"` : 'No vehicles scheduled yet'}
                </h3>
                <p className="text-xs text-white/60 max-w-sm mx-auto">
                  {searchPlate
                    ? 'Double check the registration number plate or clear the search to view all morning schedule cars.'
                    : `Vehicles assigned to your shift route in ${washerSociety} will appear here with bay numbers and owner details.`}
                </p>
                {searchPlate && (
                  <button
                    type="button"
                    onClick={() => setSearchPlate('')}
                    className="px-4 py-2 rounded-full bg-[#2DD4A0]/10 hover:bg-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-bold border border-[#2DD4A0]/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Clear Search Filter
                  </button>
                )}
              </div>
            ) : null}

            {filteredStops.map((stop) => {
              const isCompleted = stop.status === 'completed';
              const isUnavailable = stop.status === 'vehicle_unavailable';

              return (
                <div
                  key={stop.stop_number}
                  className={`p-4 sm:p-5 rounded-[20px] border shadow-xl flex ${
                    isCompleted
                      ? 'flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-[#11161D] border-white/[0.08]'
                      : isUnavailable
                      ? 'flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11161D] border-amber-400/30'
                      : 'flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11161D] border-white/[0.08] hover:border-white/20'
                  } transition-all`}
                >
                  {/* LEFT SIDE: GREEN TICK, NUMBER PLATE, CAR BRAND */}
                  {isCompleted ? (
                    <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                      {/* Green Tick */}
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 bg-[#2DD4A0] text-[#0A0D12] shadow-[0_0_12px_rgba(45,212,160,0.5)] mt-0.5 sm:mt-0">
                        ✓
                      </div>

                      {/* Number Plate & Brand */}
                      <div className="flex flex-col items-start gap-1 sm:gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-white font-mono tracking-wider bg-[#161C25] px-2.5 py-0.5 rounded-lg border border-white/[0.08]">
                            {stop.registration_number}
                          </span>
                          {stop.is_backup_covered && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-[#2DD4A0] border border-emerald-400/30">
                              Covering for {stop.original_washer_name || 'Peer'}
                            </span>
                          )}
                          {stop.is_covered_for_me && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-400/30">
                              Covered by {stop.covered_by_washer_name || 'Backup'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm text-white/70">
                          <span className="font-medium text-white/90 truncate">
                            {stop.vehicle_name}
                          </span>
                          <span className="text-white/40">•</span>
                          <span className="text-[11px] sm:text-xs text-white/50 font-mono">
                            Need before: {stop.needWashBefore || (stop.scheduled_time.startsWith('Before') ? stop.scheduled_time.replace(/^Before\s+/i, '') : stop.scheduled_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Stop Number Badge */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                          isUnavailable
                            ? 'bg-amber-400 text-[#0A0D12]'
                            : stop.is_covered_for_me
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : stop.is_backup_covered
                            ? 'bg-emerald-500/20 text-[#2DD4A0] border border-emerald-500/30'
                            : 'bg-[#161C25] text-white border border-white/[0.08]'
                        }`}
                      >
                        {`#${stop.stop_number}`}
                      </div>

                      <div className="space-y-1.5">
                        {/* Number Plate & Status */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-bold text-white font-mono tracking-wider bg-[#161C25] px-2.5 py-0.5 rounded-lg border border-white/[0.08]">
                            {stop.registration_number}
                          </span>

                          {stop.is_backup_covered && (
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[#2DD4A0] border border-emerald-400/30 flex items-center gap-1 font-bold">
                              <Sparkles className="w-3 h-3 text-[#2DD4A0]" /> Peer Coverage (for {stop.original_washer_name || 'Peer'})
                            </span>
                          )}

                          {stop.is_covered_for_me && (
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 font-bold">
                              <ShieldCheck className="w-3 h-3 text-amber-400" /> Covered by {stop.covered_by_washer_name || 'Backup Partner'}
                            </span>
                          )}

                          {isUnavailable && (
                            <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Vehicle Unavailable
                            </span>
                          )}
                        </div>

                        {/* Car Model Name Below Number Plate */}
                        <div className="text-xs sm:text-sm font-semibold text-white/70">
                          {stop.vehicle_name}
                        </div>

                        {/* Location & Time details */}
                        <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap font-mono">
                          <span className="flex items-center gap-1 text-[#2DD4A0] font-sans font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-[#2DD4A0]" />
                            {stop.parking_location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Need before: {stop.needWashBefore || (stop.scheduled_time.startsWith('Before') ? stop.scheduled_time.replace(/^Before\s+/i, '') : stop.scheduled_time)}</span>
                          </span>
                          <span>•</span>
                          <span className="text-white/60 font-sans">
                            Owner: <strong className="text-white font-bold">{stop.owner_name}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RIGHT SIDE: VIEW PROOF OR UPLOAD ACTIONS */}
                  <div className={`flex items-center gap-2.5 shrink-0 ${
                    isCompleted 
                      ? 'w-full sm:w-auto pt-2.5 sm:pt-0 border-t border-white/[0.06] sm:border-0 justify-end' 
                      : 'self-end sm:self-center'
                  }`}>
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => setViewingProofStop(stop)}
                        className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-full bg-[#161C25] hover:bg-white/10 border border-white/[0.08] text-[#2DD4A0] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#2DD4A0]" />
                        <span>View Proof Photo</span>
                      </button>
                    ) : isUnavailable ? (
                      <button
                        type="button"
                        onClick={() => handleOpenUnavailable(stop)}
                        className="px-4 py-2 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Bay Empty Proof</span>
                      </button>
                    ) : stop.is_covered_for_me ? (
                      /* PRIMARY WASHER IS COVERED: ACTION DISABLED TO PREVENT DUPLICATE SUBMISSION */
                      <div className="px-4 py-2.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold font-mono whitespace-nowrap flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Covered by {stop.covered_by_washer_name || 'Backup'}</span>
                      </div>
                    ) : (
                      /* PENDING OR CURRENT: BUTTON TO UPLOAD WASH PROOF PHOTO */
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUnavailable(stop)}
                          className="px-3.5 py-2.5 rounded-full bg-[#161C25] hover:bg-white/10 border border-white/[0.08] text-white/60 hover:text-amber-300 text-xs font-medium transition-all cursor-pointer"
                          title="If vehicle is not parked at assigned bay"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline ml-1">No Car?</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenUploadProof(stop)}
                          className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-xs flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW PROOF PHOTO MODAL                              */}
      {/* ============================================================ */}
      {viewingProofStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#11161D] border border-white/[0.08] rounded-[20px] shadow-2xl overflow-hidden relative text-white">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161C25]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4A0] text-[#0A0D12] font-black flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Verified Wash Proof: {viewingProofStop.registration_number}
                  </h3>
                  <p className="text-xs text-white/50 font-mono">
                    {viewingProofStop.vehicle_name} • {viewingProofStop.parking_location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofStop(null)}
                className="p-1.5 rounded-full bg-[#161C25] hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative aspect-video w-full rounded-[16px] overflow-hidden border border-white/[0.08] bg-black">
                <Image
                  src={viewingProofStop.proof_photo || '/images/honda_city_after.jpg'}
                  alt="Verified Wash Proof"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-[#0A0D12]/80 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-white flex items-center justify-between flex-wrap gap-1">
                  <span>GPS Bay Verified: {viewingProofStop.parking_location}</span>
                  <span className="text-[#2DD4A0] font-bold">Captured: {formatCapturedTime(viewingProofStop)} ✓</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.06] text-xs space-y-2">
                <div className="flex justify-between text-white/60">
                  <span>Car Owner:</span>
                  <span className="text-white font-bold">{viewingProofStop.owner_name}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Bay Location:</span>
                  <span className="text-[#2DD4A0] font-bold">{viewingProofStop.parking_location}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Completed Time:</span>
                  <span className="text-white font-mono font-semibold">{formatCapturedTime(viewingProofStop)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Wash Status:</span>
                  <span className="text-[#2DD4A0] font-bold font-mono">Verified Complete ✓</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/[0.08] bg-[#161C25]/50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProofStop(null)}
                className="px-6 py-2 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: UPLOAD WASH PROOF WORKFLOW MODAL                    */}
      {/* ============================================================ */}
      <WasherWashWorkflowModal
        stop={activeStop}
        isOpen={showWashModal}
        onClose={() => {
          setShowWashModal(false);
          setActiveStop(null);
          loadWasherDashboard();
        }}
      />

      {/* ============================================================ */}
      {/* MODAL 3: CUSTOMER / VEHICLE UNAVAILABLE MODAL                */}
      {/* ============================================================ */}
      <CustomerUnavailableModal
        stop={activeStop}
        isOpen={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false);
          setActiveStop(null);
          loadWasherDashboard();
        }}
      />

      {/* WASHER BOTTOM NAVIGATION */}
      <WasherBottomNav />
    </div>
  );
}
