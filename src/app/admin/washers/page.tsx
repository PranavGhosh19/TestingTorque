'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Star,
  ShieldCheck,
  Plus,
  Car,
  Calendar,
  Wallet,
  ChevronRight,
  ArrowRight,
  Phone,
  CreditCard,
  UserCheck,
  UserX,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Activity,
  Building2,
  Lock,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';
import { WasherPartner } from '@/lib/washerPartners';
import {
  fetchAllWashersFromFirestore,
  fetchAllSocieties,
  fetchAdminCustomers,
  AdminCustomer,
} from '@/lib/firebaseService';
import OnboardWasherModal from '@/components/modals/OnboardWasherModal';
import AppointWasherModal from '@/components/modals/AppointWasherModal';
import DismissWasherModal from '@/components/modals/DismissWasherModal';
import { encryptWasherId } from '@/lib/idSecurity';

export default function AdminWashersPage() {
  const { washers, setWashers, routeStops, reinstateWasher, deleteWasher, user, role } = useStore();
  const currentAdminId =
    user?.uid ||
    user?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null) ||
    'admin-lead-1';

  const [firestoreWashers, setFirestoreWashers] = useState<WasherPartner[]>([]);
  const [firestoreLoaded, setFirestoreLoaded] = useState(false);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState(false);
  const [societyMap, setSocietyMap] = useState<Record<string, string>>({});
  const [adminCustomers, setAdminCustomers] = useState<AdminCustomer[]>([]);

  useEffect(() => {
    let isMounted = true;
    const loadWashers = async () => {
      try {
        setIsLoadingFirestore(true);
        const [remoteWashers, socList, custList] = await Promise.all([
          fetchAllWashersFromFirestore(),
          fetchAllSocieties(),
          fetchAdminCustomers(),
        ]);

        if (isMounted) {
          const cleanRemote = (remoteWashers || []).filter((w) => !isDummyWasher(w));
          setFirestoreWashers(cleanRemote);
          setFirestoreLoaded(true);

          if (socList && socList.length > 0) {
            const map: Record<string, string> = {};
            socList.forEach((s) => {
              const sid = s.societyId;
              if (sid) {
                map[sid] = s.name;
                map[sid.toLowerCase()] = s.name;
              }
            });
            setSocietyMap(map);
          }
          if (custList && custList.length > 0) {
            setAdminCustomers(custList);
          }

          // Reconcile browser localStorage & in-memory store so deleted Firestore washers do not linger
          if (typeof window !== 'undefined') {
            const remoteIds = new Set(cleanRemote.map((w) => w.id));
            try {
              const stored = localStorage.getItem('torque_washers');
              if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                  // Keep only washers that currently exist in Firestore
                  const reconciled = parsed.filter((w: any) => !isDummyWasher(w) && remoteIds.has(w.id));
                  localStorage.setItem('torque_washers', JSON.stringify(reconciled));
                  setWashers(reconciled);
                }
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.warn('Error fetching washers and metadata from Firestore:', err);
      } finally {
        if (isMounted) setIsLoadingFirestore(false);
      }
    };
    loadWashers();
    return () => {
      isMounted = false;
    };
  }, [currentAdminId, setWashers]);

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointPreselectedWasherId, setAppointPreselectedWasherId] = useState<string | undefined>();
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [washerForDismissal, setWasherForDismissal] = useState<WasherPartner | null>(null);

  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'active' | 'dismissed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isDummyWasher = (w: WasherPartner | any) => {
    if (!w) return true;
    const id = String(w.id || '').toLowerCase();
    return id === 'wsh_amit';
  };

  // Combined real washers: Firestore is the single source of truth once loaded
  const combinedWashers = useMemo(() => {
    if (firestoreLoaded) {
      return firestoreWashers.filter((w) => !isDummyWasher(w));
    }
    const map = new Map<string, WasherPartner>();
    washers.forEach((w) => {
      if (!isDummyWasher(w)) map.set(w.id, w);
    });
    firestoreWashers.forEach((w) => {
      if (!isDummyWasher(w) && !map.has(w.id)) {
        map.set(w.id, w);
      }
    });
    return Array.from(map.values());
  }, [washers, firestoreWashers, firestoreLoaded]);

  // Admin scoped washers: washers created/onboarded by this admin
  const adminWashers = useMemo(() => {
    return combinedWashers.filter((w) => {
      if (isDummyWasher(w)) return false;
      if (!w.createdBy) return true;
      return (
        w.createdBy === currentAdminId ||
        (user?.uid && w.createdBy === user.uid) ||
        (user?.id && w.createdBy === user.id)
      );
    });
  }, [combinedWashers, currentAdminId, user?.uid, user?.id]);

  // Counts
  const myCount = adminWashers.length;
  const activeCount = useMemo(() => adminWashers.filter((w) => w.status !== 'Dismissed').length, [adminWashers]);
  const dismissedCount = useMemo(() => adminWashers.filter((w) => w.status === 'Dismissed').length, [adminWashers]);

  // Filtered list
  const filteredWashers = useMemo(() => {
    return adminWashers.filter((w) => {
      // Tab filter
      if (activeTab === 'active' && w.status === 'Dismissed') return false;
      if (activeTab === 'dismissed' && w.status !== 'Dismissed') return false;

      // Search filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.society.toLowerCase().includes(q) ||
        (w.societies && w.societies.some((s) => s.toLowerCase().includes(q))) ||
        w.phone.toLowerCase().includes(q) ||
        (w.aadhaarNumber && w.aadhaarNumber.includes(q))
      );
    });
  }, [adminWashers, activeTab, searchQuery]);

  if (role === 'washer') {
    return (
      <div className="flex min-h-screen bg-[#F5F7FA]">
        <AdminSidebar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="max-w-md p-8 bg-white border border-amber-300 rounded-3xl text-center space-y-4 shadow-lg">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Access Restricted: Washers</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Washers do not have administrative control over other washers. Your daily route and assigned cars are located in the Washer Portal.
            </p>
            <Link
              href="/washer/dashboard"
              className="inline-block px-5 py-2.5 bg-[#0B132B] text-white font-bold text-xs rounded-xl"
            >
              Go to My Washer Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Dynamic car counts assigned to each washer based on live customers & vehicles
  const washerAssignedCarCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    adminCustomers.forEach((c) => {
      c.vehicles.forEach((v) => {
        const wid = v.assignedWasherId || c.assignedWasherId;
        const wname = v.assignedWasherName || c.assignedWasherName;
        if (wid) counts[wid] = (counts[wid] || 0) + 1;
        if (wname) counts[wname.toLowerCase().trim()] = (counts[wname.toLowerCase().trim()] || 0) + 1;
      });
    });
    return counts;
  }, [adminCustomers]);

  const resolveSocietyName = (idOrName: string) => {
    if (!idOrName) return '';
    const trimmed = idOrName.trim();
    if (societyMap[trimmed]) return societyMap[trimmed];
    if (societyMap[trimmed.toLowerCase()]) return societyMap[trimmed.toLowerCase()];
    return trimmed;
  };

  const handleOpenAppoint = (e: React.MouseEvent, washerId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setAppointPreselectedWasherId(washerId);
    setIsAppointModalOpen(true);
  };

  const handleOpenDismiss = (e: React.MouseEvent, washer: WasherPartner) => {
    e.preventDefault();
    e.stopPropagation();
    setWasherForDismissal(washer);
    setIsDismissModalOpen(true);
  };

  const handleReinstate = async (e: React.MouseEvent, washerId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to reinstate this washer partner back to active duty?')) {
      await reinstateWasher(washerId);
    }
  };

  const handleDeleteWasher = async (e: React.MouseEvent, washer: WasherPartner) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete "${washer.name}"? This removes the record from Firestore and all local registries.`)) {
      await deleteWasher(washer.id);
      setFirestoreWashers((prev) => prev.filter((w) => w.id !== washer.id));
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-7 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Partner Management & Operations
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aadhaar KYC Enforced
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Live Route Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight mt-1">
              Washer Network & Fleet
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={(e) => handleOpenAppoint(e)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Appoint Washer to Car</span>
            </button>
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Partner</span>
            </button>
          </div>
        </div>

        {/* Ownership Scope Notice */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200/90 rounded-2xl flex items-center gap-2.5 text-xs text-blue-900">
          <Lock className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Admin Scoped Access:</strong> Admins have control only over washers they created. Washers do not have control over other washers.
          </span>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Onboarded Partners</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {adminWashers.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <span>Active on Route</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dismissed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dismissed'
                  ? 'bg-red-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <span>Dismissed</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === 'dismissed' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-800'
              }`}>
                {dismissedCount}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partner, society, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Empty state */}
        {filteredWashers.length === 0 ? (
          <div className="premium-card p-12 bg-white border-slate-200/90 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
              🧼
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              No Washers Found
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {searchQuery
                ? `No partners match your search query "${searchQuery}". Try a different name or society.`
                : activeTab === 'dismissed'
                ? 'No washer partners are currently dismissed. All registered partners are active!'
                : 'No washer partners available. Onboard your first washer partner with government Aadhaar Card verification.'}
            </p>
            {activeTab === 'dismissed' ? (
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                View All Partners
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Partner with Aadhaar</span>
              </button>
            )}
          </div>
        ) : (
          /* Washer Cards Grid - Each links to dedicated page */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredWashers.map((w) => {
              // Calculate live today's route progress
              const stops = routeStops.filter((s) => s.washer_id === w.id);
              const totalStops = stops.length;
              const completedStops = stops.filter((s) => s.status === 'completed').length;
              const inProgressStop = stops.find((s) => s.status === 'current');
              const completionPercent = totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0;
              const isDismissed = w.status === 'Dismissed';
              const isCreatedByMe = !w.createdBy || w.createdBy === currentAdminId;

              const realCarsCount =
                washerAssignedCarCounts[w.id] ||
                (w.name ? washerAssignedCarCounts[w.name.toLowerCase().trim()] : 0) ||
                totalStops ||
                0;

              const rawSocList =
                w.societies && w.societies.length > 0
                  ? w.societies
                  : w.society
                  ? w.society.split(',').map((s) => s.trim()).filter(Boolean)
                  : [];
              const resolvedSocietiesList =
                rawSocList.length > 0
                  ? rawSocList.map(resolveSocietyName).join(', ')
                  : 'Unassigned';

              return (
                <div
                  key={w.id}
                  className={`premium-card p-6 bg-white border shadow-xs space-y-4 transition-all relative group flex flex-col justify-between ${
                    isDismissed
                      ? 'border-red-200/90 bg-red-50/15 opacity-90'
                      : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Info */}
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/admin/washers/${encryptWasherId(w.id)}`}
                        className="flex items-center gap-3.5 group/link cursor-pointer"
                      >
                        <div className={`relative w-14 h-14 rounded-2xl overflow-hidden border-2 shadow-xs shrink-0 flex items-center justify-center font-extrabold text-base ${
                          isDismissed ? 'border-red-400 bg-red-100 text-red-700' : 'border-emerald-500/80 bg-blue-600 text-white'
                        }`}>
                          {w.avatar && !w.avatar.includes('washer_amit') ? (
                            <Image
                              src={w.avatar}
                              alt={w.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span>{w.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <h2 className="text-base font-extrabold text-[#0B132B] group-hover/link:text-emerald-700 transition-colors flex items-center gap-1.5">
                            <span>{w.name}</span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover/link:translate-x-1 group-hover/link:text-emerald-600 transition-all" />
                          </h2>
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500" /> {w.rating} Rating
                            </span>
                            <span className="text-slate-400 font-normal">({w.reviewsCount} reviews)</span>
                          </div>
                          {w.created_at && (
                            <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                              <Calendar className="w-3 h-3 text-blue-600" />
                              <span>
                                Onboarded: {new Date(w.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="text-right space-y-1 shrink-0">
                        {isDismissed ? (
                          <span className="text-[10px] font-black uppercase text-red-700 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-300 block">
                            Dismissed Partner
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                            {w.status}
                          </span>
                        )}
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                            isCreatedByMe
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-slate-500 bg-slate-100 border-slate-200'
                          }`}
                        >
                          {isCreatedByMe ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Your Washer</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Created by {w.createdBy}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Dismissal Reason Notice (if dismissed) */}
                    {isDismissed && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
                        <UserX className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Partner Access Revoked:</span>{' '}
                          <span>{w.dismissalReason || 'Account deactivated by Manager'}</span>
                          {w.dismissedAt && (
                            <div className="text-[10px] text-red-600 font-mono mt-0.5">
                              Dismissed on: {new Date(w.dismissedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* LIVE ROUTE PROGRESS TRACKING BAR */}
                    {!isDismissed ? (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Today&apos;s Route Progress</span>
                          </span>
                          <span className="font-mono font-bold text-slate-800">
                            {completedStops} / {totalStops > 0 ? totalStops : w.assignedCarsPerDay} Stops ({completionPercent}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 gap-2 flex-wrap">
                          {inProgressStop ? (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              Washing: {inProgressStop.vehicle_name} ({inProgressStop.parking_location})
                            </span>
                          ) : completedStops === totalStops && totalStops > 0 ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> All daily stops completed
                            </span>
                          ) : (
                            <span>Window: {w.routeWindow}</span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-center justify-between flex-wrap gap-2">
                        <span>Route suspended</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-[10px] text-slate-400">Formerly:</span>
                          {(w.societies && w.societies.length > 0
                            ? w.societies
                            : w.society
                            ? w.society.split(',').map((s) => s.trim()).filter(Boolean)
                            : []
                          ).map((soc, idx) => (
                            <span key={idx} className="font-mono text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                              {resolveSocietyName(soc)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-medium">Assigned Cars</div>
                        <div className="text-sm font-black text-slate-900 mt-0.5 font-mono">
                          {realCarsCount} {realCarsCount === 1 ? 'Car' : 'Cars'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-medium">Absences</div>
                        <div
                          className={`text-sm font-black mt-0.5 font-mono ${
                            w.absentThisMonth > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {w.absentThisMonth} {w.absentThisMonth === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <div className="text-[10px] text-emerald-700 font-medium">Payouts Disbursed</div>
                        <div className="text-sm font-black text-emerald-800 font-mono mt-0.5">
                          ₹{w.monthlyPayoutsGone.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Cluster & Verification details */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                      {w.created_at && (
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/70">
                          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span>Created / Onboarded:</span>
                          </span>
                          <span className="font-bold text-slate-800">
                            {new Date(w.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Aadhaar Card:</span>
                        <span className="font-mono font-bold text-slate-800">
                          {w.aadhaarNumber ? `•••• •••• ${w.aadhaarNumber.replace(/\D/g, '').slice(-4)}` : 'Verified on File'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Phone Verification:</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          {w.phone}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Assigned Societies:</span>
                        <span
                          className="font-semibold text-slate-800 text-right max-w-[65%] truncate"
                          title={resolvedSocietiesList}
                        >
                          {resolvedSocietiesList}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MANAGER ACTIONS BAR */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      href={`/admin/washers/${encryptWasherId(w.id)}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group/btn"
                    >
                      <span>Full Audit & Proofs</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-2">
                      {isCreatedByMe ? (
                        !isDismissed ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleOpenAppoint(e, w.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-200 cursor-pointer transition-colors"
                              title="Appoint vehicles to this washer"
                            >
                              <Car className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Appoint Cars</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenDismiss(e, w)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 border border-red-200 cursor-pointer transition-colors"
                              title="Dismiss washer partner"
                            >
                              <UserX className="w-3.5 h-3.5 text-red-600" />
                              <span>Dismiss</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteWasher(e, w)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 cursor-pointer transition-colors"
                              title="Delete washer partner permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleReinstate(e, w.id)}
                              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5 border border-blue-200 cursor-pointer transition-colors shadow-2xs"
                              title="Reinstate washer partner"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                              <span>Reinstate Partner</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteWasher(e, w)}
                              className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                              title="Delete washer partner permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-500 text-xs">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Control restricted to creator ({w.createdBy})</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Onboard Washer Partner Modal */}
      <OnboardWasherModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onSuccess={(newPartner) => {
          setFirestoreWashers((prev) => [newPartner, ...prev.filter((p) => p.id !== newPartner.id)]);
        }}
      />

      {/* Appoint Washer Modal */}
      <AppointWasherModal
        isOpen={isAppointModalOpen}
        onClose={() => {
          setIsAppointModalOpen(false);
          setAppointPreselectedWasherId(undefined);
        }}
        preselectedWasherId={appointPreselectedWasherId}
      />

      {/* Dismiss Washer Modal */}
      <DismissWasherModal
        isOpen={isDismissModalOpen}
        onClose={() => {
          setIsDismissModalOpen(false);
          setWasherForDismissal(null);
        }}
        washer={washerForDismissal}
      />
    </div>
  );
}


