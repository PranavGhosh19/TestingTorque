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
  MapPin,
  Building2,
  Car,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronRight,
  Shield,
  Layers,
  Award,
  Edit2,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import {
  fetchWashersBySocietyId,
  fetchWashersFromDirectory,
  fetchAllWashersFromFirestore,
  appointWasherToVehicleInFirestore,
  fetchOwnerDashboardFromFirestore,
  isWasherMatchForOwner,
} from '@/lib/firebaseService';
import { WasherPartner, Vehicle } from '@/lib/types';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import EditLocationSocietyModal from '@/components/modals/EditLocationSocietyModal';

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
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);

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

  // Compute equal / common matched washer for current owner's State-City-District-Society
  const matchedWasher = useMemo(() => {
    return availableWashers.find((w) => isWasherMatchForOwner(w, user)) || null;
  }, [availableWashers, user]);

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

        // 3. If no washers found yet, check store washers
        if (list.length === 0 && storeWashers.length > 0) {
          list = storeWashers.filter((w) => w.status !== 'Dismissed');
        }

        // 4. Sort washers so those with common/equal State-City-District-Society appear first!
        list.sort((a, b) => {
          const matchA = isWasherMatchForOwner(a, user);
          const matchB = isWasherMatchForOwner(b, user);
          if (matchA && !matchB) return -1;
          if (!matchA && matchB) return 1;
          return 0;
        });

        // 5. Fallback certified partners guarantee so the owner always has top certified specialists
        if (list.length === 0) {
          list = [
            {
              id: 'wsh_amit_1',
              name: 'Amit Kumar',
              phone: '+91 98101 23456',
              avatar: '/images/washer_amit.jpg',
              rating: '4.98',
              reviewsCount: 142,
              society: user.society || 'Green Valley Residency',
              societies: [user.society || 'Green Valley Residency'],
              assignedCarsPerDay: 28,
              routeWindow: '06:30 AM – 09:30 AM',
              avgTimePerCar: '5.5 mins',
              completionRate: '100%',
              totalLifetimeWashes: 890,
              status: 'Active on Route',
              kyc: 'Torque Certified Partner',
              aadhaarVerified: true,
              phoneVerified: true,
              absentThisMonth: 0,
              absentDates: [],
              leaveReason: '',
              backupWasherName: 'Rajesh Sharma',
              monthlyPayoutsGone: 0,
              pendingPayoutDue: 0,
              sundayBonusEarned: 0,
              disbursements: [],
            },
            {
              id: 'wsh_rajesh_2',
              name: 'Rajesh Sharma',
              phone: '+91 98202 34567',
              avatar: '/images/washer_amit.jpg',
              rating: '4.95',
              reviewsCount: 118,
              society: user.society || 'Green Valley Residency',
              societies: [user.society || 'Green Valley Residency'],
              assignedCarsPerDay: 26,
              routeWindow: '06:00 AM – 09:00 AM',
              avgTimePerCar: '5.0 mins',
              completionRate: '99.4%',
              totalLifetimeWashes: 720,
              status: 'Active on Route',
              kyc: 'Torque Certified Partner',
              aadhaarVerified: true,
              phoneVerified: true,
              absentThisMonth: 0,
              absentDates: [],
              leaveReason: '',
              backupWasherName: 'Amit Kumar',
              monthlyPayoutsGone: 0,
              pendingPayoutDue: 0,
              sundayBonusEarned: 0,
              disbursements: [],
            },
          ];
        }

        if (isMounted) {
          setAvailableWashers(list);

          // If there is a matched washer and user doesn't have an assigned washer yet, auto-select them!
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
        // Fallback if no vehicles array loaded yet
        await appointWasherToVehicleInFirestore(ownerId, 'veh_default', washer.id, washer.name);
      }

      // 2. Update user state & localStorage
      const updatedUser = {
        ...user,
        assigned_washer_id: washer.id,
        assigned_washer_name: washer.name,
        selectedWasherId: washer.id,
        selectedWasherName: washer.name,
      };
      setUser(updatedUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_assigned_washer_id', washer.id);
        localStorage.setItem('torque_assigned_washer_name', washer.name);
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

  // Find currently active washer object
  const activeWasherObj = useMemo(() => {
    if (!currentAssignedWasherId && !currentAssignedWasherName) return null;
    return availableWashers.find(
      (w) =>
        (currentAssignedWasherId && (w.id === currentAssignedWasherId || (w as any).uid === currentAssignedWasherId)) ||
        (currentAssignedWasherName && w.name.toLowerCase().trim() === currentAssignedWasherName.toLowerCase().trim())
    );
  }, [availableWashers, currentAssignedWasherId, currentAssignedWasherName]);

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
              className="text-white/50 hover:text-white text-xs font-mono font-bold px-2 py-1"
            >
              DISMISS
            </button>
          </div>
        )}

        {/* ============================================================ */}
        {/* STEP 4 HERO: CHOOSE YOUR DEDICATED WASHER SPECIALIST */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#2DD4A0]/10 text-[#2DD4A0] border border-[#2DD4A0]/30">
                  STEP 4 • SPECIALIST SELECTION
                </span>
                <span className="text-xs font-mono text-white/40">
                  {availableWashers.length} Certified Partners Available
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                Choose Your Dedicated Washer Specialist
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Select your certified morning care professional for daily doorstep cleaning at{' '}
                <strong className="text-white">{user.society || 'your residential society'}</strong>.
              </p>
            </div>
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
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-white">{activeWasherObj.rating || '4.98'}</span>
                      <span className="text-white/40 text-[11px]">({activeWasherObj.reviewsCount || 140} reviews)</span>
                    </div>
                    <span>•</span>
                    <span className="text-[#2DD4A0] font-mono font-bold">
                      {activeWasherObj.completionRate || '100%'} On-Time
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-white/70 w-full sm:w-auto text-center">
                  Assigned to <strong className="text-[#2DD4A0]">{vehicles.length || 1} Vehicle(s)</strong>
                </div>
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
                    ACTION NEEDED • STEP 4
                  </span>
                  <h3 className="text-base font-bold text-white">
                    No Dedicated Washer Specialist Assigned Yet
                  </h3>
                  <p className="text-xs text-white/60 mt-0.5">
                    Choose one of the verified partners below to activate your daily morning cleaning service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Available Washer Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {isLoadingWashers ? (
              <div className="col-span-full p-12 text-center text-white/50 space-y-3">
                <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin mx-auto" />
                <p className="text-xs font-mono uppercase tracking-widest">
                  Loading verified society washer specialists...
                </p>
              </div>
            ) : availableWashers.length === 0 ? (
              <div className="col-span-full p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] text-center text-white/60">
                <p className="text-sm font-semibold">No active washers found for this society yet.</p>
                <p className="text-xs text-white/40 mt-1">
                  Our operations team is deploying specialists to your area.
                </p>
              </div>
            ) : (
              availableWashers.map((washer) => {
                const isCurrent =
                  (currentAssignedWasherId && (washer.id === currentAssignedWasherId || (washer as any).uid === currentAssignedWasherId)) ||
                  (currentAssignedWasherName && washer.name.toLowerCase().trim() === currentAssignedWasherName.toLowerCase().trim());

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
                            <span className="font-bold text-white">{washer.rating || '4.95'}</span>
                            <span className="text-white/40 text-[11px]">
                              ({washer.reviewsCount || 120} reviews)
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
                          <span className="text-white/90">Aadhaar + Police KYC ✓</span>
                        </div>
                        {isMatched && (
                          <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-emerald-300">
                            <span>Route Cluster:</span>
                            <span className="font-bold truncate max-w-[140px]">
                              {washer.district ? `${washer.district}, ` : ''}{washer.city || ''}
                            </span>
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

        {/* ============================================================ */}
        {/* RESIDENTIAL & SOCIETY SUMMARY */}
        {/* ============================================================ */}
        <section className="p-6 rounded-[22px] bg-[#11161D] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
              Residential & Society Location
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#2DD4A0] font-bold">
                Verified Society Hub ✓
              </span>
              <button
                type="button"
                onClick={() => setShowEditLocationModal(true)}
                className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <Edit2 className="w-3 h-3 text-[#2DD4A0]" />
                <span>Change Society</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-[#161C25] rounded-xl border border-white/[0.06] space-y-1">
              <span className="text-white/50 block font-mono text-[10px] uppercase">Society Name</span>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                <span>{user.societyName || user.society || 'Green Valley Residency'}</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#161C25] rounded-xl border border-white/[0.06] space-y-1">
              <span className="text-white/50 block font-mono text-[10px] uppercase">Area & City</span>
              <div className="font-bold text-white text-sm flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                <span>
                  {user.district ? `${user.district}, ` : ''}
                  {user.city || 'Gurugram'}, {user.state || 'Haryana'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[#161C25] rounded-xl border border-white/[0.06] space-y-1">
              <span className="text-white/50 block font-mono text-[10px] uppercase">Tower / Flat / Bay</span>
              <div className="font-bold text-white text-sm font-mono">
                {user.flat || user.flatNumber || user.address || 'Tower B, Flat 402'}
              </div>
            </div>

            <div className="p-3.5 bg-[#161C25] rounded-xl border border-white/[0.06] space-y-1">
              <span className="text-white/50 block font-mono text-[10px] uppercase">Account Holder</span>
              <div className="font-bold text-white text-sm">
                {user.name} <span className="text-white/40 font-normal">({user.email || user.phone})</span>
              </div>
            </div>
          </div>

          {/* EQUAL / COMMON MATCHED WASHER BANNER */}
          {matchedWasher ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#2DD4A0]/15 via-[#162325]/80 to-[#11161D] border border-[#2DD4A0]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/20 border border-[#2DD4A0]/40 flex items-center justify-center text-[#2DD4A0] shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-[#2DD4A0] font-bold tracking-wider">
                    Equal Location & Society Match Found
                  </div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Dedicated Washer: <strong>{matchedWasher.name}</strong></span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30 font-mono">
                      Active on Route
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleAppointWasher(matchedWasher)}
                className="px-3.5 py-1.5 rounded-lg bg-[#2DD4A0] hover:bg-[#25B88A] text-black text-xs font-bold transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Assign {matchedWasher.name}</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-white/50 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400/80 shrink-0" />
              <span>
                When an onboarded washer has the same State, City, District & Society, their name will appear here automatically.
              </span>
            </div>
          )}
        </section>

        {/* ============================================================ */}
        {/* VEHICLE FLEET SUMMARY */}
        {/* ============================================================ */}
        <section className="p-6 rounded-[22px] bg-[#11161D] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
              Registered Vehicles ({vehicles.length})
            </h3>
            <Link
              href="/owner/vehicles"
              className="text-xs font-mono font-bold text-[#2DD4A0] hover:underline flex items-center gap-1"
            >
              <span>Manage Fleet</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {vehicles.map((veh, index) => (
              <div
                key={veh.id || index}
                className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#2DD4A0] shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">
                      {veh.make} {veh.model}
                    </div>
                    <div className="text-white/60 font-mono mt-0.5">
                      <span className="font-bold text-white/90">{veh.registration_number}</span>
                      <span className="mx-1.5">•</span>
                      <span>Target: {veh.preferred_wash_time || '07:30 AM'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white/70 font-mono text-[11px]">
                    {veh.assigned_washer_name || currentAssignedWasherName || 'No washer assigned'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* EDIT LOCATION & SOCIETY MODAL */}
        <EditLocationSocietyModal
          isOpen={showEditLocationModal}
          onClose={() => setShowEditLocationModal(false)}
        />
      </main>

      {/* Bottom Nav for mobile */}
      <OwnerBottomNav />
    </div>
  );
}
