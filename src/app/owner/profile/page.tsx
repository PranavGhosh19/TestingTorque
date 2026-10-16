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

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

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
  const ownerState = firestoreOwner?.state || user.state;
  const ownerCity = firestoreOwner?.city || user.city;
  const ownerDistrict = firestoreOwner?.district || user.district;
  const ownerSociety =
    firestoreOwner?.societyName || firestoreOwner?.society || user.societyName || user.society;

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
    user.societyName ||
    user.society ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_society_name') : null) ||
    ''
  ).trim();

  const hasSociety = Boolean(currentSociety && currentSociety !== '—' && currentSociety !== '-');

  // Dedicated Washer Specialist evaluation: exclude dummy names like 'Shubham G', 'Amit Kumar', etc.
  const rawWasherName =
    firestoreOwner?.assignedWasherName ||
    firestoreOwner?.assigned_washer_name ||
    user.assigned_washer_name ||
    user.selectedWasherName ||
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

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-white/50">
            Verifying profile session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
            Account & Society Residency
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Owner Profile
          </h1>
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
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
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
        