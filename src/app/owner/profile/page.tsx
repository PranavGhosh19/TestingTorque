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
} from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import EditLocationSocietyModal from '@/components/modals/EditLocationSocietyModal';
import {
  fetchAllWashersFromFirestore,
  isWasherMatchForOwner,
  fetchCarOwnerProfileData,
} from '@/lib/firebaseService';
import { WasherPartner } from '@/lib/types';

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user, setUser, vehicles, setVehicles, isLoggedIn, isHydrated, logout } = useStore();
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
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

  const effectiveWasherName =
    matchedWasher?.name ||
    user.assigned_washer_name ||
    user.selectedWasherName ||
    (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null);

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-white/50">Verifying profile session...</p>
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
        {/* User Card */}
        <div className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#161C25] border border-white/[0.08] text-[#2DD4A0] flex items-center justify-center text-xl font-bold font-mono">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white">{user.name}</h2>
            <div className="text-xs text-white/60 flex items-center gap-2 mt-0.5 font-mono">
              <span>{user.phone}</span>
              <span>•</span>
              <span className="text-[#2DD4A0] font-bold">Active Member</span>
            </div>
          </div>
        </div>

        {/* Society & Location Residence Card */}
        <div className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
              Primary Society Residence & Location
            </h3>
            <button
              onClick={() => setShowEditLocationModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#161C25] hover:bg-white/10 text-[#2DD4A0] text-xs font-bold transition-all border border-white/[0.08] active:scale-95 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Change Society</span>
            </button>
          </div>

          <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06] space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2DD4A0]" /> Society:
              </span>
              <span className="font-bold text-white text-sm">
                {firestoreOwner?.societyName || firestoreOwner?.society || user.societyName || user.society || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-white/60 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2DD4A0]" /> District & City:
              </span>
              <span className="text-white/90 font-medium">
                {[
                  firestoreOwner?.district || user.district,
                  firestoreOwner?.city || user.city,
                ].filter(Boolean).join(', ') || '—'}
              </span>
            </div>

            {(firestoreOwner?.state || user.state) && (
              <div className="flex justify-between items-center">
                <span className="text-white/60">State:</span>
                <span className="text-white/90 font-medium">{firestoreOwner?.state || user.state}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-white/60">Tower & Flat:</span>
              <span className="font-mono text-white/90">
                {firestoreOwner?.flat ||
                  firestoreOwner?.flatNumber ||
                  firestoreOwner?.address ||
                  user.flat ||
                  user.flatNumber ||
                  user.address ||
                  '—'}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-white/[0.06]">
              <span className="text-white/60">Registered Vehicles:</span>
              <span className="font-mono font-bold text-[#2DD4A0]">
                {firestoreVehicles.length > 0 ? firestoreVehicles.length : vehicles.length} Active in Garage
              </span>
            </div>
          </div>

          {/* DEDICATED WASHER SPECIALIST SECTION (Shows Washer Name when Common) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#2DD4A0]/10 via-[#161C25] to-[#161C25] border border-[#2DD4A0]/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2DD4A0] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Dedicated Society Washer Specialist
              </span>
              {matchedWasher && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  ✓ Matched Route
                </span>
              )}
            </div>

            {effectiveWasherName ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{effectiveWasherName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] font-mono font-semibold">
                      Assigned Partner
                    </span>
                  </h4>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    Covers morning bay wash for <strong>{user.societyName || user.society || 'your society'}</strong>
                    {user.district ? ` in ${user.district}` : ''}.
                  </p>
                </div>
                <Link
                  href="/owner/settings"
                  className="text-xs font-mono font-bold text-[#2DD4A0] hover:underline shrink-0 pl-2"
                >
                  Manage →
                </Link>
              </div>
            ) : (
              <div className="pt-1 text-xs text-white/60">
                <p>No washer specialist currently matched for this society cluster.</p>
                <p className="text-[11px] text-white/40 mt-0.5">
                  When a washer registers with State: <strong>{user.state || 'Selected'}</strong>, City: <strong>{user.city || 'Selected'}</strong>, District: <strong>{user.district || 'Selected'}</strong>, and Society: <strong>{user.societyName || user.society || 'Selected'}</strong>, their name will appear here automatically.
                </p>
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

          <Link
            href="/owner/notifications"
            className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5 text-white/80">
              <Bell className="w-4 h-4 text-[#2DD4A0]" /> Daily Photo Alerts & SMS
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

      <EditLocationSocietyModal
        isOpen={showEditLocationModal}
        onClose={() => setShowEditLocationModal(false)}
        onSaved={(updatedUser) => {
          setUser(updatedUser);
          setFirestoreOwner((prev: any) => ({ ...prev, ...updatedUser }));
        }}
      />

      <OwnerBottomNav />
    </div>
  );
}
