'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus,
  ArrowRight,
  History,
  Home,
  Car,
  RefreshCw,
  Wifi,
  Layers,
  LogOut,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SignatureProofCard from '@/components/SignatureProofCard';
import OwnerProofCalendar from '@/components/OwnerProofCalendar';
import SundayPriorityModal from '@/components/modals/SundayPriorityModal';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import { useStore } from '@/lib/store';
import { fetchOwnerDashboardFromFirestore } from '@/lib/firebaseService';
import { Vehicle, WasherPartner, WashRecord } from '@/lib/types';
import { isPresentDateProofBefore10AM } from '@/lib/washUtils';

export default function OwnerDashboardPage() {
  const router = useRouter();
  const {
    user,
    setUser,
    vehicles,
    setVehicles,
    todayWash,
    washes,
    washers,
    isLoggedIn,
    isHydrated,
    logout,
  } = useStore();

  const [showSundayModal, setShowSundayModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // REDIRECT TO LANDING PAGE IF NOT LOGGED IN
  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  // Firebase Live Sync State
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [firebaseSource, setFirebaseSource] = useState<'firebase_live' | 'local_fallback'>('local_fallback');
  const [firebaseWasher, setFirebaseWasher] = useState<WasherPartner | null>(null);
  const [firebaseWashes, setFirebaseWashes] = useState<WashRecord[]>([]);
  const [firebaseTodayWash, setFirebaseTodayWash] = useState<WashRecord | null>(null);

  // Selected Vehicle index for multi-car garages
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);

  // Fetch live dashboard data from Firebase Firestore
  const loadFirebaseDashboard = async () => {
    setIsFirebaseSyncing(true);
    try {
      const fbData = await fetchOwnerDashboardFromFirestore(user.id, user.phone);
      
      if (fbData.user) {
        setUser(fbData.user);
        if (typeof window !== 'undefined') {
          const resolvedName = fbData.user.owner_name || fbData.user.name;
          if (resolvedName) localStorage.setItem('torque_owner_name', resolvedName);
        }
      }
      if (fbData.vehicles && fbData.vehicles.length > 0) {
        setVehicles(fbData.vehicles);
        if (typeof window !== 'undefined' && fbData.vehicles[0]?.owner_name) {
          localStorage.setItem('torque_owner_name', fbData.vehicles[0].owner_name);
        }
      }
      if (fbData.assignedWasher) {
        setFirebaseWasher(fbData.assignedWasher);
      }
      if (fbData.washes && fbData.washes.length > 0) {
        setFirebaseWashes(fbData.washes);
      }
      if (fbData.todayWash) {
        setFirebaseTodayWash(fbData.todayWash);
      }
      setFirebaseSource(fbData.source);
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Firebase dashboard fetch notice:', err);
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  useEffect(() => {
    loadFirebaseDashboard();
  }, [user.id, user.phone]);

  const activeVehicles = vehicles || [];
  const hasVehicles = activeVehicles.length > 0;
  const primaryVehicle = hasVehicles ? activeVehicles[selectedVehicleIndex] || activeVehicles[0] : null;

  // Resolve today's wash for the active vehicle
  const activeTodayWash = useMemo(() => {
    const allWashes = [...firebaseWashes, ...washes];
    const targetVehId = primaryVehicle?.id;

    const matched = allWashes.find((w) => {
      const isVehMatch = !targetVehId || w.vehicle_id === targetVehId;
      if (!isVehMatch) return false;
      const { isToday } = isPresentDateProofBefore10AM(w);
      return isToday;
    });

    if (matched) return matched;
    if (firebaseTodayWash && (!targetVehId || firebaseTodayWash.vehicle_id === targetVehId)) {
      return firebaseTodayWash;
    }
    if (todayWash && (!targetVehId || todayWash.vehicle_id === targetVehId)) {
      return todayWash;
    }
    return null;
  }, [firebaseWashes, washes, primaryVehicle?.id, firebaseTodayWash, todayWash]);

  const allVehicleWashes = useMemo(() => {
    return [...firebaseWashes, ...washes];
  }, [firebaseWashes, washes]);

  const verifiedWashesCount = useMemo(() => {
    const targetVehId = primaryVehicle?.id;
    const completedSet = new Set<string>();

    allVehicleWashes.forEach((w) => {
      const isVehMatch = !targetVehId || w.vehicle_id === targetVehId;
      if (isVehMatch && w.status === 'completed' && (w.after_photo || (w as any).proof_photo)) {
        completedSet.add(w.id);
      }
    });

    if (completedSet.size > 0) return completedSet.size;
    if (primaryVehicle?.washes_this_month && primaryVehicle.washes_this_month > 0) {
      return primaryVehicle.washes_this_month;
    }
    if (primaryVehicle?.lastWashStatus === 'completed' || (primaryVehicle as any)?.last_wash_status === 'completed') {
      return 1;
    }
    return 0;
  }, [allVehicleWashes, primaryVehicle]);

  const storedAssignedWasherName =
    typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null;
  const storedAssignedWasherId =
    typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_id') : null;

  const targetWasherId =
    firebaseWasher?.id ||
    primaryVehicle?.assigned_washer_id ||
    user.assigned_washer_id ||
    storedAssignedWasherId;

  const targetWasherName =
    firebaseWasher?.name ||
    primaryVehicle?.assigned_washer_name ||
    user.assigned_washer_name ||
    storedAssignedWasherName;

  const matchedStoreWasher = washers.find(
    (w) =>
      (targetWasherId && (w.id === targetWasherId || (w as any).uid === targetWasherId)) ||
      (targetWasherName && w.name?.toLowerCase().trim() === targetWasherName.toLowerCase().trim())
  );

  const assignedWasher: WasherPartner =
    firebaseWasher ||
    matchedStoreWasher ||
    (targetWasherName
      ? {
          id: targetWasherId || 'wsh_custom',
          name: targetWasherName,
          phone: '+91 98101 22334',
          avatar: '/images/washer_amit.jpg',
          rating: '4.98',
          reviewsCount: 142,
          society: 'Green Valley Residency',
          assignedCarsPerDay: 30,
          routeWindow: '06:30 AM - 09:30 AM',
          avgTimePerCar: '5.5 mins',
          completionRate: '100%',
          totalLifetimeWashes: 1840,
          status: 'Active on Route',
          kyc: 'Verified (Aadhaar & Police Clear)',
          aadhaarVerified: true,
          phoneVerified: true,
          absentThisMonth: 0,
          absentDates: [],
          leaveReason: '',
          backupWasherName: 'Rajesh Sharma',
          monthlyPayoutsGone: 48200,
          pendingPayoutDue: 2840,
          sundayBonusEarned: 1200,
          disbursements: [],
        }
      : washers[0] || {
          id: 'wsh_assigned',
          name: 'Assigned Partner',
          phone: '',
          avatar: 'https://ui-avatars.com/api/?name=Partner&background=0B132B&color=10B981&bold=true',
          rating: '4.98',
          reviewsCount: 142,
          society: 'Green Valley Residency',
          assignedCarsPerDay: 30,
          routeWindow: '06:30 AM - 09:30 AM',
          avgTimePerCar: '5.5 mins',
          completionRate: '100%',
          totalLifetimeWashes: 1840,
          status: 'Active on Route',
          kyc: 'Verified (Aadhaar & Police Clear)',
          aadhaarVerified: true,
          phoneVerified: true,
          absentThisMonth: 0,
          absentDates: [],
          leaveReason: '',
          backupWasherName: 'Backup Partner',
          monthlyPayoutsGone: 48200,
          pendingPayoutDue: 2840,
          sundayBonusEarned: 1200,
          disbursements: [],
        });

  const activePlanName =
    primaryVehicle?.selected_plan ||
    user.selected_plan ||
    'HOME BASIC';

  // Calculate opted subscription price (from Firestore user, vehicle, or body type)
  const subscriptionPrice = useMemo(() => {
    // 1. Direct price from user object (fetched from Firestore Car_Owners)
    if (user?.price && typeof user.price === 'number') {
      return user.price;
    }
    if (user?.subscription_price && typeof user.subscription_price === 'number') {
      return user.subscription_price;
    }

    // 2. Sum of vehicle prices if vehicles exist
    if (vehicles && vehicles.length > 0) {
      const sum = vehicles.reduce((acc, v) => {
        if (v.price && typeof v.price === 'number') return acc + v.price;
        if (v.subscription_price && typeof v.subscription_price === 'number') return acc + v.subscription_price;
        const t = (v.type || 'car').toLowerCase();
        if (t === 'luxury') return acc + 799;
        if (t === 'suv') return acc + 649;
        if (t === 'bike') return acc + 399;
        return acc + 599;
      }, 0);
      if (sum > 0) return sum;
    }

    // 3. Check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('torque_subscription_price');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }

    // 4. Fallback based on primary vehicle type
    if (primaryVehicle) {
      const t = (primaryVehicle.type || 'car').toLowerCase();
      if (t === 'luxury') return 799;
      if (t === 'suv') return 649;
      if (t === 'bike') return 399;
    }

    return 599;
  }, [user, vehicles, primaryVehicle]);

  // Dynamically resolve owner_name from Firebase user, primary vehicle, or localStorage
  const ownerName =
    user?.owner_name ||
    user?.name ||
    primaryVehicle?.owner_name ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_owner_name') : null) ||
    'Vehicle Owner';

  // WHILE CHECKING AUTH OR IF NOT LOGGED IN, RENDER DARK AMBIENT LOADER (REDIRECTING TO LANDING)
  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#080D1A] text-slate-100 flex items-center justify-center selection:bg-blue-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-mono font-bold text-slate-300">Authenticating Torque Care...</p>
            <p className="text-[10px] text-slate-500">Redirecting to landing page if not signed in</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-28 md:pb-16 selection:bg-blue-500 selection:text-white">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Top Welcome Header */}
      <header className="bg-[#0B132B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-2xl pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">
              Torque Care Private Dashboard
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Good Morning, {ownerName} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSundayModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all border border-amber-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sunday Priority</span>
            </button>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.replace('/');
              }}
              title="Sign out of account"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Multi-Vehicle Garage Tabs (if owner has multiple registered cars) */}
        {activeVehicles.length > 1 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1 shrink-0">
              <Layers className="w-3 h-3 text-blue-400" /> Garage:
            </span>
            {activeVehicles.map((veh, idx) => (
              <button
                key={veh.id || idx}
                onClick={() => setSelectedVehicleIndex(idx)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                  selectedVehicleIndex === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>{veh.make} {veh.model}</span>
                <span className="text-[10px] opacity-75 font-mono">({veh.registration_number})</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {!hasVehicles ? (
          /* CLEAN RESET / EMPTY GARAGE ONBOARDING HERO BANNER */
          <div className="p-8 sm:p-10 rounded-3xl bg-linear-to-b from-[#0F172A] to-[#0B132B] border border-white/10 shadow-2xl text-center space-y-6 max-w-2xl mx-auto my-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center mx-auto text-2xl shadow-inner">
              <Car className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Owner Data Clean Slate</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ready for Sign-Up & Car Onboarding
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                All previous vehicles and owner test data have been wiped clean. Register your car, select your daily doorstep wash subscription, and choose your verified society partner.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/onboarding"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Vehicle & Pick Plan</span>
              </Link>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-slate-400" />
                <span>Quick Add Vehicle</span>
              </button>
              <button
                onClick={loadFirebaseDashboard}
                disabled={isFirebaseSyncing}
                className="w-full sm:w-auto px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all border border-white/10 flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFirebaseSyncing ? 'animate-spin' : ''}`} />
                <span>Sync Firestore</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* HERO SIGNATURE PROOF CARD */}
            <SignatureProofCard
              wash={activeTodayWash || todayWash}
              vehicle={primaryVehicle || undefined}
              washerName={assignedWasher.name}
              washerAvatar={assignedWasher.avatar}
            />
          </>
        )}

        {/* TRAVEL & AWAY MODE PROPOSITION BANNER - Hidden on small screens */}
        <div className="hidden md:flex p-7 rounded-3xl bg-linear-to-r from-amber-500/20 via-[#0B132B] to-[#080D1A] text-white flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl border border-amber-500/30 specular-border luxury-sheen relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 tracking-wider">
              <span>🚗 Away Mode</span>
              <span className="text-slate-500">•</span>
              <span>Torque Care Away</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Going somewhere? Don&apos;t pause your car care.
            </h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Find nearest verified partner in Jaipur, Bengaluru, Goa & more. Book &ldquo;Until I Return&rdquo; for continuous peace of mind.
            </p>
          </div>
          <Link
            href="/owner/travel"
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 flex items-center gap-2 shadow-xl transition-all active:scale-[0.98]"
          >
            <span>Activate Away Mode</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>

        {/* SERVICE PILLARS STATUS (Selected Plan & Away Mode) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home Active Plan Card */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Torque Home Plan
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Active Membership
              </span>
            </div>
            <div className="text-xl font-black text-white">{activePlanName}</div>
            <p className="text-xs text-slate-400">
              Recurring society bay care by {assignedWasher.name} at {primaryVehicle?.society_name || 'Green Valley Residency'}.
            </p>
            {lastSyncTime && (
              <div className="text-[10px] text-slate-500 font-mono pt-1">
                Synced with Firebase Firestore at {lastSyncTime}
              </div>
            )}
          </div>

          {/* Away Mode Card */}
          <Link
            href="/owner/travel"
            className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-xl space-y-2 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> Torque Away
              </span>
              <span className="text-[10px] font-bold text-amber-300 group-hover:underline">
                Book →
              </span>
            </div>
            <div className="text-xl font-black text-white">Starting at ₹39 / wash or Book Until Return</div>
            <p className="text-xs text-slate-400">
              Nationwide partners whenever you travel to another city.
            </p>
          </Link>
        </div>

        {/* NEXT WASH & WASHER INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Next Wash Schedule */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Next Wash Schedule
              </span>
              <div className="text-lg font-black text-white mt-1">
                Tomorrow • {primaryVehicle?.preferred_wash_time || '07:30 AM'}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {primaryVehicle?.parking_location || 'Assigned Parking Bay'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Regular Washer Info */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shrink-0 shadow-md bg-slate-800">
                <Image
                  src={assignedWasher.avatar || '/images/washer_amit.jpg'}
                  alt={assignedWasher.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Assigned Partner
                </span>
                <div className="text-base font-black text-white">
                  {assignedWasher.name}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{assignedWasher.rating || '4.98'}</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    ({assignedWasher.totalLifetimeWashes || 140} washes)
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/owner/washes/history"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* THIS MONTH METRICS */}
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-3 px-1">
            This Month Overview
          </span>
          <div className="grid grid-cols-3 gap-3.5">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {verifiedWashesCount}
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Washes
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 font-mono">
                ✓ 100% Verified
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                0
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Missed
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                Auto-credited
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹{subscriptionPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Subscription
              </div>
              <span className="text-[10px] text-blue-400 font-bold block mt-0.5 font-mono">
                {activePlanName}
              </span>
            </div>
          </div>
        </div>

        {/* MONTHLY PROOF CALENDAR */}
        <OwnerProofCalendar
          assignedWasherName={assignedWasher.name}
          assignedWasherAvatar={assignedWasher.avatar}
          parkingLocation={primaryVehicle?.parking_location}
          washes={allVehicleWashes}
          todayWash={activeTodayWash}
          selectedVehicleId={primaryVehicle?.id}
        />

        {/* TORQUE CARE VEHICLE HISTORY - Hidden on small screens */}
        <section className="hidden md:block p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-400" />
                Torque Care Vehicle History
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                All services appear in one vehicle history, wherever you travel.
              </p>
            </div>
            <Link
              href="/owner/washes/history"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {washes.slice(0, 4).map((wash) => {
              const isAway = wash.service_type === 'away';
              const city = wash.city || 'Delhi';

              return (
                <div
                  key={wash.id}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isAway
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      }`}
                    >
                      {isAway ? (
                        <span className="text-sm">🚗</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap font-sans">
                        <span className="text-xs font-black text-white">
                          {wash.scheduled_date} — {city}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isAway
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {wash.service_type || 'home'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400">
                          Completed ✓
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {wash.washer_name} • {wash.parking_location}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/owner/washes/${wash.id}`}
                    className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl transition-all shrink-0"
                  >
                    View Proof
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Modals */}
      <SundayPriorityModal
        isOpen={showSundayModal}
        onClose={() => setShowSundayModal(false)}
      />
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
      />

      {/* Mobile Bottom Navigation */}
      <OwnerBottomNav />
    </div>
  );
}
