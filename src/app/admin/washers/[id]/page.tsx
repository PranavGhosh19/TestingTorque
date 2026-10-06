'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  Wallet,
  Landmark,
  ArrowUpRight,
  Receipt,
  Phone,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Download,
  Share2,
  UserX,
  RotateCcw,
  Camera,
  Maximize2,
  X,
  Layers,
  MapPin,
  RefreshCw,
  Building2,
  Check,
  Eye,
  UserCheck,
  Lock,
  Plus,
  Loader2,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { washerPartners, getWasherById, WasherPartner } from '@/lib/washerPartners';
import { useStore } from '@/lib/store';
import AppointWasherModal from '@/components/modals/AppointWasherModal';
import DismissWasherModal from '@/components/modals/DismissWasherModal';
import { encryptWasherId, decryptWasherId } from '@/lib/idSecurity';
import {
  fetchAllSocieties,
  fetchAllWashersFromFirestore,
  assignWasherToSociety,
  removeWasherFromSociety,
  FirestoreSociety,
} from '@/lib/firebaseService';

export default function WasherProfileDetailPage() {
  const params = useParams();
  const rawParam = (params?.id as string) || '';
  const id = decryptWasherId(rawParam);

  const { washers, setWashers, vehicles, routeStops, reinstateWasher, user, role } = useStore();

  const [remoteWasher, setRemoteWasher] = useState<WasherPartner | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [allSocieties, setAllSocieties] = useState<FirestoreSociety[]>([]);
  const [isAddSocietyModalOpen, setIsAddSocietyModalOpen] = useState(false);
  const [selectedSocietyToAdd, setSelectedSocietyToAdd] = useState('');
  const [isAddingSociety, setIsAddingSociety] = useState(false);
  const [addSocietyError, setAddSocietyError] = useState('');
  const [removingSocietyId, setRemovingSocietyId] = useState<string | null>(null);

  // Automatically ensure URL in address bar is encrypted without reload
  useEffect(() => {
    if (rawParam && !rawParam.startsWith('enc_') && id) {
      const encrypted = encryptWasherId(id);
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `/admin/washers/${encrypted}`);
      }
    }
  }, [rawParam, id]);

  // Load latest washer and societies from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadRemoteData() {
      if (!id) {
        setLoadingRemote(false);
        return;
      }
      try {
        const [washersList, societiesList] = await Promise.all([
          fetchAllWashersFromFirestore(),
          fetchAllSocieties(),
        ]);
        if (isMounted) {
          if (societiesList && societiesList.length > 0) {
            setAllSocieties(societiesList);
          }
          const matched = washersList.find((w) => w.id === id);
          if (matched) {
            setRemoteWasher(matched);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch washer or societies from Firestore:', err);
      } finally {
        if (isMounted) setLoadingRemote(false);
      }
    }
    loadRemoteData();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const baseWasher = washers.find((w) => w.id === id) || getWasherById(id);
  const washer: WasherPartner | null = remoteWasher || baseWasher || null;

  // Build mapping from society ID to Society Name
  const societyMap = useMemo(() => {
    const map: Record<string, string> = {};
    allSocieties.forEach((s) => {
      if (s.societyId) {
        map[s.societyId] = s.name;
        map[s.societyId.toLowerCase()] = s.name;
      }
    });
    return map;
  }, [allSocieties]);

  const resolveSocietyName = useCallback(
    (idOrName: string) => {
      if (!idOrName) return '';
      const trimmed = idOrName.trim();
      if (societyMap[trimmed]) return societyMap[trimmed];
      if (societyMap[trimmed.toLowerCase()]) return societyMap[trimmed.toLowerCase()];
      const match = allSocieties.find(
        (s) =>
          s.societyId.toLowerCase() === trimmed.toLowerCase() ||
          s.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (match) return match.name;
      return trimmed;
    },
    [societyMap, allSocieties]
  );

  const assignedSocietyIds = useMemo(() => {
    if (!washer) return [];
    if (washer.societies && washer.societies.length > 0) {
      return washer.societies;
    }
    if (washer.society) {
      return washer.society.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [washer]);

  const availableSocietiesToAdd = useMemo(() => {
    const assignedLower = new Set(assignedSocietyIds.map((s) => s.toLowerCase()));
    return allSocieties.filter(
      (s) =>
        !assignedLower.has(s.societyId.toLowerCase()) &&
        !assignedLower.has(s.name.toLowerCase())
    );
  }, [allSocieties, assignedSocietyIds]);

  const currentAdminId =
    user?.uid ||
    user?.id ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_admin_uid') : null) ||
    'admin-lead-1';
  const isCreatedByMe = washer ? !washer.createdBy || washer.createdBy === currentAdminId : false;

  const [selectedDisbursement, setSelectedDisbursement] = useState<string | null>(null);
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [appointPreselectedVehicleId, setAppointPreselectedVehicleId] = useState<string | undefined>();
  const [isDismissModalOpen, setIsDismissModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  const isDismissed = washer?.status === 'Dismissed';

  // Live today's route stops for this washer
  const todayStops = useMemo(() => {
    if (!washer) return [];
    return routeStops.filter((s) => s.washer_id === washer.id);
  }, [routeStops, washer]);

  const completedStopsCount = todayStops.filter((s) => s.status === 'completed').length;
  const inProgressStopsCount = todayStops.filter((s) => s.status === 'current').length;

  // Appointed vehicles for this washer
  const appointedVehicles = useMemo(() => {
    if (!washer) return [];
    return vehicles.filter(
      (v) =>
        v.assigned_washer_id === washer.id ||
        (v as unknown as { washerId?: string }).washerId === washer.id
    );
  }, [vehicles, washer]);

  if (!washer && loadingRemote) {
    return (
      <div className="flex min-h-screen bg-[#F5F7FA]">
        <AdminSidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading washer profile…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!washer) {
    return (
      <div className="flex min-h-screen bg-[#F5F7FA]">
        <AdminSidebar />
        <main className="flex-1 p-10 flex items-center justify-center">
          <div className="max-w-md p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
            <h1 className="text-xl font-bold text-slate-900">Washer Partner Not Found</h1>
            <p className="text-xs text-slate-500">
              The requested washer partner could not be located in your active roster.
            </p>
            <Link
              href="/admin/washers"
              className="inline-block px-5 py-2.5 bg-[#0B132B] text-white font-bold text-xs rounded-xl"
            >
              Return to Washer Network
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleReinstate = async () => {
    if (confirm(`Reinstate ${washer.name} back to active partner status?`)) {
      await reinstateWasher(washer.id);
    }
  };

  const handleOpenAppointForVehicle = (vehicleId?: string) => {
    setAppointPreselectedVehicleId(vehicleId);
    setIsAppointModalOpen(true);
  };

  const handleAddSocietySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSocietyToAdd || !washer) return;
    setIsAddingSociety(true);
    setAddSocietyError('');

    const res = await assignWasherToSociety(washer.id, selectedSocietyToAdd);
    setIsAddingSociety(false);

    if (!res.success) {
      setAddSocietyError(res.error || 'Failed to assign society.');
      return;
    }

    const updatedSocieties = Array.from(new Set([...assignedSocietyIds, selectedSocietyToAdd]));
    const updatedWasher: WasherPartner = {
      ...washer,
      societies: updatedSocieties,
      society: updatedSocieties.map(resolveSocietyName).join(', '),
    };
    setRemoteWasher(updatedWasher);

    const updatedStore = washers.map((w) => (w.id === washer.id ? updatedWasher : w));
    setWashers(updatedStore);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('torque_washers', JSON.stringify(updatedStore));
      } catch (err) {}
    }

    setSelectedSocietyToAdd('');
    setIsAddSocietyModalOpen(false);
  };

  const handleRemoveSociety = async (socId: string) => {
    if (!washer) return;
    const socName = resolveSocietyName(socId);
    if (!confirm(`Are you sure you want to remove "${socName}" from ${washer.name}'s profile?`)) {
      return;
    }

    setRemovingSocietyId(socId);
    const res = await removeWasherFromSociety(washer.id, socId);
    setRemovingSocietyId(null);

    if (!res.success) {
      alert(res.error || 'Failed to remove society.');
      return;
    }

    const updatedSocieties = assignedSocietyIds.filter(
      (s) => s.toLowerCase() !== socId.toLowerCase()
    );
    const updatedWasher: WasherPartner = {
      ...washer,
      societies: updatedSocieties,
      society: updatedSocieties.map(resolveSocietyName).join(', '),
    };
    setRemoteWasher(updatedWasher);

    const updatedStore = washers.map((w) => (w.id === washer.id ? updatedWasher : w));
    setWashers(updatedStore);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('torque_washers', JSON.stringify(updatedStore));
      } catch (err) {}
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 pt-9 px-4 pb-6 sm:p-6 lg:p-10 space-y-8 overflow-y-auto pt-[max(env(safe-area-inset-top),2.25rem)]">
        {/* Breadcrumb Navigation - Partner ID is hidden from the UI */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/washers"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Washer Network</span>
          </Link>
        </div>

        {/* DISMISSAL BANNER (If Dismissed) */}
        {isDismissed && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border-2 border-red-500/40 text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-red-700">
                    Partner Access Revoked
                  </span>
                  <span className="text-[10px] font-bold bg-red-200 text-red-800 px-2 py-0.2 rounded">
                    Status: Dismissed
                  </span>
                </div>
                <h2 className="text-base font-black text-red-950 mt-0.5">
                  {washer.dismissalReason || 'Account deactivated by Manager'}
                </h2>
                {washer.dismissedAt && (
                  <p className="text-xs text-red-700 font-mono mt-0.5">
                    Dismissed timestamp: {new Date(washer.dismissedAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </div>

            {isCreatedByMe && (
              <button
                type="button"
                onClick={handleReinstate}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shrink-0 cursor-pointer shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>Reinstate to Active Duty</span>
              </button>
            )}
          </div>
        )}

        {/* Ownership Scope Notice */}
        {!isCreatedByMe && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Ownership Restriction:</strong> This washer partner was onboarded by Admin{' '}
                <strong>{washer.createdBy}</strong>. You have read-only audit access. Only the creating
                Admin can appoint vehicles or dismiss this partner.
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 font-bold shrink-0">
              View Only
            </span>
          </div>
        )}

        {/* Profile Hero Header Card */}
        <div
          className={`premium-card p-6 sm:p-8 bg-white border shadow-xs relative overflow-hidden ${
            isDismissed ? 'border-red-300' : 'border-slate-200/90'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-3 shadow-md shrink-0 flex items-center justify-center font-black text-xl text-white ${
                  isDismissed ? 'border-red-500 bg-slate-400 grayscale' : 'border-emerald-500 bg-blue-600'
                }`}
              >
                {washer.avatar && !washer.avatar.includes('washer_amit') ? (
                  <Image
                    src={washer.avatar}
                    alt={washer.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span>{washer.name.charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#0B132B] tracking-tight">
                    {washer.name}
                  </h1>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ Verified Partner
                  </span>
                  {isDismissed ? (
                    <span className="text-[11px] font-bold text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full border border-red-300">
                      Dismissed Partner
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {washer.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-500" /> {washer.rating} Rating ({washer.reviewsCount} reviews)
                  </span>

                  {/* Assigned Societies Display (Names instead of IDs) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {assignedSocietyIds.length > 0 ? (
                      assignedSocietyIds.map((socId, idx) => (
                        <span
                          key={idx}
                          className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs border border-slate-200"
                        >
                          {resolveSocietyName(socId)}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-xs italic">No societies assigned</span>
                    )}

                    {isCreatedByMe && !isDismissed && (
                      <button
                        type="button"
                        onClick={() => setIsAddSocietyModalOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md cursor-pointer transition-colors"
                        title="Add society to washer partner"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Society</span>
                      </button>
                    )}
                  </div>

                  <span className="font-mono text-slate-600 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {washer.phone}
                  </span>
                </div>

                <div className="text-xs text-emerald-700 flex items-center gap-1 font-semibold pt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{washer.kyc}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0 flex-wrap">
              {isCreatedByMe ? (
                !isDismissed ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenAppointForVehicle(undefined)}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>Appoint Vehicle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDismissModalOpen(true)}
                      className="px-3.5 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5 text-red-600" />
                      <span>Dismiss Partner</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleReinstate}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reinstate Partner</span>
                  </button>
                )
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 text-xs flex items-center gap-1.5 font-medium">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Control restricted to creator ({washer.createdBy})</span>
                </div>
              )}

              <a
                href={`tel:${washer.phone.replace(/[^0-9+]/g, '')}`}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Partner</span>
              </a>
            </div>
          </div>

          {/* Aadhaar Card Verification Strip */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/80 -mx-6 -mb-6 p-4 px-6 rounded-b-3xl">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Aadhaar Card:
                </span>
                <span className="font-mono font-black text-slate-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {washer.aadhaarNumber ? `•••• •••• ${washer.aadhaarNumber.slice(-4)}` : '4821 9912 3410'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  UIDAI Verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Phone OTP:
                </span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {washer.phone} (Verified)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 font-medium">
              Bank Account: <span className="font-semibold text-slate-700">{washer.bankAccount || 'HDFC Bank •••• 4021'}</span>
            </div>
          </div>
        </div>

        {/* SECTION: ASSIGNED SOCIETIES & SERVICE COVERAGE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Assigned Societies & Service Coverage</span>
            </span>
            {isCreatedByMe && !isDismissed && (
              <button
                type="button"
                onClick={() => setIsAddSocietyModalOpen(true)}
                className="text-emerald-700 font-sans font-bold hover:underline cursor-pointer flex items-center gap-1 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Society to Profile</span>
              </button>
            )}
          </div>

          <div className="premium-card bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6 rounded-2xl">
            {assignedSocietyIds.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Societies Assigned to {washer.name}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Assign societies to this partner profile so they can serve vehicle owners in those locations.
                </p>
                {isCreatedByMe && !isDismissed && (
                  <button
                    type="button"
                    onClick={() => setIsAddSocietyModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 mt-2 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Assign First Society</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {assignedSocietyIds.map((socId) => {
                  const socMeta = allSocieties.find(
                    (s) =>
                      s.societyId.toLowerCase() === socId.toLowerCase() ||
                      s.name.toLowerCase() === socId.toLowerCase()
                  );
                  const displayName = socMeta?.name || resolveSocietyName(socId);
                  const locationStr = [socMeta?.district, socMeta?.city, socMeta?.state]
                    .filter(Boolean)
                    .join(', ');
                  const isRemovingThis = removingSocietyId === socId;

                  return (
                    <div
                      key={socId}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-3 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#0B132B] truncate">{displayName}</h4>
                          {locationStr && (
                            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{locationStr}</span>
                            </p>
                          )}
                          <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-2">
                            Assigned Partner
                          </span>
                        </div>
                      </div>

                      {isCreatedByMe && !isDismissed && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSociety(socId)}
                          disabled={isRemovingThis}
                          title="Remove society from washer profile"
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {isRemovingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION: LIVE ROUTE & TODAY'S WASH PROOFS TRACKING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Live Daily Route & Wash Proofs Audit</span>
            </span>
            <span className="text-slate-500 font-sans normal-case">
              {todayStops.length > 0
                ? `${completedStopsCount} of ${todayStops.length} stops verified with photographic proof`
                : 'Standard assigned route window: ' + washer.routeWindow}
            </span>
          </div>

          {todayStops.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200/90 text-center space-y-2 shadow-xs">
              <Car className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800">No Route Stops Scheduled Today</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isDismissed
                  ? 'This partner has been dismissed. Route access has been revoked.'
                  : 'No stops currently assigned to this partner for today. Use the "Appoint Vehicle" button to assign vehicles to this washer.'}
              </p>
              {!isDismissed && (
                <button
                  type="button"
                  onClick={() => handleOpenAppointForVehicle(undefined)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs mt-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Appoint First Vehicle</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayStops.map((stop) => {
                const isCompleted = stop.status === 'completed';
                const isCurrent = stop.status === 'current';

                return (
                  <div
                    key={stop.wash_id || stop.vehicle_id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 flex flex-col justify-between hover:border-emerald-300 transition-all"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Stop #{stop.stop_number}
                        </span>
                        {isCompleted ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Completed
                          </span>
                        ) : isCurrent ? (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" /> In Progress
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                            Pending
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {stop.vehicle_name}
                        </h4>
                        <div className="text-xs font-mono font-bold text-emerald-700">
                          {stop.registration_number}
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{stop.parking_location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Window: {stop.scheduled_time}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Owner: <span className="text-slate-700 font-semibold">{stop.owner_name}</span> ({stop.owner_phone})
                        </div>
                      </div>
                    </div>

                    {/* Wash Proof Photo Preview */}
                    <div className="pt-2 border-t border-slate-100">
                      {stop.proof_photo ? (
                        <div
                          onClick={() =>
                            setPreviewPhoto({
                              url: stop.proof_photo!,
                              title: `${stop.vehicle_name} (${stop.registration_number})`,
                            })
                          }
                          className="relative h-28 rounded-xl overflow-hidden border border-emerald-300 group cursor-pointer shadow-2xs"
                        >
                          <Image
                            src={stop.proof_photo}
                            alt="Wash Proof"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <Eye className="w-4 h-4" />
                            <span>Audit High-Res Proof</span>
                          </div>
                          <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold text-white bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 text-emerald-400" /> Cryptographic Proof
                          </span>
                        </div>
                      ) : (
                        <div className="h-16 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                          {isCurrent ? 'Wash in progress (camera standby)' : 'Proof awaiting washer upload'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION: APPOINTED VEHICLES & OWNERS ROSTER */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-600" />
              <span>Appointed Vehicles & Owners Roster</span>
            </span>
            <button
              type="button"
              onClick={() => handleOpenAppointForVehicle(undefined)}
              className="text-emerald-700 font-sans font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>+ Appoint Another Car</span>
            </button>
          </div>

          <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
            {appointedVehicles.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No Vehicles Appointed to {washer.name}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Allocate owner vehicles to this partner so they populate their morning service route.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenAppointForVehicle(undefined)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold inline-flex items-center gap-1.5 mt-2"
                >
                  <Car className="w-4 h-4 text-emerald-400" />
                  <span>Appoint Car Now</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Vehicle & Number Plate</th>
                      <th className="p-4">Owner Name & Contact</th>
                      <th className="p-4">Parking Location</th>
                      <th className="p-4">Preferred Slot</th>
                      <th className="p-4">Plan Status</th>
                      <th className="p-4 text-right">Manager Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointedVehicles.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900 text-xs">
                            {v.make} {v.model}
                          </div>
                          <div className="font-mono text-emerald-700 font-bold mt-0.5">
                            {v.registration_number}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{v.owner_name}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {v.owner_id}
                          </div>
                        </td>

                        <td className="p-4 text-slate-600">
                          <div>{v.parking_location}</div>
                          <div className="text-[11px] text-slate-400">{v.society_name}</div>
                        </td>

                        <td className="p-4 font-mono text-slate-700">
                          {v.needWashBefore ? `Before ${v.needWashBefore}` : (v.preferred_wash_time || '08:00 AM')}
                        </td>

                        <td className="p-4">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full capitalize">
                            {v.subscription_status}
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenAppointForVehicle(v.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
                          >
                            Reassign Washer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 1: PERFORMANCE & TRACK RECORD */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Track Record & Core Performance Metrics</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Lifetime Washes</span>
              <div className="text-2xl sm:text-3xl font-black text-[#0B132B] font-mono">
                {washer.totalLifetimeWashes.toLocaleString()}
              </div>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Cryptographic Proof
              </span>
            </div>

            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Completion Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
                {washer.completionRate}
              </div>
              <span className="text-[11px] text-slate-500">Zero skipped apartment bays</span>
            </div>

            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Daily Cars Handled</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
                {washer.assignedCarsPerDay} <span className="text-xs font-normal text-slate-500">Cars/Day</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Window: {washer.routeWindow}</span>
            </div>

            <div className="premium-card p-5 bg-white border-slate-200/90 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium block">Average Wash Speed</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono">
                {washer.avgTimePerCar}
              </div>
              <span className="text-[11px] text-slate-500">High microfiber care compliance</span>
            </div>
          </div>
        </section>

        {/* SECTION 2: ATTENDANCE & MONTHLY ABSENCES */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Attendance & Monthly Absences (September 2026)</span>
          </div>

          <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-base shrink-0 ${
                    washer.absentThisMonth === 0
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {washer.absentThisMonth}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0B132B]">
                    {washer.absentThisMonth === 0
                      ? '0 Absences this Month'
                      : `${washer.absentThisMonth} Day Absent in September 2026`}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {washer.absentDates.length > 0
                      ? `Absent Dates: ${washer.absentDates.join(', ')}`
                      : 'Perfect Route Attendance Recorded (No Leaves)'}
                  </p>
                </div>
              </div>

              {washer.absentThisMonth > 0 ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Peer Proxy Covered: {washer.backupWasherName} ✓
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  100% Full Attendance ✓
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Absence Audit Log:</span>
              <p>{washer.leaveReason}</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: MONTHLY PAYOUTS GONE & DISBURSEMENT HISTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <span className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>Monthly Payouts Gone & Disbursed History</span>
            </span>
            <span className="text-emerald-700 font-sans font-bold">Direct Automated Wire Releases</span>
          </div>

          {/* Big Payouts Summary Banner */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0B132B] text-white shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Payouts Gone (Disbursed This Month)
                </span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                  ₹{washer.monthlyPayoutsGone.toLocaleString()}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  4 Automated Weekly Bank Clearings Executed with 0 Late Transfers
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
                <div className="text-left sm:right">
                  <span className="text-[11px] text-slate-400 block font-mono uppercase">Pending Cycle Due</span>
                  <span className="text-xl font-bold font-mono text-white">₹{washer.pendingPayoutDue.toLocaleString()}</span>
                </div>
                <div className="text-left sm:right">
                  <span className="text-[11px] text-slate-400 block font-mono uppercase">Sunday Bonus Retained</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">+₹{washer.sundayBonusEarned.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Torque Care enforces a <strong>0% platform commission on Sundays</strong>. All Sunday morning cleaning earnings are 100% disbursed to washers.
              </span>
            </div>
          </div>

          {/* Disbursements Table / Transaction History */}
          <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-[#0B132B]">
                  Disbursements & Bank Transaction Records
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  All weekly direct wire releases for September 2026
                </p>
              </div>

              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                {washer.disbursements.length} Completed Transfers
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="p-4">Disbursement Event</th>
                    <th className="p-4">Bank Account</th>
                    <th className="p-4">UTR Reference</th>
                    <th className="p-4 text-right">Gross Amount</th>
                    <th className="p-4 text-right">Platform Fee</th>
                    <th className="p-4 text-right">Net Transferred</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {washer.disbursements.map((d, index) => (
                    <tr
                      key={d.id}
                      onClick={() =>
                        setSelectedDisbursement(selectedDisbursement === d.id ? null : d.id)
                      }
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-4">
                        <div className="font-sans font-extrabold text-slate-900 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Week #{4 - index} Auto-Clearing</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {d.date}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-sans font-semibold text-slate-800 flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-blue-600" />
                          {d.bankAccount}
                        </div>
                        <div className="text-[10px] text-slate-400">Direct Clearing IMPS</div>
                      </td>

                      <td className="p-4 text-slate-700 font-bold">
                        {d.utr}
                      </td>

                      <td className="p-4 text-right text-slate-600">
                        ₹{d.grossAmount.toLocaleString()}
                      </td>

                      <td className="p-4 text-right text-emerald-600 font-bold">
                        ₹0
                      </td>

                      <td className="p-4 text-right font-extrabold text-emerald-700 text-sm">
                        +₹{d.netAmount.toLocaleString()}
                      </td>

                      <td className="p-4 text-center">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-sans">
                          {d.status} ✓
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* Appoint Washer Modal */}
      <AppointWasherModal
        isOpen={isAppointModalOpen}
        onClose={() => {
          setIsAppointModalOpen(false);
          setAppointPreselectedVehicleId(undefined);
        }}
        preselectedWasherId={washer.id}
        preselectedVehicleId={appointPreselectedVehicleId}
      />

      {/* Dismiss Washer Modal */}
      <DismissWasherModal
        isOpen={isDismissModalOpen}
        onClose={() => setIsDismissModalOpen(false)}
        washer={washer}
      />

      {/* Add Society to Profile Modal */}
      {isAddSocietyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsAddSocietyModalOpen(false);
                setAddSocietyError('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#0B132B] text-white flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0B132B]">Add Society to Profile</h3>
                <p className="text-xs text-slate-500">Assign a new society to {washer.name}</p>
              </div>
            </div>

            <form onSubmit={handleAddSocietySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Select Society <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSocietyToAdd}
                  onChange={(e) => setSelectedSocietyToAdd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-[#0B132B] focus:outline-none focus:border-[#0B132B] transition-all cursor-pointer"
                  required
                >
                  <option value="">-- Choose a Society --</option>
                  {availableSocietiesToAdd.map((s) => (
                    <option key={s.societyId} value={s.societyId}>
                      {s.name} ({[s.district, s.city].filter(Boolean).join(', ')})
                    </option>
                  ))}
                </select>
                {availableSocietiesToAdd.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1.5">
                    All available societies are already assigned to this partner.
                  </p>
                )}
              </div>

              {addSocietyError && (
                <div className="flex items-center gap-2 text-rose-600 text-xs font-medium bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{addSocietyError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddSocietyModalOpen(false);
                    setAddSocietyError('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingSociety || !selectedSocietyToAdd || availableSocietiesToAdd.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0B132B] hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isAddingSociety && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isAddingSociety ? 'Assigning…' : 'Add Society'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Photo Audit Lightbox */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full bg-slate-950 rounded-3xl overflow-hidden border border-white/20 shadow-2xl space-y-4"
          >
            <div className="p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="font-extrabold text-xs">{previewPhoto.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full h-[60vh] sm:h-[70vh]">
              <Image
                src={previewPhoto.url}
                alt={previewPhoto.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 bg-slate-900/90 border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Cryptographic Proof Timestamp: Authenticated</span>
              <span className="text-emerald-400 font-bold">100% Waterless Clean Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
