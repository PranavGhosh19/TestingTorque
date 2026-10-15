'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Star,
  Award,
  Calendar,
  Phone,
  ChevronRight,
  Smartphone,
  Share,
  PlusSquare,
  X,
  CheckCircle2,
  LogOut,
  Clock,
  Users,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import { WasherPartner } from '@/lib/types';
import {
  fetchWasherFromFirestore,
  fetchPeerWashersInSameSocieties,
  markWasherAbsentTodayInFirestore,
  fetchWasherDashboardDataFromFirestore,
  fetchDistrictSocietiesForWasher,
  OwnerDistrictSociety,
} from '@/lib/firebaseService';

export default function WasherProfilePage() {
  const router = useRouter();
  const { user, logout, washers } = useStore();
  const [firebaseWasher, setFirebaseWasher] = useState<WasherPartner | null>(null);
  const [peerWashers, setPeerWashers] = useState<WasherPartner[]>([]);
  const [loadingPeers, setLoadingPeers] = useState(false);
  const [districtOwnerSocieties, setDistrictOwnerSocieties] = useState<OwnerDistrictSociety[]>([]);
  const [isAbsentToday, setIsAbsentToday] = useState(false);
  const [isMarkingAbsent, setIsMarkingAbsent] = useState(false);
  const [absentNotice, setAbsentNotice] = useState<string | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<{
    totalTarget: number;
    completedCount: number;
    progressPercent: number;
  } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadWasher() {
      try {
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
        const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
        const queryId = (user?.role === 'washer' && user?.id && user.id !== 'usr_guest') ? user.id : (storedId || undefined);
        const queryPhone = user?.phone || storedPhone || undefined;
        if (queryId || queryPhone) {
          const fetched = await fetchWasherFromFirestore(queryId, queryPhone);
          if (isMounted && fetched) {
            setFirebaseWasher(fetched);
            const todayIso = new Date().toISOString().split('T')[0];
            const absentList = Array.isArray(fetched.absentDates) ? fetched.absentDates : [];
            setIsAbsentToday(absentList.includes(todayIso));

            // Fetch peer washers working on the same societies
            setLoadingPeers(true);
            try {
              const peers = await fetchPeerWashersInSameSocieties(
                fetched.id,
                fetched.societies || fetched.society
              );
              if (isMounted) {
                setPeerWashers(peers);
              }
            } catch (pErr) {
              console.warn('Profile peer washers fetch notice:', pErr);
            } finally {
              if (isMounted) setLoadingPeers(false);
            }

            // Fetch common societies where car owners are registered in the washer's district
            if (fetched.district) {
              try {
                const ownerSocieties = await fetchDistrictSocietiesForWasher({
                  state: fetched.state,
                  city: fetched.city,
                  district: fetched.district,
                });
                if (isMounted) {
                  setDistrictOwnerSocieties(ownerSocieties);
                }
              } catch (dErr) {
                console.warn('Profile district owner societies notice:', dErr);
              }
            }

            // Fetch live operational metrics
            try {
              const dashData = await fetchWasherDashboardDataFromFirestore(fetched.id, fetched.phone);
              if (isMounted && dashData?.metrics) {
                setLiveMetrics({
                  totalTarget: dashData.metrics.totalTarget,
                  completedCount: dashData.metrics.completedCount,
                  progressPercent: dashData.metrics.progressPercent,
                });
              }
            } catch (mErr) {
              console.warn('Profile dashboard metrics notice:', mErr);
            }
          }
        }
      } catch (err) {
        console.warn('Profile washer load notice:', err);
      }
    }
    loadWasher();
    return () => { isMounted = false; };
  }, [user?.id, user?.phone]);

  const handleToggleAbsentToday = async () => {
    const targetId = firebaseWasher?.id || (user?.role === 'washer' ? user.id : null);
    if (!targetId) return;

    setIsMarkingAbsent(true);
    const todayIso = new Date().toISOString().split('T')[0];
    try {
      const res = await markWasherAbsentTodayInFirestore(targetId, todayIso);
      if (res.success) {
        setIsAbsentToday(res.isAbsent);
        setAbsentNotice(
          res.isAbsent
            ? 'Marked absent for today only. Route backup activated.'
            : 'Today’s absence revoked. Marked active on route.'
        );
        setTimeout(() => setAbsentNotice(null), 4000);
      }
    } catch (err) {
      console.error('Error toggling absent today:', err);
    } finally {
      setIsMarkingAbsent(false);
    }
  };

  const storedWasherName =
    mounted && typeof window !== 'undefined' ? localStorage.getItem('torque_washer_name') : null;
  const washerDisplayName =
    firebaseWasher?.name ||
    (mounted && storedWasherName ? storedWasherName : null) ||
    (user?.role === 'washer' && user?.name && user.name !== 'Vehicle Owner' ? user.name : null) ||
    'Amit Kumar';

  // Resolved list of societies the washer has selected / been assigned
  const washerSocieties: string[] = React.useMemo(() => {
    // 1. Array in firebaseWasher
    if (Array.isArray(firebaseWasher?.societies) && firebaseWasher.societies.length > 0) {
      return firebaseWasher.societies.filter(Boolean);
    }
    // 2. Comma-separated string in firebaseWasher
    if (firebaseWasher?.society) {
      return firebaseWasher.society.split(',').map((s) => s.trim()).filter(Boolean);
    }
    // 3. From store washers
    const currentId =
      firebaseWasher?.id ||
      user?.id ||
      (typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null);
    const currentPhone =
      firebaseWasher?.phone ||
      user?.phone ||
      (typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null);

    const storeWasher = washers.find(
      (w) =>
        (currentId && w.id === currentId) ||
        (currentPhone &&
          w.phone &&
          w.phone.replace(/\D/g, '').endsWith(currentPhone.replace(/\D/g, '').slice(-10)))
    );
    if (Array.isArray(storeWasher?.societies) && storeWasher.societies.length > 0) {
      return storeWasher.societies.filter(Boolean);
    }
    if (storeWasher?.society) {
      return storeWasher.society.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [firebaseWasher, user?.id, user?.phone, washers]);

  const locationSummary = React.useMemo(() => {
    const currentId = firebaseWasher?.id || user?.id;
    const storeWasher = washers.find((w) => w.id === currentId);
    const state = firebaseWasher?.state || storeWasher?.state;
    const city = firebaseWasher?.city || storeWasher?.city;
    const district = firebaseWasher?.district || storeWasher?.district;
    const parts = [district, city, state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  }, [firebaseWasher, washers, user?.id]);

  // Societies where car owners are registered in the washer's district that aren't on this washer's route yet
  const untrackedDemandSocieties = React.useMemo(() => {
    return districtOwnerSocieties.filter(
      (os) => !washerSocieties.some((ws) => ws.toLowerCase() === os.societyName.toLowerCase())
    );
  }, [districtOwnerSocieties, washerSocieties]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone
      ) {
        setIsInstalled(true);
      }

      const handler = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleAddToHomeScreen = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

  const handleLogout = () => {
    logout();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('torque_washer_id');
      localStorage.removeItem('torque_washer_phone');
      localStorage.removeItem('torque_washer_name');
    }
    router.replace('/washer/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <header className="bg-white border-b border-slate-200/80 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Certified Partner Identity
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Washer Profile
          </h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0 bg-emerald-950/20">
              <Image
                src={firebaseWasher?.avatar || user?.avatar_url || "/images/washer_amit.jpg"}
                alt={mounted ? washerDisplayName : "Washer Partner"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold text-[#0B132B] truncate" suppressHydrationWarning>
                  {mounted ? washerDisplayName : "Washer Partner"}
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Verified Partner
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-amber-600 font-bold" suppressHydrationWarning>
                  <Star className="w-3.5 h-3.5 fill-amber-500" /> {mounted ? (firebaseWasher?.rating || '5.0') : '5.0'} Rating
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions: Request Leave & Absent Today */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5 flex-wrap">
            <Link
              href="/washer/leave"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer text-center"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Request Leave</span>
            </Link>

            <button
              type="button"
              onClick={handleToggleAbsentToday}
              disabled={isMarkingAbsent}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer border ${
                isAbsentToday
                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              title="Indicates that you will be absent only for the present day"
            >
              <Clock className="w-4 h-4" />
              <span>{isMarkingAbsent ? 'Updating...' : isAbsentToday ? 'Absent Today ✓' : 'Absent Today'}</span>
            </button>
          </div>

          {absentNotice && (
            <div
              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                isAbsentToday
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{absentNotice}</span>
            </div>
          )}
        </div>

        {/* Operational Badges (Dynamic, no dummy data) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-[#0B132B]" suppressHydrationWarning>
              {firebaseWasher?.totalLifetimeWashes ?? liveMetrics?.completedCount ?? 0}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Total Washes</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-blue-600" suppressHydrationWarning>
              {liveMetrics?.totalTarget ?? (firebaseWasher?.assignedCarsPerDay ?? 0)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Active Daily Cars</span>
          </div>
        </div>

        {/* Assigned Operational Societies Card */}
        <div className="premium-card p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block mb-0.5">
                Route Coverage
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0B132B] flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Assigned Societies</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Societies and residential communities allocated to your morning wash queue
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {washerSocieties.length} {washerSocieties.length === 1 ? 'Society' : 'Societies'}
              </span>
            </div>
          </div>

          {/* Location Details (District, City, State) */}
          {locationSummary && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Location Cluster:</span>
              <span className="font-bold text-slate-900">{locationSummary}</span>
            </div>
          )}

          {/* Societies Grid */}
          {washerSocieties.length === 0 ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No societies assigned yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Select your operational societies to receive assigned morning vehicle wash routes.
              </p>
              <Link
                href="/washer/onboarding"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs mt-2"
              >
                <span>Select Societies</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {washerSocieties.map((societyName, idx) => (
                <div
                  key={`${societyName}-${idx}`}
                  className="p-3.5 bg-gradient-to-br from-slate-50 to-white hover:from-emerald-50/40 hover:to-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 flex items-center justify-between gap-3 transition-all group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-200/60 group-hover:scale-105 transition-transform">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-950">
                        {societyName}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Morning Bay Route • Active
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                    Active Bay
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Car Owner Demand in Washer's District */}
          {untrackedDemandSocieties.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/90 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Car Owners Waiting in Your District ({firebaseWasher?.district || 'Nearby'})
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                  {untrackedDemandSocieties.length} {untrackedDemandSocieties.length === 1 ? 'Society' : 'Societies'} Available
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {untrackedDemandSocieties.map((os) => (
                  <span
                    key={os.societyName}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-slate-800 shadow-2xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{os.societyName}</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                      ⚡ {os.ownerCount} {os.ownerCount === 1 ? 'Owner' : 'Owners'}
                    </span>
                  </span>
                ))}
              </div>
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Add these societies to your route to service these waiting vehicle owners.
                </span>
                <Link
                  href="/washer/onboarding"
                  className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 shrink-0"
                >
                  <span>+ Add to Route</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Manage Societies Footer Link */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">
              Need to add another society or change your route cluster?
            </span>
            <Link
              href="/washer/onboarding"
              className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <span>Manage Societies</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Society Peer Network (Washers working in the same societies) */}
        <div className="premium-card p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Society Peer Network
              </span>
              <h3 className="text-base font-extrabold text-[#0B132B]">
                Society Washer Partners
              </h3>
              <p className="text-xs text-slate-500">
                Partners active in your assigned societies available for route backup &amp; coverage
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full shrink-0">
              {peerWashers.length} {peerWashers.length === 1 ? 'Partner' : 'Partners'}
            </span>
          </div>

          {loadingPeers ? (
            <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">
              Loading society partners...
            </div>
          ) : peerWashers.length === 0 ? (
            <div className="p-5 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center space-y-1.5">
              <Users className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No other partners in your society cluster yet</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Partners assigned to your society by the Operations team will appear here automatically for peer coverage.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {peerWashers.map((peer) => (
                <div
                  key={peer.id}
                  className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-emerald-950/20 shrink-0 border border-slate-200">
                      <Image
                        src={peer.avatar || '/images/washer_amit.jpg'}
                        alt={peer.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{peer.name}</span>
                        <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5 shrink-0">
                          <Star className="w-3 h-3 fill-amber-500" /> {peer.rating || '5.0'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {peer.assignedCarsPerDay || 0} daily vehicles • {peer.status || 'Active on Route'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {peer.phone && (
                      <a
                        href={`tel:${peer.phone}`}
                        className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                        title={`Call ${peer.name}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      href={`/washer/leave?backup=${encodeURIComponent(peer.name)}`}
                      className="py-1.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all shadow-2xs"
                    >
                      Backup Cover
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operational Links */}
        <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 overflow-hidden text-xs font-semibold">
          <Link
            href="/washer/leave"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" /> Request Leave & Assign Backup
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Add to Home Screen Button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddToHomeScreen}
            className="w-full py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isInstalled ? 'App Installed on Home Screen ✓' : 'Add to Home Screen'}</span>
          </button>
        </div>

        {/* Logout Option */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-rose-50 text-rose-600 border border-slate-200/90 hover:border-rose-200 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Install Guide Modal */}
      {showInstallGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-5 text-slate-800 relative">
            <button
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-sm shrink-0 border border-slate-200">
                <Image
                  src="/images/app_icon.jpg"
                  alt="Torque Care Icon"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0B132B]">Install Torque Care</h3>
                <p className="text-xs text-slate-500">Quick access from your home screen</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>📱 On iPhone / iPad (Safari):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                <li>
                  Tap the <strong className="text-slate-800">Share</strong> button <Share className="w-3.5 h-3.5 inline text-blue-600" /> in Safari
                </li>
                <li>
                  Scroll down and tap <strong className="text-slate-800">Add to Home Screen</strong> <PlusSquare className="w-3.5 h-3.5 inline text-slate-700" />
                </li>
                <li>Tap <strong className="text-slate-800">Add</strong> in top right corner</li>
              </ol>

              <div className="pt-2 border-t border-slate-200 font-bold text-slate-900 flex items-center gap-1.5">
                <span>🤖 On Android (Chrome):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                <li>Tap the three dots menu (<strong>⋮</strong>) in Chrome</li>
                <li>Tap <strong className="text-slate-800">Add to Home screen</strong> or <strong className="text-slate-800">Install app</strong></li>
              </ol>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      <WasherBottomNav />
    </div>
  );
}
