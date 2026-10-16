'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Star,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronRight,
  Shield,
  Award,
  UserPlus,
  X,
  Loader2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  fetchWashersFromDirectory,
  fetchAllWashersFromFirestore,
  appointWasherToVehicleInFirestore,
  updateOwnerWasherInFirestore,
  isWasherMatchForOwner,
} from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/types';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerSettingsPage() {
  const router = useRouter();
  const {
    user,
    setUser,
    vehicles,
    setVehicles,
    washers: storeWashers,
    appointWasherToVehicle,
    isLoggedIn,
    isHydrated,
  } = useStore();

  const [availableWashers, setAvailableWashers] = useState<WasherPartner[]>([]);
  const [isLoadingWashers, setIsLoadingWashers] = useState(true);
  const [isAppointingId, setIsAppointingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Add your Washer modal state
  const [showAddWasherModal, setShowAddWasherModal] = useState(false);
  const [washerNameInput, setWasherNameInput] = useState('');
  const [washerPhoneInput, setWasherPhoneInput] = useState('');
  const [washerError, setWasherError] = useState('');
  const [isSavingWasher, setIsSavingWasher] = useState(false);

  // Authentication check
  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  // Resolve currently assigned washer
  const currentAssignedWasherId = useMemo(() => {
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('torque_assigned_washer_id');
      if (storedId) return storedId;
    }
    return (
      vehicles[0]?.assigned_washer_id ||
      user.assigned_washer_id ||
      user.selectedWasherId ||
      null
    );
  }, [vehicles, user]);

  const currentAssignedWasherName = useMemo(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('torque_assigned_washer_name');
      if (storedName) return storedName;
    }
    return (
      vehicles[0]?.assigned_washer_name ||
      user.assigned_washer_name ||
      user.selectedWasherName ||
      null
    );
  }, [vehicles, user]);

  // Load available certified washer partners for this society / area
  useEffect(() => {
    let isMounted = true;
    async function loadWashers() {
      setIsLoadingWashers(true);
      try {
        const societyKey = user.societyName || user.society || '';
        let list: WasherPartner[] = [];

        // 1. Fetch from Firestore Washers collection (canonical source of truth)
        try {
          const remoteWashers = await fetchAllWashersFromFirestore();
          if (remoteWashers && remoteWashers.length > 0) {
            list = remoteWashers;
          }
        } catch (rErr) {
          console.warn('Notice loading washers from Washers collection:', rErr);
        }

        // 2. Fetch from directory by society
        try {
          const directoryWashers = await fetchWashersFromDirectory(societyKey);
          if (directoryWashers && directoryWashers.length > 0) {
            const existingIds = new Set(list.map((w) => w.id));
            directoryWashers.forEach((dw) => {
              if (!existingIds.has(dw.id)) list.push(dw);
            });
          }
        } catch (dErr) {
          console.warn('Notice loading washers from directory:', dErr);
        }

        // 3. If no washers found yet, check store washers (excluding dismissed)
        if (list.length === 0 && storeWashers.length > 0) {
          list = storeWashers.filter((w) => w.status !== 'Dismissed');
        }

        // 4. Sort washers so those matching owner's location appear first
        list.sort((a, b) => {
          const matchA = isWasherMatchForOwner(a, user);
          const matchB = isWasherMatchForOwner(b, user);
          if (matchA && !matchB) return -1;
          if (!matchA && matchB) return 1;
          return 0;
        });

        if (isMounted) {
          setAvailableWashers(list);

          // If there is a matched washer and user doesn't have an assigned washer yet, auto-select them
          const matched = list.find((w) => isWasherMatchForOwner(w, user));
          if (matched && !user.assigned_washer_id && !user.selectedWasherId) {
            setUser({
              ...user,
              assigned_washer_id: matched.id,
              assigned_washer_name: matched.name,
              selectedWasherId: matched.id,
              selectedWasherName: matched.name,
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('torque_assigned_washer_id', matched.id);
              localStorage.setItem('torque_assigned_washer_name', matched.name);
            }
          }
        }
      } catch (err) {
        console.warn('Error loading available washers:', err);
      } finally {
        if (isMounted) setIsLoadingWashers(false);
      }
    }

    loadWashers();
    return () => {
      isMounted = false;
    };
  }, [user.society, user.societyName, user.state, user.city, user.district, storeWashers]);

  // Handler to appoint a washer to all owner's registered vehicles
  const handleAppointWasher = async (washer: WasherPartner) => {
    setIsAppointingId(washer.id);
    setSuccessMessage(null);

    try {
      const ownerId =
        user.id ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') || 'usr_owner' : 'usr_owner');

      // 1. Appoint washer to each vehicle in store & Firestore
      if (vehicles.length > 0) {
        for (const veh of vehicles) {
          await appointWasherToVehicle(veh.id, washer.id, ownerId);
        }
      } else {
        await appointWasherToVehicleInFirestore(ownerId, 'veh_default', washer.id, washer.name);
      }

      // 2. Update user state & localStorage
      const updatedUser = {
        ...user,
        assigned_washer_id: washer.id,
        assigned_washer_name: washer.name,
        selectedWasherId: washer.id,
        selectedWasherName: washer.name,
        assigned_washer_phone: washer.phone || (user as any).assigned_washer_phone,
        assignedWasherPhone: washer.phone || (user as any).assignedWasherPhone,
      };
      setUser(updatedUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_assigned_washer_id', washer.id);
        localStorage.setItem('torque_assigned_washer_name', washer.name);
        if (washer.phone) {
          localStorage.setItem('torque_assigned_washer_phone', washer.phone);
        }
        localStorage.setItem('torque_user', JSON.stringify(updatedUser));
      }

      setSuccessMessage(
        `✓ ${washer.name} has been appointed as your dedicated morning specialist!`
      );
    } catch (err: any) {
      console.error('Appointing washer error:', err);
    } finally {
      setIsAppointingId(null);
    }
  };

  // Handler for "Add your Washer" (Name + Phone Number)
  const handleSaveWasher = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasherError('');

    const cleanName = washerNameInput.trim();
    if (!cleanName) {
      setWasherError("Please enter your washer specialist's name.");
      return;
    }

    const digits = washerPhoneInput.replace(/\D/g, '');
    if (digits.length < 10) {
      setWasherError('Please enter a valid 10-digit phone number for the washer.');
      return;
    }
    const cleanPhone = `+91 ${digits.slice(-10)}`;

    setIsSavingWasher(true);

    try {
      const storedId =
        typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') : null;
      const targetOwnerId =
        user?.id && user.id !== 'usr_guest' ? user.id : storedId || `usr_${Date.now()}`;

      // 1. Update in Firestore
      await updateOwnerWasherInFirestore(targetOwnerId, cleanName, cleanPhone);

      // 2. Update local user state
      const updatedUser = {
        ...user,
        assigned_washer_name: cleanName,
        assignedWasherName: cleanName,
        selectedWasherName: cleanName,
        assigned_washer_phone: cleanPhone,
        assignedWasherPhone: cleanPhone,
        selectedWasherPhone: cleanPhone,
      };
      setUser(updatedUser);

      // 3. Update vehicles in store
      if (vehicles.length > 0) {
        setVehicles(
          vehicles.map((v) => ({
            ...v,
            assigned_washer_name: cleanName,
            washerName: cleanName,
            assigned_washer_phone: cleanPhone,
          }))
        );
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_assigned_washer_name', cleanName);
        localStorage.setItem('torque_assigned_washer_phone', cleanPhone);
        localStorage.setItem('torque_user', JSON.stringify(updatedUser));
      }

      // 4. Add to availableWashers list so they appear in grid immediately
      const newPartner: WasherPartner = {
        id: `wsh_${Date.now()}`,
        name: cleanName,
        phone: cleanPhone,
        avatar: '/images/washer_amit.jpg',
        rating: '5.0',
        reviewsCount: 1,
        society: user.societyName || user.society || '',
        societies: [user.societyName || user.society || ''],
        assignedCarsPerDay: vehicles.length || 1,
        routeWindow: '06:30 AM – 09:30 AM',
        avgTimePerCar: '6.0 mins',
        completionRate: '100%',
        totalLifetimeWashes: 0,
        status: 'Active on Route',
        kyc: 'Dedicated Specialist',
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
      };

      setAvailableWashers((prev) => {
        const remaining = prev.filter(
          (w) => w.name.toLowerCase().trim() !== cleanName.toLowerCase()
        );
        return [newPartner, ...remaining];
      });

      setSuccessMessage(`✓ ${cleanName} has been added and appointed as your dedicated washer!`);
      setShowAddWasherModal(false);
      setWasherNameInput('');
      setWasherPhoneInput('');
    } catch (err: any) {
      console.error('Error saving washer:', err);
      setWasherError(err.message || 'Failed to save washer. Please try again.');
    } finally {
      setIsSavingWasher(false);
    }
  };

  // Find currently active washer object
  const activeWasherObj = useMemo(() => {
    const assignedName = currentAssignedWasherName;
    const assignedId = currentAssignedWasherId;
    if (!assignedId && !assignedName) return null;

    const found = availableWashers.find(
      (w) =>
        (assignedId && (w.id === assignedId || (w as any).uid === assignedId)) ||
        (assignedName && w.name.toLowerCase().trim() === assignedName.toLowerCase().trim())
    );
    if (found) return found;

    if (assignedName) {
      return {
        id: assignedId || `wsh_${Date.now()}`,
        name: assignedName,
        phone: (user as any).assigned_washer_phone || (user as any).assignedWasherPhone || '',
        avatar: '/images/washer_amit.jpg',
        rating: '5.0',
        reviewsCount: 1,
        society: user.societyName || user.society || '',
        societies: [user.societyName || user.society || ''],
        assignedCarsPerDay: vehicles.length || 1,
        routeWindow: '06:30 AM – 09:30 AM',
        avgTimePerCar: '6.0 mins',
        completionRate: '100%',
        totalLifetimeWashes: 0,
        status: 'Active on Route',
        kyc: 'Dedicated Specialist',
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
      } as WasherPartner;
    }
    return null;
  }, [availableWashers, currentAssignedWasherId, currentAssignedWasherName, user, vehicles]);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/owner/dashboard"
              className="p-2 rounded-xl bg-[#161C25] hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/[0.08]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0] block">
                Settings & Specialist Management
              </span>
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Owner Settings
              </h1>
            </div>
          </div>

          <Link
            href="/owner/dashboard"
            className="text-xs font-bold font-mono text-[#2DD4A0] hover:underline flex items-center gap-1"
          >
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-[#161C25] to-[#11161D] border border-emerald-500/40 text-emerald-200 text-sm shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2DD4A0] shrink-0" />
              <span className="font-semibold text-white">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-white/50 hover:text-white text-xs font-mono font-bold px-2 py-1 cursor-pointer"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* WASHER SPECIALIST MANAGEMENT */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2DD4A0]/10 text-[#2DD4A0] border border-[#2DD4A0]/30">
                  SPECIALIST SELECTION
                </span>
                <span className="text-xs font-mono text-white/40">
                  {availableWashers.length} Specialist{availableWashers.length === 1 ? '' : 's'} Available
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Choose Your Dedicated Washer Specialist
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Select or add your dedicated morning care professional for doorstep cleaning.
              </p>
            </div>

            {/* BUTTON: Add your Washer */}
            <button
              type="button"
              onClick={() => {
                setWasherError('');
                setShowAddWasherModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(45,212,160,0.3)] active:scale-95 cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add your Washer</span>
            </button>
          </div>

          {/* Current Assigned Specialist Status Card */}
          {activeWasherObj ? (
            <div className="p-5 sm:p-6 rounded-[22px] bg-gradient-to-r from-[#2DD4A0]/15 via-[#162325]/50 to-[#11161D] border border-[#2DD4A0]/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-[#2DD4A0]/50 shrink-0 shadow-md bg-neutral-900">
                  <Image
                    src={activeWasherObj.avatar || '/images/washer_amit.jpg'}
                    alt={activeWasherObj.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#2DD4A0] border-2 border-[#11161D]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2DD4A0] text-black">
                      ACTIVE MORNING SPECIALIST
                    </span>
                    <span className="text-[11px] font-mono text-white/60">
                      Route: {activeWasherObj.routeWindow || '06:30 AM – 09:30 AM'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {activeWasherObj.name}
                    <ShieldCheck className="w-4 h-4 text-[#2DD4A0]" />
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-white/70 font-medium mt-0.5">
                    {activeWasherObj.phone && (
                      <span className="font-mono text-[#2DD4A0]">{activeWasherObj.phone}</span>
                    )}
                    {activeWasherObj.phone && <span>•</span>}
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-white">{activeWasherObj.rating || '5.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setWasherError('');
                    setShowAddWasherModal(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-white/80 hover:text-white transition-colors cursor-pointer w-full sm:w-auto text-center"
                >
                  Change Washer
                </button>
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-6 rounded-[22px] bg-gradient-to-r from-amber-500/15 via-[#1c1816]/50 to-[#11161D] border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 block mb-0.5">
                    SPECIALIST REQUIRED
                  </span>
                  <h3 className="text-base font-bold text-white">
                    No Dedicated Washer Specialist Assigned Yet
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Add your dedicated washer or choose one below to activate daily tracking.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setWasherError('');
                  setShowAddWasherModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0"
              >
                Add your Washer
              </button>
            </div>
          )}

          {/* Available Washer Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {isLoadingWashers ? (
              <div className="col-span-full p-12 text-center text-white/50 space-y-3">
                <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin mx-auto" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  Loading verified washer specialists...
                </p>
              </div>
            ) : availableWashers.length === 0 ? (
              <div className="col-span-full p-8 rounded-[22px] bg-[#11161D] border border-white/[0.08] text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center mx-auto">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto">
                  <p className="text-base font-bold text-white">No active washers in your area yet</p>
                  <p className="text-xs text-white/50 mt-1">
                    Add your dedicated morning washer specialist directly with their name and phone number.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWasherError('');
                    setShowAddWasherModal(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold font-mono uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-lg cursor-pointer active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add your Washer</span>
                </button>
              </div>
            ) : (
              availableWashers.map((washer) => {
                const isCurrent =
                  (currentAssignedWasherId &&
                    (washer.id === currentAssignedWasherId ||
                      (washer as any).uid === currentAssignedWasherId)) ||
                  (currentAssignedWasherName &&
                    washer.name.toLowerCase().trim() ===
                      currentAssignedWasherName.toLowerCase().trim());

                const isAppointing = isAppointingId === washer.id;
                const isMatched = isWasherMatchForOwner(washer, user);

                return (
                  <div
                    key={washer.id}
                    className={`p-5 rounded-[22px] transition-all flex flex-col justify-between relative overflow-hidden ${
                      isCurrent
                        ? 'bg-[#141d24] border-2 border-[#2DD4A0] shadow-[0_8px_30px_rgba(45,212,160,0.15)]'
                        : isMatched
                        ? 'bg-[#111A20] border-2 border-[#2DD4A0]/60 hover:bg-[#141F28]'
                        : 'bg-[#11161D] border border-white/[0.08] hover:border-white/20 hover:bg-[#141A23]'
                    }`}
                  >
                    {/* Active Pill Badge */}
                    {isCurrent ? (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#2DD4A0] text-black text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Current Specialist</span>
                      </div>
                    ) : isMatched ? (
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/40 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Society Matched</span>
                      </div>
                    ) : null}

                    <div>
                      {/* Washer Avatar & Identity */}
                      <div className="flex items-center gap-3.5 mb-3.5">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-neutral-900">
                          <Image
                            src={washer.avatar || '/images/washer_amit.jpg'}
                            alt={washer.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                            {washer.name}
                            <ShieldCheck className="w-4 h-4 text-[#2DD4A0]" />
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-white">{washer.rating || '5.0'}</span>
                            <span className="text-white/40 text-[11px]">
                              ({washer.reviewsCount || 1} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Specialist Metrics */}
                      <div className="space-y-2 p-3 rounded-xl bg-[#161C25]/80 border border-white/[0.06] text-xs font-mono text-white/80 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#2DD4A0]" /> Route Window:
                          </span>
                          <span className="font-bold text-white">
                            {washer.routeWindow || '06:30 AM – 09:30 AM'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-[#2DD4A0]" /> Completion:
                          </span>
                          <span className="font-bold text-[#2DD4A0]">
                            {washer.completionRate || '100%'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/50 flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-[#2DD4A0]" /> Verified:
                          </span>
                          <span className="text-white/90">Aadhaar + Phone ✓</span>
                        </div>
                        {washer.phone && (
                          <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#2DD4A0]">
                            <span>Phone:</span>
                            <span className="font-bold">{washer.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Appointment Button */}
                    <button
                      onClick={() => handleAppointWasher(washer)}
                      disabled={isCurrent || isAppointing}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                        isCurrent
                          ? 'bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/40 cursor-default'
                          : isMatched
                          ? 'bg-[#2DD4A0] hover:bg-[#25B88A] text-black shadow-lg hover:shadow-[0_0_20px_rgba(45,212,160,0.3)] cursor-pointer'
                          : 'bg-[#161C25] hover:bg-white/10 text-white border border-white/[0.08] cursor-pointer'
                      }`}
                    >
                      {isAppointing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Appointing...</span>
                        </>
                      ) : isCurrent ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3]" />
                          <span>Appointed Specialist</span>
                        </>
                      ) : isMatched ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Appoint Matched Specialist</span>
                        </>
                      ) : (
                        <span>Appoint as My Specialist</span>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/* MODAL: ADD YOUR WASHER */}
      {/* ============================================================ */}
      {showAddWasherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#11161D] border border-white/[0.1] rounded-[24px] p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Add your Washer</h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    Enter your dedicated morning specialist details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWasherModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {washerError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{washerError}</span>
              </div>
            )}

            <form onSubmit={handleSaveWasher} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={washerNameInput}
                  onChange={(e) => setWasherNameInput(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-[#161C25] border border-white/[0.08] rounded-xl px-3.5 py-3 text-sm text-white placeholder-white/30 focus:outline-hidden focus:border-[#2DD4A0] transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center bg-[#161C25] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-[#2DD4A0] transition-colors">
                  <span className="px-3.5 py-3 text-xs font-mono font-bold text-[#2DD4A0] bg-white/[0.02] border-r border-white/[0.08]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={washerPhoneInput}
                    onChange={(e) => setWasherPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 bg-transparent px-3.5 py-3 text-sm text-white placeholder-white/30 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddWasherModal(false)}
                  className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingWasher}
                  className="px-6 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingWasher ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Add Washer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav for mobile */}
      <OwnerBottomNav />
    </div>
  );
}
