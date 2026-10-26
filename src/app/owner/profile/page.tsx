'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Building2,
  LogOut,
  ChevronRight,
  Car,
  Bell,
  RefreshCw,
  Settings,
  Edit2,
  ShieldCheck,
  Phone,
  User,
  Check,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import EditLocationSocietyModal from '@/components/modals/EditLocationSocietyModal';
import {
  fetchAllWashersFromFirestore,
  isWasherMatchForOwner,
  fetchCarOwnerProfileData,
  updateOwnerPhoneInFirestore,
  updateOwnerWasherInFirestore,
} from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/types';

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user, setUser, vehicles, setVehicles, isLoggedIn, isHydrated, logout } = useStore();

  // Modals
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showAddPhoneModal, setShowAddPhoneModal] = useState(false);
  const [showAddWasherModal, setShowAddWasherModal] = useState(false);

  // Phone Form State
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Washer Form State
  const [washerNameInput, setWasherNameInput] = useState('');
  const [washerPhoneInput, setWasherPhoneInput] = useState('');
  const [washerError, setWasherError] = useState('');
  const [isSavingWasher, setIsSavingWasher] = useState(false);

  // Status Toast Notice
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Live Washers Catalog
  const [liveWashers, setLiveWashers] = useState<WasherPartner[]>([]);
  const [isLoadingWashers, setIsLoadingWashers] = useState(false);

  // Live Firestore Car Owner Profile Data
  const [firestoreOwner, setFirestoreOwner] = useState<any>(null);
  const [firestoreVehicles, setFirestoreVehicles] = useState<any[]>([]);
  const [isLoadingOwnerData, setIsLoadingOwnerData] = useState(false);

  // Load Car Owner profile and vehicles from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadOwnerFromFirestore() {
      setIsLoadingOwnerData(true);
      try {
        const storedId =
          typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') : null;
        const ownerId =
          user?.role === 'owner' && user?.id && user.id !== 'usr_guest'
            ? user.id
            : storedId || undefined;
        const res = await fetchCarOwnerProfileData(ownerId, user?.phone);
        if (isMounted && res) {
          setFirestoreOwner(res.owner);
          setFirestoreVehicles(res.vehicles);
          if (res.vehicles && res.vehicles.length > 0) {
            setVehicles(res.vehicles);
          }
        }
      } catch (err) {
        console.warn('Notice loading owner profile from firestore:', err);
      } finally {
        if (isMounted) setIsLoadingOwnerData(false);
      }
    }
    loadOwnerFromFirestore();
    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.phone, setVehicles]);

  // Load all washers to find common / equal match for this owner's State, City, District, Society
  useEffect(() => {
    let isMounted = true;
    async function loadWashers() {
      setIsLoadingWashers(true);
      try {
        const list = await fetchAllWashersFromFirestore();
        if (isMounted) {
          setLiveWashers(list);
        }
      } catch (e) {
        console.warn('Notice loading washers for profile:', e);
      } finally {
        if (isMounted) setIsLoadingWashers(false);
      }
    }
    loadWashers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute matching washer based on live Firestore location
  const ownerState = firestoreOwner?.state || user?.state;
  const ownerCity = firestoreOwner?.city || user?.city;
  const ownerDistrict = firestoreOwner?.district || user?.district;
  const ownerSociety =
    firestoreOwner?.societyName || firestoreOwner?.society || user?.societyName || user?.society;

  const matchedWasher = useMemo(() => {
    const ownerLocation = {
      state: ownerState,
      city: ownerCity,
      district: ownerDistrict,
      society: ownerSociety,
      societyName: ownerSociety,
    };
    if (!ownerLocation.society) return null;
    return liveWashers.find((w) => isWasherMatchForOwner(w, ownerLocation)) || null;
  }, [ownerState, ownerCity, ownerDistrict, ownerSociety, liveWashers]);

  // Phone evaluation: check if phone is missing or dummy '+91 98000 00000'
  const rawPhone =
    firestoreOwner?.phone ||
    firestoreOwner?.phoneNumber ||
    user?.phone ||
    user?.phoneNumber ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_owner_phone') : null) ||
    '';

  const isDummyPhone =
    !rawPhone ||
    rawPhone.trim() === '' ||
    rawPhone.includes('98000 00000') ||
    rawPhone.includes('9800000000') ||
    rawPhone === 'usr_guest';

  const effectivePhone = isDummyPhone ? '' : rawPhone.trim();

  // Society evaluation
  const currentSociety = (
    firestoreOwner?.societyName ||
    firestoreOwner?.society ||
    user?.societyName ||
    user?.society ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_society_name') : null) ||
    ''
  ).trim();

  const hasSociety = Boolean(currentSociety && currentSociety !== '—' && currentSociety !== '-');

  // Dedicated Washer Specialist evaluation: exclude dummy names like 'Shubham G', 'Amit Kumar', etc.
  const rawWasherName =
    firestoreOwner?.assignedWasherName ||
    firestoreOwner?.assigned_washer_name ||
    user?.assigned_washer_name ||
    user?.selectedWasherName ||
    matchedWasher?.name ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null);

  const rawWasherPhone =
    firestoreOwner?.assignedWasherPhone ||
    firestoreOwner?.assigned_washer_phone ||
    (user as any)?.assigned_washer_phone ||
    matchedWasher?.phone ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_phone') : null);

  const isDummyWasher =
    !rawWasherName ||
    rawWasherName === 'Shubham G' ||
    rawWasherName === 'Amit Kumar' ||
    rawWasherName === 'Assigned Partner' ||
    rawWasherName === 'Assigned Route Partner' ||
    rawWasherName === 'Washer Partner' ||
    rawWasherName === 'Unregistered Owner';

  const effectiveWasherName = isDummyWasher ? null : rawWasherName.trim();
  const effectiveWasherPhone = isDummyWasher ? null : (rawWasherPhone || '').trim();
  const hasWasher = Boolean(effectiveWasherName);

  // Save phone number handler
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');
    const digits = phoneInput.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    const cleanPhone = `+91 ${digits.slice(-10)}`;
    setIsSavingPhone(true);

    try {
      const storedId =
        typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') : null;
      const targetOwnerId =
        user?.id && user.id !== 'usr_guest' ? user.id : storedId || `usr_${Date.now()}`;

      await updateOwnerPhoneInFirestore(targetOwnerId, cleanPhone);

      const updatedUser = {
        ...user,
        phone: cleanPhone,
        phoneNumber: cleanPhone,
      };
      setUser(updatedUser);
      setFirestoreOwner((prev: any) => ({
        ...prev,
        phone: cleanPhone,
        phoneNumber: cleanPhone,
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_owner_phone', cleanPhone);
        localStorage.setItem('torque_user', JSON.stringify(updatedUser));
      }

      setShowAddPhoneModal(false);
      setStatusNotice('Phone number saved successfully in Firestore!');
      setTimeout(() => setStatusNotice(null), 3500);
    } catch (err: any) {
      setPhoneError(err?.message || 'Failed to save phone number.');
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Save dedicated washer handler
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
      setWasherError("Please enter a valid 10-digit phone number for the washer.");
      return;
    }
    const cleanPhone = `+91 ${digits.slice(-10)}`;

    setIsSavingWasher(true);

    try {
      const storedId =
        typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') : null;
      const targetOwnerId =
        user?.id && user.id !== 'usr_guest' ? user.id : storedId || `usr_${Date.now()}`;

      await updateOwnerWasherInFirestore(targetOwnerId, cleanName, cleanPhone);

      const updatedUser = {
        ...user,
        assigned_washer_name: cleanName,
        assignedWasherName: cleanName,
        selectedWasherName: cleanName,
        assigned_washer_phone: cleanPhone,
      };
      setUser(updatedUser);

      // Also update vehicles in store
      if (vehicles.length > 0) {
        setVehicles(
          vehicles.map((v) => ({
            ...v,
            assigned_washer_name: cleanName,
          }))
        );
      }

      setFirestoreOwner((prev: any) => ({
        ...prev,
        assigned_washer_name: cleanName,
        assignedWasherName: cleanName,
        selectedWasherName: cleanName,
        assigned_washer_phone: cleanPhone,
        assignedWasherPhone: cleanPhone,
      }));

      if (typeof window !== 'undefined') {
        localStorage.setItem('torque_assigned_washer_name', cleanName);
        localStorage.setItem('torque_assigned_washer_phone', cleanPhone);
        localStorage.setItem('torque_user', JSON.stringify(updatedUser));
      }

      setShowAddWasherModal(false);
      setStatusNotice('Dedicated washer saved successfully in Firestore!');
      setTimeout(() => setStatusNotice(null), 3500);
    } catch (err: any) {
      setWasherError(err?.message || 'Failed to save washer details.');
    } finally {
      setIsSavingWasher(false);
    }
  };

  const displayName = user?.name || user?.owner_name || 'Car Owner';
  const nameInitials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'CO';

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
              Account & Society Residency
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Owner Profile
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/owner/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#161C25] hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/[0.08]"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#2DD4A0]" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/owner/vehicles"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#161C25] hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/[0.08]"
            >
              <Car className="w-3.5 h-3.5 text-[#2DD4A0]" />
              <span>Vehicles</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Status Notification */}
        {statusNotice && (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
            <span className="font-semibold">{statusNotice}</span>
          </div>
        )}

        {/* User Card */}
        <div className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#161C25] border border-white/[0.08] text-[#2DD4A0] flex items-center justify-center text-xl font-bold font-mono">
            {nameInitials}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{displayName}</h2>
            <div className="text-xs text-white/60 flex items-center gap-2 mt-1 flex-wrap">
              {effectivePhone ? (
                <div className="inline-flex items-center gap-1.5 font-mono text-white/90">
                  <Phone className="w-3.5 h-3.5 text-[#2DD4A0]" />
                  <span>{effectivePhone}</span>
                  <button
                    onClick={() => {
                      setPhoneInput(effectivePhone.replace('+91', '').trim());
                      setPhoneError('');
                      setShowAddPhoneModal(true);
                    }}
                    className="p-1 hover:text-[#2DD4A0] text-white/40 transition-colors cursor-pointer"
                    title="Edit Phone Number"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPhoneInput('');
                    setPhoneError('');
                    setShowAddPhoneModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4A0]/15 hover:bg-[#2DD4A0]/25 text-[#2DD4A0] border border-[#2DD4A0]/30 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Phone className="w-3 h-3" />
                  <span>+ Add Phone Number</span>
                </button>
              )}

              <span>•</span>
              <span className="text-[#2DD4A0] font-bold font-mono">Active Member</span>
            </div>
          </div>
        </div>

        {/* Society & Specialist Residence Card */}
        <div className="p-5 sm:p-6 bg-[#11161D] rounded-[22px] border border-white/[0.08] shadow-xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 flex items-center justify-center text-[#2DD4A0] shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#2DD4A0] block">
                  Residence & Society
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {hasSociety ? currentSociety : 'Primary Residence'}
                </h3>
              </div>
            </div>

            {hasSociety ? (
              <button
                onClick={() => setShowEditLocationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Edit2 className="w-3.5 h-3.5 text-[#2DD4A0]" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={() => setShowEditLocationModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Add Society</span>
              </button>
            )}
          </div>

          {/* Residence Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-[#161C25]/70 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                Tower & Flat
              </span>
              <span className="text-xs font-semibold text-white/90 truncate block">
                {firestoreOwner?.flat ||
                  firestoreOwner?.flatNumber ||
                  firestoreOwner?.address ||
                  user?.flat ||
                  user?.flatNumber ||
                  user?.address || (
                    <span className="text-white/40 italic font-normal">Not set</span>
                  )}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#161C25]/70 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                District & City
              </span>
              <span className="text-xs font-semibold text-white/90 truncate block">
                {[
                  firestoreOwner?.district || user?.district,
                  firestoreOwner?.city || user?.city,
                ].filter(Boolean).join(', ') || (
                  <span className="text-white/40 italic font-normal">Not set</span>
                )}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#161C25]/70 border border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                Active Vehicles
              </span>
              <span className="text-xs font-bold text-[#2DD4A0] font-mono block">
                {firestoreVehicles.length > 0 ? firestoreVehicles.length : vehicles.length} in Garage
              </span>
            </div>
          </div>

          {/* Dedicated Washer Specialist Section */}
          <div className="pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4A0]" />
                Dedicated Care Specialist
              </span>
              {hasWasher && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  ✓ Assigned Partner
                </span>
              )}
            </div>

            {!hasWasher ? (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-dashed border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-white/90">
                    No specialist assigned{hasSociety ? ` for ${currentSociety}` : ''}
                  </p>
                  <p className="text-[11px] text-white/50 mt-0.5">
                    Add your washer's contact to coordinate daily doorstep care.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWasherNameInput('');
                    setWasherPhoneInput('');
                    setWasherError('');
                    setShowAddWasherModal(true);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>+ Add Specialist</span>
                </button>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.06] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 flex items-center justify-center text-[#2DD4A0] font-bold text-sm shrink-0 font-mono">
                    {effectiveWasherName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white tracking-tight truncate">
                      {effectiveWasherName}
                    </h4>
                    {effectiveWasherPhone ? (
                      <a
                        href={`tel:${effectiveWasherPhone}`}
                        className="text-xs text-[#2DD4A0] font-mono hover:underline inline-flex items-center gap-1.5 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{effectiveWasherPhone}</span>
                      </a>
                    ) : (
                      <p className="text-[11px] text-white/50 mt-0.5 truncate">
                        {hasSociety ? `Morning bay care for ${currentSociety}` : 'Morning doorstep specialist'}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    router.push('/owner/settings');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#2DD4A0] border border-white/10 text-xs font-mono font-bold tracking-wider transition-all shrink-0 cursor-pointer"
                >
                  Change →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#11161D] rounded-[20px] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden text-xs font-medium">
          <Link
            href="/owner/settings"
            className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5 text-white/80">
              <Settings className="w-4 h-4 text-[#2DD4A0]" /> Dedicated Washer & Society Settings
            </span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>

          <Link
            href="/owner/vehicles"
            className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5 text-white/80">
              <Car className="w-4 h-4 text-[#2DD4A0]" /> Manage Fleet ({vehicles.length} cars)
            </span>
            <ChevronRight className="w-4 h-4 text-white/40" />
          </Link>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              logout();
              router.replace('/');
            }}
            className="w-full py-3.5 px-4 rounded-full bg-[#161C25] hover:bg-white/[0.08] text-rose-400 border border-white/[0.08] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Torque Care</span>
          </button>
        </div>
      </main>

      {/* MODAL 1: ADD / EDIT PHONE NUMBER */}
      {showAddPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#11161D] border border-white/[0.1] rounded-[24px] p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {effectivePhone ? 'Edit Phone Number' : 'Add Phone Number'}
                  </h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    Direct sync with Firestore Car_Owners
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPhoneModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {phoneError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{phoneError}</span>
              </div>
            )}

            <form onSubmit={handleSavePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-1.5">
                  Mobile Number (10 Digits)
                </label>
                <div className="flex items-center bg-[#161C25] border border-white/[0.08] rounded-xl overflow-hidden focus-within:border-[#2DD4A0] transition-colors">
                  <span className="px-3.5 py-3 text-xs font-mono font-bold text-[#2DD4A0] bg-white/[0.02] border-r border-white/[0.08]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="flex-1 bg-transparent px-3.5 py-3 text-sm text-white placeholder-white/30 focus:outline-hidden font-mono"
                    autoFocus
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPhoneModal(false)}
                  className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingPhone}
                  className="px-6 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPhone ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save to Firestore</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT DEDICATED WASHER */}
      {showAddWasherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#11161D] border border-white/[0.1] rounded-[24px] p-6 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {hasWasher ? 'Change Dedicated Washer' : 'Add Dedicated Washer'}
                  </h3>
                  <p className="text-[11px] text-white/50 font-mono">
                    Assigned to {currentSociety}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddWasherModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
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
                  Washer's Full Name
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
                  Washer's Phone Number (10 Digits)
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
                      <span>Save Washer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT / ADD SOCIETY & LOCATION */}
      <EditLocationSocietyModal
        isOpen={showEditLocationModal}
        onClose={() => setShowEditLocationModal(false)}
        onSaved={(updatedUser, matchedWsh) => {
          setUser(updatedUser);
          setFirestoreOwner((prev: any) => ({
            ...prev,
            ...updatedUser,
            assignedWasherName: matchedWsh?.name || updatedUser.assigned_washer_name,
            assigned_washer_name: matchedWsh?.name || updatedUser.assigned_washer_name,
            assignedWasherPhone: matchedWsh?.phone || (updatedUser as any).assigned_washer_phone,
            assigned_washer_phone: matchedWsh?.phone || (updatedUser as any).assigned_washer_phone,
          }));
          setStatusNotice('Society details saved successfully in Firestore!');
          setTimeout(() => setStatusNotice(null), 3500);
        }}
      />

      <OwnerBottomNav />
    </div>
  );
}
