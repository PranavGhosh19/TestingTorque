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
import { fetchOwnerDashboardFromFirestore, fetchAllSocieties } from '@/lib/firebaseService';
import { Vehicle, WasherPartner, WashRecord } from '@/lib/types';
import { isPresentDateProofBefore10AM, isWashFromToday } from '@/lib/washUtils';

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
  const [societyMap, setSocietyMap] = useState<Record<string, string>>({});

  // Selected Vehicle index for multi-car garages
  const [selectedVehicleIndex, setSelectedVehicleIndex] = useState(0);

  // Fetch live dashboard data from Firebase Firestore
  const loadFirebaseDashboard = async () => {
    setIsFirebaseSyncing(true);
    try {
      try {
        const socList = await fetchAllSocieties();
        if (socList && socList.length > 0) {
          const map: Record<string, string> = {};
          socList.forEach((s) => {
            if (s.id) map[s.id] = s.name;
          });
          setSocietyMap(map);
        }
      } catch (sErr) {
        // ignore
      }

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
    const targetVehId = primaryVehicle?.id;
    const combinedWashes = [...firebaseWashes, ...washes];

    const matched = combinedWashes.find((w) => {
      const isVehMatch = !targetVehId || w.vehicle_id === targetVehId;
      if (!isVehMatch) return false;
      return isWashFromToday(w);
    });

    if (matched) return matched;
    if (firebaseTodayWash && (!targetVehId || firebaseTodayWash.vehicle_id === targetVehId) && isWashFromToday(firebaseTodayWash)) {
      return firebaseTodayWash;
    }
    if (todayWash && (!targetVehId || todayWash.vehicle_id === targetVehId) && isWashFromToday(todayWash)) {
      return todayWash;
    }
    return null;
  }, [firebaseWashes, washes, primaryVehicle?.id, firebaseTodayWash, todayWash]);

  const allVehicleWashes = useMemo(() => {
    const targetVehId = primaryVehicle?.id;
    if (firebaseWashes.length > 0) {
      if (targetVehId) {
        return firebaseWashes.filter((w) => !w.vehicle_id || w.vehicle_id === targetVehId);
      }
      return firebaseWashes;
    }
    if (targetVehId) {
      return washes.filter((w) => !w.vehicle_id || w.vehicle_id === targetVehId);
    }
    return washes;
  }, [firebaseWashes, washes, primaryVehicle?.id]);

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
    (primaryVehicle?.isBackupActive ? (primaryVehicle.backupWasherId || primaryVehicle.activeWasherId) : null) ||
    firebaseWasher?.id ||
    primaryVehicle?.assigned_washer_id ||
    user.assigned_washer_id ||
    storedAssignedWasherId;

  const targetWasherName =
    (primaryVehicle?.isBackupActive ? (primaryVehicle.backupWasherName || primaryVehicle.activeWasherName) : null) ||
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

  // Resolve societies covered by the assigned washer
  const washerSocietiesCovered = useMemo(() => {
    const rawList =
      assignedWasher?.societies && assignedWasher.societies.length > 0
        ? assignedWasher.societies
        : assignedWasher?.society
        ? assignedWasher.society.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const resolvedNames = rawList.map((idOrName) => societyMap[idOrName] || idOrName);

    if (resolvedNames.length > 0) {
      return resolvedNames.join(', ');
    }
    return primaryVehicle?.society_name || user.society || (user as any).societyName || 'Assigned Society';
  }, [assignedWasher, societyMap, primaryVehicle, user]);

  const parkingBayOnly = useMemo(() => {
    const bay = primaryVehicle?.parking_location || (activeTodayWash || todayWash)?.parking_location || 'Bay Assigned';
    if (bay.includes('•')) {
      return bay.split('•').slice(1).join('•').trim();
    }
    return bay;
  }, [primaryVehicle, activeTodayWash, todayWash]);

  const dashboardLocationDisplay = useMemo(() => {
    if (washerSocietiesCovered && parkingBayOnly) {
      return `${washerSocietiesCovered} • ${parkingBayOnly}`;
    }
    return washerSocietiesCovered || parkingBayOnly;
  }, [washerSocietiesCovered, parkingBayOnly]);

  const activePlanName =
    primaryVehicle?.selected_plan ||
    user.selected_plan ||
    'HOME BASIC';

  // Calculate opted subscription price for the selected vehicle in the Garage
  const subscriptionPrice = useMemo(() => {
    // 1. Direct price from currently selected vehicle
    if (primaryVehicle) {
      if (primaryVehicle.price && typeof primaryVehicle.price === 'number') {
        return primaryVehicle.price;
      }
      if (primaryVehicle.subscription_price && typeof primaryVehicle.subscription_price === 'number') {
        return primaryVehicle.subscription_price;
      }
      const t = (primaryVehicle.type || 'car').toLowerCase();
      if (t === 'luxury') return 799;
      if (t === 'suv') return 649;
      if (t === 'bike') return 399;
      return 599;
    }

    // 2. Direct price from user object (fallback)
    if (user?.price && typeof user.price === 'number') {
      return user.price;
    }
    if (user?.subscription_price && typeof user.subscription_price === 'number') {
      return user.subscription_price;
    }

    // 3. Check localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('torque_subscription_price');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }

    return 599;
  }, [user, primaryVehicle]);

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
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#2DD4A0]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Top Welcome Header */}
      <header className="bg-[#11161D]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 shadow-xl pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0] block mb-0.5 font-bold">
              TORQUE CARE CONCIERGE
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Good Morning, {ownerName} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSundayModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all border border-amber-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sunday Priority</span>
            </button>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all border border-white/10 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-white/50" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Multi-Vehicle Garage Tabs (Select active car) */}
        {activeVehicles.length > 0 && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 flex items-center gap-1 shrink-0 font-bold">
              <Layers className="w-3.5 h-3.5 text-[#2DD4A0]" /> Garage:
            </span>
            {activeVehicles.map((veh, idx) => (
              <button
                key={veh.id || idx}
                onClick={() => setSelectedVehicleIndex(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  selectedVehicleIndex === idx
                    ? 'bg-white text-black font-bold shadow-md ring-2 ring-[#2DD4A0]/40'
                    : 'bg-[#161C25] hover:bg-white/10 text-white/70 border border-white/[0.08]'
                }`}
              >
                <Car className="w-3 h-3" />
                <span>{veh.make} {veh.model}</span>
                <span className="text-[10px] opacity-75 font-mono">({veh.registration_number})</span>
                {selectedVehicleIndex === idx && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] ml-0.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {!hasVehicles ? (
          /* CLEAN RESET / EMPTY GARAGE ONBOARDING HERO BANNER */
          <div className="p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-2xl text-center space-y-6 max-w-2xl mx-auto my-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center mx-auto text-2xl shadow-inner">
              <Car className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[#2DD4A0] text-xs font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
                <span>CLEAN GARAGE SLATE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Ready for Vehicle Onboarding
              </h2>
              <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                Register your vehicle to activate doorstep water-conscious care, daily before/after verified proof, and dedicated society specialists.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/auth/onboarding"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Vehicle & Pick Plan</span>
              </Link>
              <button
                onClick={() => setShowAddVehicleModal(true)}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-[#161C25] hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/[0.08] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-white/60" />
                <span>Quick Add Vehicle</span>
              </button>
              <button
                onClick={loadFirebaseDashboard}
                disabled={isFirebaseSyncing}
                className="w-full sm:w-auto px-4 py-3 rounded-full bg-transparent hover:bg-white/5 text-white/70 hover:text-white text-xs font-medium transition-all border border-white/[0.08] flex items-center justify-center gap-1.5"
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
              societiesCovered={washerSocietiesCovered}
              location={dashboardLocationDisplay}
            />
          </>
        )}

        {/* TRAVEL & AWAY MODE PROPOSITION BANNER */}
        <div className="hidden md:flex p-6 rounded-[20px] bg-gradient-to-r from-[#161C25] via-[#11161D] to-[#161C25] text-white flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-white/[0.08] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DD4A0]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0] bg-[#2DD4A0]/10 px-3 py-0.5 rounded-full border border-[#2DD4A0]/20 font-bold">
              <span>TORQUE CARE AWAY</span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Going somewhere? Don&apos;t pause your vehicle care.
            </h3>
            <p className="text-xs text-white/60 max-w-lg leading-relaxed">
              Find nearest verified partner in Jaipur, Bengaluru, Goa & more. Book &ldquo;Until I Return&rdquo; for continuous peace of mind.
            </p>
          </div>
          <Link
            href="/owner/travel"
            className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] text-xs font-bold shrink-0 flex items-center gap-2 shadow-md transition-all active:scale-95 relative z-10"
          >
            <span>Activate Away Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* SERVICE PILLARS STATUS (Selected Plan & Away Mode) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home Active Plan Card */}
          <div className="p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 flex items-center gap-1.5 font-bold">
                <Home className="w-3.5 h-3.5 text-[#2DD4A0]" /> TORQUE HOME
              </span>
              <span className="text-[10px] font-mono uppercase font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 px-2.5 py-0.5 rounded-full border border-[#2DD4A0]/30">
                ACTIVE
              </span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">{activePlanName}</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Recurring society bay care for {primaryVehicle ? `${primaryVehicle.make} ${primaryVehicle.model}` : 'your vehicle'} by {assignedWasher.name} at {primaryVehicle?.society_name || 'Green Valley Residency'}.
            </p>
            {lastSyncTime && (
              <div className="text-[10px] text-white/40 font-mono pt-1">
                Synced with Firestore at {lastSyncTime}
              </div>
            )}
          </div>

          {/* Away Mode Card */}
          <Link
            href="/owner/travel"
            className="p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl space-y-2.5 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 flex items-center gap-1.5 font-bold">
                <Car className="w-3.5 h-3.5 text-amber-400" /> TORQUE AWAY
              </span>
              <span className="text-[10px] font-mono font-bold text-white/60 group-hover:text-white transition-colors">
                BOOK →
              </span>
            </div>
            <div className="text-xl font-bold text-white tracking-tight">Starting at ₹39 / wash</div>
            <p className="text-xs text-white/60 leading-relaxed">
              Nationwide verified concierge partners whenever you travel to another city.
            </p>
          </Link>
        </div>

        {/* NEXT WASH & WASHER INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Next Wash Schedule */}
          <div className="p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 font-bold block mb-1">
                NEXT CARE WINDOW
              </span>
              <div className="text-lg font-bold text-white tracking-tight">
                Tomorrow • {primaryVehicle?.preferred_wash_time || '07:30 AM'}
              </div>
              <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0" />
                <span className="truncate">{dashboardLocationDisplay}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#161C25] border border-white/[0.08] text-[#2DD4A0] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Backup Coverage Alert if active */}
          {primaryVehicle?.isBackupActive && (
            <div className="p-4 rounded-[20px] bg-gradient-to-r from-amber-500/15 via-[#11161D] to-[#11161D] border border-amber-500/30 text-amber-200 text-xs shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <div>
                  <span className="font-bold text-white">Temporary Backup Coverage Active:</span>{' '}
                  Certified Specialist <strong>{assignedWasher.name}</strong> is handling your vehicle while{' '}
                  <strong>{primaryVehicle.primaryWasherName || 'your primary specialist'}</strong> is unavailable. Service schedule remains 100% active.
                </div>
              </div>
            </div>
          )}

          {/* Regular Washer Info / Backup Specialist Info */}
          <div className="p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-white/10 shrink-0 shadow-md bg-neutral-900">
                <Image
                  src={assignedWasher.avatar || '/images/washer_amit.jpg'}
                  alt={assignedWasher.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 font-bold block">
                    {primaryVehicle?.isBackupActive ? 'BACKUP SPECIALIST (ACTIVE)' : 'ASSIGNED SPECIALIST'}
                  </span>
                  {primaryVehicle?.isBackupActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Covering for {primaryVehicle.primaryWasherName || 'Primary Washer'}
                    </span>
                  )}
                </div>
                <div className="text-base font-bold text-white flex items-center gap-2">
                  <span>{assignedWasher.name}</span>
                  {primaryVehicle?.isBackupActive && (
                    <span className="text-[11px] font-normal text-emerald-400 font-mono">
                      (Active Today)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/70 font-medium mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{assignedWasher.rating || '4.98'}</span>
                  <span className="text-white/40 text-[11px] font-mono">
                    ({assignedWasher.totalLifetimeWashes || 140} washes)
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/owner/washes/history"
              className="p-2.5 rounded-full bg-[#161C25] hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/[0.08]"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* THIS MONTH METRICS */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-3 px-1 font-bold">
            THIS MONTH OVERVIEW
          </span>
          <div className="grid grid-cols-3 gap-3.5">
            <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {verifiedWashesCount}
              </div>
              <div className="text-xs font-semibold text-white/70 mt-1">
                Washes
              </div>
              <span className="text-[10px] text-[#2DD4A0] font-mono font-bold block mt-0.5">
                ✓ 100% Verified
              </span>
            </div>

            <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white/90">
                0
              </div>
              <div className="text-xs font-semibold text-white/70 mt-1">
                Missed
              </div>
              <span className="text-[10px] text-white/40 block mt-0.5 font-mono">
                Auto-credited
              </span>
            </div>

            <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] text-center shadow-xl relative overflow-hidden">
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹{subscriptionPrice.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-semibold text-white/70 mt-1">
                Subscription
              </div>
              <span className="text-[10px] text-[#2DD4A0] font-mono font-bold block mt-0.5 uppercase tracking-wide">
                {activePlanName}
              </span>
              {primaryVehicle && (
                <span className="text-[9px] text-white/40 block font-mono mt-1 truncate">
                  {primaryVehicle.make} {primaryVehicle.model}
                </span>
              )}
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

        {/* TORQUE CARE VEHICLE HISTORY */}
        <section className="hidden md:block p-6 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 flex items-center gap-1.5 font-bold">
                <History className="w-3.5 h-3.5 text-[#2DD4A0]" />
                VEHICLE AUDIT LOG
              </span>
              <p className="text-xs text-white/60 mt-0.5">
                All services appear in one vehicle history, wherever you travel.
              </p>
            </div>
            <Link
              href="/owner/washes/history"
              className="text-xs font-bold text-[#2DD4A0] hover:underline flex items-center gap-1"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {washes.slice(0, 4).map((wash) => {
              const isAway = wash.service_type === 'away';
              const city = wash.city || 'Delhi';

              return (
                <div
                  key={wash.id}
                  className="p-3.5 rounded-xl border border-white/[0.06] bg-[#161C25]/60 hover:bg-[#161C25] transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isAway
                          ? 'bg-amber-500/10 text-amber-300 border-amber-400/20'
                          : 'bg-[#2DD4A0]/10 text-[#2DD4A0] border-[#2DD4A0]/20'
                      }`}
                    >
                      {isAway ? (
                        <span className="text-xs">🚗</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-[#2DD4A0]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap font-sans">
                        <span className="text-xs font-bold text-white">
                          {wash.scheduled_date} — {city}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md ${
                            isAway
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {wash.service_type || 'home'}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#2DD4A0]">
                          Completed ✓
                        </span>
                      </div>
                      <div className="text-[11px] text-white/40 font-mono mt-0.5">
                        {wash.washer_name} • {wash.parking_location}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/owner/washes/${wash.id}`}
                    className="text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/[0.08] px-3.5 py-1.5 rounded-full transition-all shrink-0"
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
