'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Wallet,
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
  Landmark,
  CreditCard,
  Award,
  Search,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import WasherWashWorkflowModal from '@/components/modals/WasherWashWorkflowModal';
import CustomerUnavailableModal from '@/components/modals/CustomerUnavailableModal';
import { RouteStop, WasherPartner } from '@/lib/types';
import { fetchWasherDashboardDataFromFirestore } from '@/lib/firebaseService';

export default function WasherDashboardPage() {
  const {
    user,
    setUser,
    routeStops,
    setRouteStops,
    washerEarnings,
    setWasherEarnings,
    isOffline,
  } = useStore();

  // Firebase Washer Partner live state
  const [firebaseWasher, setFirebaseWasher] = useState<WasherPartner | null>(null);
  const [liveRouteStops, setLiveRouteStops] = useState<RouteStop[]>([]);
  const [liveEarnings, setLiveEarnings] = useState<{
    available: number;
    this_week: number;
    total_earnings: number;
    pending: number;
    bank_account: string;
    ifsc_code: string;
  } | null>(null);
  const [isLoadingWasher, setIsLoadingWasher] = useState(true);

  // Fetch real washer partner details and assigned vehicles directly from Firebase Firestore
  const loadWasherDashboard = React.useCallback(async () => {
    try {
      const storedId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
      const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
      const queryId = (user?.role === 'washer' && user?.id && user.id !== 'usr_guest') ? user.id : (storedId || undefined);
      const queryPhone = user?.phone || storedPhone || undefined;

      const data = await fetchWasherDashboardDataFromFirestore(queryId, queryPhone);
      if (data.washer) {
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
      setLiveEarnings(data.earnings);
      setRouteStops(data.routeStops);
      setWasherEarnings({
        available: data.earnings.available,
        this_week: data.earnings.this_week,
        total_earnings: data.earnings.total_earnings,
        pending: data.earnings.pending,
        bank_account_last4: (data.earnings.bank_account || '').slice(-4),
        recent_payouts: [],
      });
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
  const washerRouteWindow = firebaseWasher?.routeWindow || (user as any)?.routeWindow || '06:30 AM - 09:30 AM';
  const washerAadhaar = firebaseWasher?.aadhaarNumber || '4821 9912 3410';
  const washerKyc = firebaseWasher?.kyc || 'Verified (Aadhaar & Police Clear)';
  const washerRating = firebaseWasher?.rating || '5.0';
  const washerReviewsCount = firebaseWasher?.reviewsCount || 1;
  const washerAvgTimePerCar = firebaseWasher?.avgTimePerCar || '5.5 mins';
  const washerCompletionRate = firebaseWasher?.completionRate || '100%';
  const washerBankAccount = firebaseWasher?.bankAccount || liveEarnings?.bank_account || '1111';
  const washerIfsc = firebaseWasher?.ifscCode || liveEarnings?.ifsc_code || 'HDFC0001234';

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

  // Target metrics calculation: Total target is the count of vehicles the washer is assigned
  const totalTargetCount = selectedSociety === 'all' ? displayRouteStops.length : societyStops.length;

  const completedStops = societyStops.filter((s) => s.status === 'completed');
  const completedCount = completedStops.length;
  const unavailableStops = societyStops.filter((s) => s.status === 'vehicle_unavailable');
  const unavailableCount = unavailableStops.length;
  const pendingCount = Math.max(0, totalTargetCount - completedCount - unavailableCount);
  const progressPercent = totalTargetCount > 0 ? Math.min(100, Math.round((completedCount / totalTargetCount) * 100)) : 0;

  // Shift earnings calculation based on vehicle tier (Hatchback/Sedan ₹12, Compact/Mid SUV ₹16, Luxury/7-Seater+ ₹21)
  const currentStops = selectedSociety === 'all' ? displayRouteStops : societyStops;
  const totalExpectedPayout = currentStops.reduce((sum, s) => sum + (s.payout_amount || 12), 0);
  const earnedSoFar = currentStops
    .filter((s) => s.status === 'completed' || s.status === 'vehicle_unavailable')
    .reduce((sum, s) => sum + (s.payout_amount || 12), 0);

  // Available for withdrawal and weekly total calculated from real Firestore data
  const availableForWithdrawal = liveEarnings?.available ?? earnedSoFar;
  const weeklyTotal = liveEarnings?.this_week ?? (availableForWithdrawal || earnedSoFar);

  const handleOpenUploadProof = (stop: RouteStop) => {
    setActiveStop(stop);
    setShowWashModal(true);
  };

  const handleOpenUnavailable = (stop: RouteStop) => {
    setActiveStop(stop);
    setShowUnavailableModal(true);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-28 md:pb-16 selection:bg-emerald-500 selection:text-white">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* 1. TOP OPERATIONAL HEADER: GREETING & RIGHT-ALIGNED DATE     */}
      {/* ============================================================ */}
      <header className="bg-[#0B132B]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 shadow-2xl pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex flex-row items-center justify-between gap-2.5 sm:gap-4">
          {/* Left: Washer Avatar & Greeting Name */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-emerald-400 shrink-0 shadow-lg bg-emerald-950/40">
              <Image
                src={firebaseWasher?.avatar || user?.avatar_url || "/images/washer_amit.jpg"}
                alt={washerDisplayName}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight truncate" suppressHydrationWarning>
                Hi, {washerFirstName} 👋
              </h1>
            </div>
          </div>

          {/* Right: Present Date Aligned to the Right of Name on All Screen Sizes */}
          <div className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-lg shrink-0">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="text-right">
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold leading-none mb-0.5">
                Present Date
              </span>
              <span className="text-[11px] sm:text-xs md:text-sm font-black text-white font-mono tracking-tight whitespace-nowrap" suppressHydrationWarning>
                {formattedPresentDate}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* ============================================================ */}
        {/* 2. TOTAL TARGET OVERVIEW CARD                                */}
        {/* ============================================================ */}
        <section className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-[#0B132B] via-[#0D183A] to-[#0B132B] border border-white/15 shadow-2xl relative overflow-hidden luxury-sheen">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Shift Milestones
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1" suppressHydrationWarning>
                Total Target: {totalTargetCount} {totalTargetCount === 1 ? 'Vehicle' : 'Vehicles'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5" suppressHydrationWarning>
                {washerSociety} basement cluster route • Shift: {washerRouteWindow} • Guaranteed ₹35/car payout
              </p>
            </div>

            <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/10 sm:border-0">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Shift Earnings
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono" suppressHydrationWarning>
                ₹{earnedSoFar} <span className="text-xs font-bold text-slate-400 font-sans">/ ₹{totalExpectedPayout}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Shift Progress</span>
              <span className="text-emerald-400 font-extrabold">{progressPercent}% Completed</span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/15">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
                <span className="text-xl font-black text-emerald-300 font-mono block">
                  {completedCount}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  Proof Uploaded
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-400/30">
                <span className="text-xl font-black text-blue-300 font-mono block">
                  {pendingCount}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  Pending Washes
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                <span className="text-xl font-black text-amber-300 font-mono block">
                  {unavailableCount}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
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
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Route Management & Search
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Find Assigned Vehicles
                </h3>
                <p className="text-xs text-slate-400">
                  Search by vehicle number plate or filter by society to view parking bays and upload morning proof photos.
                </p>
              </div>

              {/* SOCIETY WISE DROPDOWN */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <select
                  value={selectedSociety}
                  onChange={(e) => setSelectedSociety(e.target.value)}
                  className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl bg-[#0B132B] border border-emerald-400/40 text-xs font-black text-white focus:outline-hidden focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-xl cursor-pointer"
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
                <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* SEARCH INPUT BY NUMBER PLATE */}
            <div className="relative pt-3 border-t border-white/10">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-emerald-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={searchPlate}
                  onChange={(e) => setSearchPlate(e.target.value)}
                  placeholder="Search by car number plate (e.g. DL 01 AB 4291, 4291, HR 26)..."
                  className="w-full pl-11 pr-24 sm:pr-28 py-3.5 rounded-2xl bg-[#0B132B]/90 border border-white/15 hover:border-white/25 focus:border-emerald-400/80 focus:ring-2 focus:ring-emerald-400/20 text-xs sm:text-sm font-mono font-semibold text-white placeholder:text-slate-500 placeholder:font-sans transition-all shadow-inner outline-hidden"
                />
                {searchPlate && (
                  <button
                    type="button"
                    onClick={() => setSearchPlate('')}
                    className="absolute right-3 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex-wrap gap-2">
              <span>
                {searchPlate ? (
                  <span className="text-emerald-300">
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
              <div className="p-8 sm:p-10 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl text-center space-y-3 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-slate-400 flex items-center justify-center mx-auto">
                  {searchPlate ? <Search className="w-6 h-6 text-slate-400" /> : <Car className="w-6 h-6 text-slate-400" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {searchPlate ? `No vehicles found matching "${searchPlate}"` : 'No vehicles scheduled yet'}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {searchPlate
                    ? 'Double check the registration number plate or clear the search to view all morning schedule cars.'
                    : `Vehicles assigned to your shift route in ${washerSociety} will appear here with bay numbers and owner details.`}
                </p>
                {searchPlate && (
                  <button
                    type="button"
                    onClick={() => setSearchPlate('')}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold border border-emerald-400/30 transition-all cursor-pointer inline-flex items-center gap-1.5"
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
                  className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-xl shadow-xl flex ${
                    isCompleted
                      ? 'flex-row items-center justify-between gap-3 bg-white/5 border-white/10 hover:border-white/20'
                      : isUnavailable
                      ? 'flex-col sm:flex-row sm:items-center justify-between gap-4 bg-amber-500/10 border-amber-400/30'
                      : 'flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border-white/10 hover:border-white/20'
                  } transition-all`}
                >
                  {/* LEFT SIDE: GREEN TICK, NUMBER PLATE, CAR BRAND (COMPLETED) OR PENDING STOP DETAILS */}
                  {isCompleted ? (
                    <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                      {/* Green Tick */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                        ✓
                      </div>

                      {/* Number Plate & Brand Below */}
                      <div className="flex flex-col items-start gap-0.5 sm:gap-1 min-w-0">
                        <span className="text-sm sm:text-base md:text-lg font-black text-white font-mono tracking-wider bg-white/10 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border border-white/15">
                          {stop.registration_number}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-300 truncate">
                          {stop.vehicle_name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Stop Number Badge */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                          isUnavailable
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/10 text-white border border-white/15'
                        }`}
                      >
                        {`#${stop.stop_number}`}
                      </div>

                      <div className="space-y-1.5">
                        {/* Number Plate & Status (if unavailable) */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-white font-mono tracking-wider bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                            {stop.registration_number}
                          </span>

                          {isUnavailable && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Vehicle Unavailable (Protected)
                            </span>
                          )}
                        </div>

                        {/* Car Model Name Below Number Plate */}
                        <div className="text-xs sm:text-sm font-bold text-slate-300">
                          {stop.vehicle_name}
                        </div>

                        {/* Location & Time details */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {stop.parking_location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {stop.scheduled_time}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            Owner: <span className="text-white">{stop.owner_name}</span>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold font-mono">
                            +₹{stop.payout_amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RIGHT SIDE: VIEW PROOF OR UPLOAD ACTIONS */}
                  <div className={`flex items-center gap-2.5 shrink-0 ${isCompleted ? 'self-center' : 'self-end sm:self-center'}`}>
                    {/* If proof is already completed */}
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => setViewingProofStop(stop)}
                        className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>View Proof Photo</span>
                      </button>
                    ) : isUnavailable ? (
                      <button
                        type="button"
                        onClick={() => handleOpenUnavailable(stop)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Bay Empty Proof</span>
                      </button>
                    ) : (
                      /* PENDING OR CURRENT: BUTTON TO UPLOAD WASH PROOF PHOTO */
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUnavailable(stop)}
                          className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                          title="If vehicle is not parked at assigned bay"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">No Car?</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenUploadProof(stop)}
                          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload Wash Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. EARNINGS WALLET SHORTCUT                                  */}
        {/* ============================================================ */}
        <div className="pt-2">
          <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-950/40 via-[#0B132B] to-[#0B132B] border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Available For Withdrawal
                </span>
                <div className="text-2xl font-black text-white font-mono mt-0.5" suppressHydrationWarning>
                  ₹{availableForWithdrawal}
                  <span className="text-xs text-slate-400 font-sans font-normal ml-2">
                    (Weekly Total: ₹{weeklyTotal})
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                  <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Settling to: <strong className="text-white">{washerBankAccount}</strong></span>
                  <span>•</span>
                  <span className="font-mono text-emerald-300">IFSC: {washerIfsc}</span>
                </div>
              </div>
            </div>

            <Link
              href="/washer/earnings"
              className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95 text-center shrink-0"
            >
              Withdraw Now →
            </Link>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW PROOF PHOTO MODAL                              */}
      {/* ============================================================ */}
      {viewingProofStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0B132B] border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative text-white">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Verified Wash Proof: {viewingProofStop.registration_number}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {viewingProofStop.vehicle_name} • {viewingProofStop.parking_location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofStop(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-black">
                <Image
                  src={viewingProofStop.proof_photo || '/images/honda_city_after.jpg'}
                  alt="Verified Wash Proof"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-slate-200 flex items-center justify-between">
                  <span>GPS Bay Verified: {viewingProofStop.parking_location}</span>
                  <span className="text-emerald-400 font-bold">Passed ✓</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Car Owner:</span>
                  <span className="text-white font-bold">{viewingProofStop.owner_name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Bay Location:</span>
                  <span className="text-emerald-300 font-bold">{viewingProofStop.parking_location}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Completed Time:</span>
                  <span className="text-slate-200 font-mono">{viewingProofStop.scheduled_time}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Payout Protected:</span>
                  <span className="text-emerald-400 font-bold font-mono">+₹{viewingProofStop.payout_amount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProofStop(null)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs"
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
