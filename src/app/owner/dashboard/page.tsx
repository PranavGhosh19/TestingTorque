'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Car,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import SignatureProofCard from '@/components/SignatureProofCard';
import OwnerProofCalendar from '@/components/OwnerProofCalendar';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import EditLocationSocietyModal from '@/components/modals/EditLocationSocietyModal';
import DailyWashFeedbackModal from '@/components/modals/DailyWashFeedbackModal';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import { useStore } from '@/lib/store';
import {
  fetchOwnerDashboardFromFirestore,
  fetchAllSocieties,
  fetchAllWashersFromFirestore,
  isWasherMatchForOwner,
  saveDailyWashFeedbackToFirestore,
  fetchDailyWashFeedbackFromFirestore,
} from '@/lib/firebaseService';
import { Vehicle, WasherPartner, WashRecord } from '@/lib/types';
import { isPresentDateProofBefore10AM, isWashFromToday, getTodayISTDate } from '@/lib/washUtils';

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
  } = useStore();

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showDailyFeedbackModal, setShowDailyFeedbackModal] = useState(false);
  const [todayFeedbackStatus, setTodayFeedbackStatus] = useState<'yes' | 'no' | null>(null);
  const [allDailyFeedbacks, setAllDailyFeedbacks] = useState<Record<string, 'yes' | 'no'>>({});
  const [liveWashersList, setLiveWashersList] = useState<WasherPartner[]>([]);

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

  // Fetch live washers catalog from Firestore to verify State-City-District-Society cluster match
  useEffect(() => {
    let isMounted = true;
    async function loadWashersCatalog() {
      try {
        const list = await fetchAllWashersFromFirestore();
        if (isMounted && list && list.length > 0) {
          setLiveWashersList(list);
        }
      } catch (err) {
        console.warn('Dashboard all washers fetch notice:', err);
      }
    }
    loadWashersCatalog();
    return () => {
      isMounted = false;
    };
  }, [user.society, user.societyName, user.state, user.city, user.district]);

  // Equal / Common Location & Society Match
  // Washer Selects: State - City - District - Societies (multiple)
  // Car Owner Selects: State - City - District - Society
  // If equal / common, show the washer name to the car owner!
  const locationMatchedWasher = useMemo(() => {
    if (firebaseWasher && isWasherMatchForOwner(firebaseWasher, user)) {
      return firebaseWasher;
    }
    const combined = [...liveWashersList, ...washers];
    const match = combined.find((w) => isWasherMatchForOwner(w, user));
    if (match) return match;
    return null;
  }, [firebaseWasher, liveWashersList, washers, user]);

  const storedAssignedWasherName =
    typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null;
  const storedAssignedWasherId =
    typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_id') : null;

  const targetWasherId =
    (primaryVehicle?.isBackupActive ? (primaryVehicle.backupWasherId || primaryVehicle.activeWasherId) : null) ||
    locationMatchedWasher?.id ||
    firebaseWasher?.id ||
    primaryVehicle?.assigned_washer_id ||
    user.assigned_washer_id ||
    storedAssignedWasherId;

  const targetWasherName =
    (primaryVehicle?.isBackupActive ? (primaryVehicle.backupWasherName || primaryVehicle.activeWasherName) : null) ||
    locationMatchedWasher?.name ||
    firebaseWasher?.name ||
    primaryVehicle?.assigned_washer_name ||
    user.assigned_washer_name ||
    storedAssignedWasherName;

  const matchedStoreWasher = washers.find(
    (w) =>
      (targetWasherId && (w.id === targetWasherId || (w as any).uid === targetWasherId)) ||
      (targetWasherName && w.name?.toLowerCase().trim() === targetWasherName.toLowerCase().trim())
  );

  const isDummyName = (name?: string | null) =>
    !name ||
    name === 'Amit Kumar' ||
    name === 'Assigned Route Partner' ||
    name === 'Assigned Partner';

  const validTargetName = !isDummyName(targetWasherName) ? targetWasherName : null;

  const defaultOwnerSociety =
    primaryVehicle?.society_name || user.society || (user as any).societyName || 'Assigned Society';

  const assignedWasher: WasherPartner | null =
    (primaryVehicle?.isBackupActive ? null : locationMatchedWasher) ||
    firebaseWasher ||
    matchedStoreWasher ||
    (validTargetName
      ? {
          id: targetWasherId || 'wsh_custom',
          name: validTargetName,
          phone: '',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(validTargetName)}&background=161C25&color=2DD4A0&bold=true`,
          rating: '4.98',
          reviewsCount: 142,
          society: defaultOwnerSociety,
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
          backupWasherName: '',
          monthlyPayoutsGone: 0,
          pendingPayoutDue: 0,
          sundayBonusEarned: 0,
          disbursements: [],
        }
      : null);

  // Resolve societies covered by the assigned washer
  const washerSocietiesCovered = useMemo(() => {
    const rawList: string[] =
      assignedWasher?.societies && assignedWasher.societies.length > 0
        ? assignedWasher.societies
        : assignedWasher?.society
        ? assignedWasher.society.split(',').map((s: string) => s.trim()).filter(Boolean)
        : [];

    const resolvedNames: string[] = rawList.map((idOrName: string) => societyMap[idOrName] || idOrName);

    if (resolvedNames.length > 0) {
      return resolvedNames.join(', ');
    }
    return defaultOwnerSociety;
  }, [assignedWasher, societyMap, defaultOwnerSociety]);

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

  const todayIst = useMemo(() => getTodayISTDate(), []);
  const todayIso = todayIst.dateIso;

  // Check if owner has answered today's wash verification question in Firestore
  useEffect(() => {
    let isMounted = true;
    let timer: NodeJS.Timeout | null = null;

    async function checkDailyFeedback() {
      // Clean up legacy local storage cache
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('torque_daily_wash_feedbacks');
        } catch (e) {}
      }

      // 1. Service start date check: Care starts from registration day onwards (same day!)
      const signupDate =
        primaryVehicle?.signupDate ||
        user?.signupDate ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_signup_date') : null);
      const effectiveStartDate = signupDate || todayIso;
      if (effectiveStartDate && todayIso < effectiveStartDate) {
        return;
      }

      // 2. Washer weekly leave day check
      const washerLeave = (
        primaryVehicle?.washerLeaveDay ||
        (primaryVehicle as any)?.washerWeeklyLeaveDay ||
        user?.washerLeaveDay ||
        ''
      ).toLowerCase();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayDayName = dayNames[new Date().getDay()];
      if (washerLeave.includes("doesn't") || washerLeave.includes('none')) {
        // No weekly leave: 7-day care
      } else if (washerLeave && washerLeave.includes(todayDayName)) {
        return; // Today is washer's scheduled leave day
      } else if (!washerLeave && todayDayName === 'sunday') {
        return; // Default Sunday rest
      }

      // 3. Resolve owner ID
      const targetOwnerId =
        user.id && user.id !== 'usr_guest'
          ? user.id
          : typeof window !== 'undefined'
          ? localStorage.getItem('torque_owner_id')
          : null;

      if (!targetOwnerId) return;

      // 3. Fast local guard: if question was already answered today, do NOT show popup!
      if (typeof window !== 'undefined') {
        const localAnswer = localStorage.getItem(`torque_daily_feedback_answered_${todayIso}`);
        if (localAnswer === 'yes' || localAnswer === 'no') {
          if (isMounted) {
            setTodayFeedbackStatus(localAnswer as 'yes' | 'no');
            setAllDailyFeedbacks((prev) => ({ ...prev, [todayIso]: localAnswer as 'yes' | 'no' }));
          }
          return;
        }
      }

      try {
        const feedbacks = await fetchDailyWashFeedbackFromFirestore(targetOwnerId);
        if (!isMounted) return;

        if (feedbacks) {
          setAllDailyFeedbacks(feedbacks);
        }

        // 4. Firestore check: if question was already answered for today, do NOT show popup!
        if (feedbacks && feedbacks[todayIso]) {
          setTodayFeedbackStatus(feedbacks[todayIso]);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`torque_daily_feedback_answered_${todayIso}`, feedbacks[todayIso]);
          }
          return;
        }

        // 5. Dismissal check: if owner dismissed the modal today, don't keep showing it
        if (typeof window !== 'undefined') {
          const dismissed = localStorage.getItem(`torque_daily_feedback_dismissed_${todayIso}`);
          if (dismissed === 'true') return;
        }

        // 6. Only prompt if question has NOT been answered for the day
        timer = setTimeout(() => {
          if (isMounted) setShowDailyFeedbackModal(true);
        }, 700);
      } catch (e) {
        console.warn('Daily feedback Firestore check notice:', e);
      }
    }

    checkDailyFeedback();
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [todayIso, user.id]);

  const handleDailyFeedbackAnswer = async (answer: 'yes' | 'no') => {
    setTodayFeedbackStatus(answer);
    setShowDailyFeedbackModal(false);
    setAllDailyFeedbacks((prev) => ({ ...prev, [todayIso]: answer }));

    if (typeof window !== 'undefined') {
      localStorage.setItem(`torque_daily_feedback_answered_${todayIso}`, answer);
    }

    const targetOwnerId =
      user.id && user.id !== 'usr_guest'
        ? user.id
        : typeof window !== 'undefined'
        ? localStorage.getItem('torque_owner_id')
        : null;

    if (answer === 'no') {
      setFirebaseTodayWash((prev) => {
        return {
          id: prev?.id || `wash_missed_${todayIso}`,
          vehicle_id: primaryVehicle?.id || 'veh_default',
          washer_id: targetWasherId || 'wsh_assigned',
          status: 'missed',
          flaggedNotCleaned: true,
          ownerFeedback: 'no',
          scheduled_date: todayIso,
          month_key: todayIst.monthKey,
          notes: 'Owner flagged: Car not cleaned today by washer (Orange)',
        } as unknown as WashRecord;
      });
    } else {
      setFirebaseTodayWash((prev) => {
        return {
          id: prev?.id || `wash_verified_${todayIso}`,
          vehicle_id: primaryVehicle?.id || 'veh_default',
          washer_id: targetWasherId || 'wsh_assigned',
          status: 'completed',
          flaggedNotCleaned: false,
          ownerFeedback: 'yes',
          scheduled_date: todayIso,
          completed_at: prev?.completed_at || '08:00 AM',
          after_photo: prev?.after_photo || '/images/creta_after.jpg',
          notes: 'Owner verified: Cleaned ✓',
        } as unknown as WashRecord;
      });
    }

    try {
      if (targetOwnerId) {
        await saveDailyWashFeedbackToFirestore(
          targetOwnerId,
          primaryVehicle?.id,
          todayIso,
          answer
        );
      }
    } catch (err) {
      console.warn('Failed to save daily wash feedback to Firestore:', err);
    }
  };

  const handleDailyFeedbackClose = () => {
    setShowDailyFeedbackModal(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`torque_daily_feedback_dismissed_${todayIso}`, 'true');
    }
  };







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
                href="/auth/signup"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register Vehicle for Daily Tracking</span>
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
              washerName={assignedWasher?.name}
              washerAvatar={assignedWasher?.avatar}
              societiesCovered={washerSocietiesCovered}
              location={dashboardLocationDisplay}
              todayFeedbackStatus={todayFeedbackStatus}
            />

            {/* DAILY WASH VERIFICATION QUESTION CARD */}
            <div className="p-5 sm:p-6 rounded-[22px] bg-gradient-to-r from-[#162325] via-[#11161D] to-[#161C25] border border-[#2DD4A0]/30 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 flex items-center justify-center text-[#2DD4A0] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2DD4A0] text-black uppercase">
                        Daily Care Verification
                      </span>
                      <span className="text-xs font-mono text-white/50">
                        {todayIst.dayNum} {todayIst.monthName.slice(0, 3)} {todayIst.year}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                      Was your car washed today ({todayIst.dayNum} {todayIst.monthName.slice(0, 3)} {todayIst.year})?
                    </h3>
                    <p className="text-xs text-white/70 mt-0.5">
                      {primaryVehicle?.registration_number ? `${primaryVehicle.registration_number} • ` : ''}
                      Select Yes or No to record and save your response in Firestore with date.
                    </p>
                  </div>
                </div>

                {todayFeedbackStatus && (
                  <div className="self-start sm:self-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                        todayFeedbackStatus === 'yes'
                          ? 'bg-[#2DD4A0]/20 text-[#2DD4A0] border-[#2DD4A0]/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {todayFeedbackStatus === 'yes' ? 'Recorded: Cleaned ✓' : 'Recorded: Not Cleaned (Orange)'}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleDailyFeedbackAnswer('yes')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    todayFeedbackStatus === 'yes'
                      ? 'bg-[#2DD4A0] text-black shadow-[#2DD4A0]/25 ring-2 ring-[#2DD4A0]'
                      : 'bg-[#2DD4A0]/20 hover:bg-[#2DD4A0]/30 text-[#2DD4A0] border border-[#2DD4A0]/40'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Yes</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDailyFeedbackAnswer('no')}
                  className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    todayFeedbackStatus === 'no'
                      ? 'bg-amber-500 text-black shadow-amber-500/25 ring-2 ring-amber-500'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  <span>No</span>
                </button>
              </div>
            </div>

            {/* ORANGE FLAGGED ALERT BANNER IF OWNER SAID NO */}
            {todayFeedbackStatus === 'no' && (
              <div className="p-4 rounded-[20px] bg-gradient-to-r from-amber-500/15 via-[#11161D] to-[#11161D] border border-amber-500/40 text-amber-200 text-xs shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-xs block">
                      Flagged Orange in Calendar: Car Not Cleaned Today
                    </span>
                    <span className="text-[11px] text-white/70">
                      You indicated your car was not cleaned today by {assignedWasher?.name || 'your assigned specialist'}. Today is flagged Orange in your Care Calendar.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDailyFeedbackAnswer('yes')}
                    className="px-3 py-1.5 rounded-lg bg-[#2DD4A0]/20 hover:bg-[#2DD4A0]/30 text-[#2DD4A0] border border-[#2DD4A0]/40 font-mono text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Mark Cleaned ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDailyFeedbackModal(true)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-mono text-[10px] transition-colors cursor-pointer"
                  >
                    Recheck
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* STEP 4: WASHER APPOINTMENT NOTICE IF NONE APPOINTED */}
        {(!user.assigned_washer_id && !primaryVehicle?.assigned_washer_id && !storedAssignedWasherId) && (
          <div className="p-5 rounded-[22px] bg-gradient-to-r from-[#2DD4A0]/20 via-[#162325]/70 to-[#11161D] border border-[#2DD4A0]/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#2DD4A0]/20 border border-[#2DD4A0]/40 flex items-center justify-center text-[#2DD4A0] shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2DD4A0] text-black">
                    STEP 4 • FINAL STEP
                  </span>
                  <span className="text-xs font-mono text-white/50">Doorstep Morning Care</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  Choose Your Dedicated Society Washer Specialist
                </h3>
                <p className="text-xs text-white/70 mt-0.5">
                  Your vehicle is registered. Appoint your certified washer partner in Settings to start your daily morning wash route.
                </p>
              </div>
            </div>
            <Link
              href="/owner/settings"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-lg text-center shrink-0"
            >
              Choose Specialist in Settings →
            </Link>
          </div>
        )}



        {/* Backup Coverage Alert if active */}
        {primaryVehicle?.isBackupActive && (
          <div className="p-4 rounded-[20px] bg-gradient-to-r from-amber-500/15 via-[#11161D] to-[#11161D] border border-amber-500/30 text-amber-200 text-xs shadow-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-white">Temporary Backup Coverage Active:</span>{' '}
                Certified Specialist <strong>{assignedWasher?.name || 'Assigned Specialist'}</strong> is handling your vehicle while{' '}
                <strong>{primaryVehicle.primaryWasherName || 'your primary specialist'}</strong> is unavailable. Service schedule remains 100% active.
              </div>
            </div>
          </div>
        )}

        {/* THIS MONTH METRICS */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-3 px-1 font-bold">
            THIS MONTH OVERVIEW
          </span>
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white">
                {verifiedWashesCount}
              </div>
              <div className="text-xs font-semibold text-white/70 mt-1">
                Washes
              </div>
            </div>

            <div className="p-5 rounded-[20px] bg-[#11161D] border border-white/[0.08] text-center shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white/90">
                {todayFeedbackStatus === 'no' ? 1 : 0}
              </div>
              <div className="text-xs font-semibold text-white/70 mt-1">
                Missed
              </div>
              <span className="text-[10px] text-amber-400/80 block mt-0.5 font-mono">
                Flagged Unwashed
              </span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE MONTHLY WASH AUDIT & PROOF CALENDAR */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 block font-bold">
              MONTHLY WASH AUDIT &amp; PROOF CALENDAR
            </span>
            <Link
              href="/owner/washes/history"
              className="text-xs text-[#2DD4A0] hover:underline flex items-center gap-1 font-mono font-medium"
            >
              <span>Full History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <OwnerProofCalendar
            assignedWasherName={assignedWasher?.name}
            assignedWasherAvatar={assignedWasher?.avatar}
            parkingLocation={dashboardLocationDisplay}
            selectedVehicleId={primaryVehicle?.id}
            todayWash={activeTodayWash || todayWash}
            todayFeedbackStatus={todayFeedbackStatus}
            feedbacks={allDailyFeedbacks}
            signupDate={primaryVehicle?.signupDate || user?.signupDate}
            serviceStartDate={primaryVehicle?.serviceStartDate || user?.serviceStartDate}
            onFeedbackChange={(dateIso, ans) => {
              if (dateIso === todayIso) setTodayFeedbackStatus(ans);
              setAllDailyFeedbacks((prev) => ({ ...prev, [dateIso]: ans }));
            }}
          />
        </div>


      </main>

      {/* Modals */}
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
      />
      <EditLocationSocietyModal
        isOpen={showEditLocationModal}
        onClose={() => {
          setShowEditLocationModal(false);
          loadFirebaseDashboard();
        }}
      />
      <DailyWashFeedbackModal
        isOpen={showDailyFeedbackModal}
        onClose={handleDailyFeedbackClose}
        onAnswer={handleDailyFeedbackAnswer}
        vehicleName={
          primaryVehicle?.registration_number
            ? `${primaryVehicle.registration_number} • ${primaryVehicle.make || ''} ${primaryVehicle.model || ''}`.trim()
            : primaryVehicle?.model || 'Your Vehicle'
        }
        parkingLocation={dashboardLocationDisplay || 'Assigned Bay'}
        washerName={assignedWasher?.name || 'Assigned Partner'}
        dateDisplay={`${todayIst.dayNum} ${todayIst.monthName.slice(0, 3)} ${todayIst.year}`}
      />

      {/* Mobile Bottom Navigation */}
      <OwnerBottomNav />
    </div>
  );
}
