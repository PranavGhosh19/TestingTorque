'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  Plus,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  User,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import { resolveEffectiveOwnerId, fetchCarOwnerProfileData } from '@/lib/firebaseService';

export default function OwnerVehiclesPage() {
  const router = useRouter();
  const { vehicles, setVehicles, user, isLoggedIn, isHydrated, role } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);

  // Authentication check: Wait for hydration before verifying
  useEffect(() => {
    if (!isHydrated) return;

    const storedLoggedIn = typeof window !== 'undefined' && localStorage.getItem('torque_logged_in') === 'true';
    const storedOwnerId = typeof window !== 'undefined' ? localStorage.getItem('torque_owner_id') : null;

    if (!isLoggedIn && !storedLoggedIn && !storedOwnerId && role !== 'owner') {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, role, router]);

  // Load vehicles from Firestore if store is empty or needs refresh
  useEffect(() => {
    let isMounted = true;
    async function loadVehicles() {
      if (!isHydrated) return;
      setIsLoadingVehicles(true);
      try {
        const effectiveId = resolveEffectiveOwnerId(user?.id) || user?.id || 'usr_pranav_1';
        const res = await fetchCarOwnerProfileData(effectiveId, user?.phone);
        if (isMounted && res?.vehicles && res.vehicles.length > 0) {
          setVehicles(res.vehicles);
        }
      } catch (err) {
        console.warn('Notice loading vehicles from Firestore:', err);
      } finally {
        if (isMounted) setIsLoadingVehicles(false);
      }
    }

    if (vehicles.length === 0) {
      loadVehicles();
    }

    return () => {
      isMounted = false;
    };
  }, [isHydrated, user?.id, user?.phone, vehicles.length, setVehicles]);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin" />
          <p className="text-xs font-mono uppercase tracking-widest text-white/50">Verifying garage session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      {/* Header */}
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
                Garage &amp; Fleet
              </span>
              <span className="text-white/30 text-xs">•</span>
              <Link
                href="/owner/dashboard"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-white/60 hover:text-[#2DD4A0] transition-colors"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              My Vehicles
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/owner/dashboard"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#161C25] hover:bg-white/10 text-white text-xs font-bold transition-all border border-white/[0.08]"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#2DD4A0]" />
              <span>Dashboard</span>
            </Link>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {isLoadingVehicles && vehicles.length === 0 ? (
          <div className="p-12 text-center bg-[#11161D] rounded-[20px] border border-white/[0.08] space-y-3 max-w-lg mx-auto my-6">
            <RefreshCw className="w-8 h-8 text-[#2DD4A0] animate-spin mx-auto" />
            <p className="text-xs font-mono uppercase tracking-widest text-white/60">
              Loading vehicles from Firestore...
            </p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="p-10 text-center bg-[#11161D] rounded-[20px] border border-white/[0.08] space-y-4 max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-[#161C25] text-[#2DD4A0] flex items-center justify-center mx-auto text-2xl border border-white/[0.06]">
              🚗
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">No Vehicles in Garage</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                Add a vehicle or onboard your apartment bay to assign a dedicated specialist and schedule daily doorstep washes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] font-black text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle for Tracking</span>
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#161C25] hover:bg-white/10 text-white font-bold text-xs border border-white/[0.08] transition-colors"
              >
                Quick Add Vehicle
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] hover:border-white/20 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#161C25] border border-white/[0.06] text-[#2DD4A0] flex items-center justify-center text-xl">
                      🚗
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {v.make} {v.model}
                      </h3>
                      {/* IND PLATE BADGE */}
                      <div className="inline-flex items-center bg-[#E5E7EB] text-[#111827] rounded-sm border border-slate-400 overflow-hidden font-mono text-[11px] font-bold tracking-widest mt-1">
                        <span className="bg-[#1E3A8A] text-white px-1 text-[8px] font-sans flex flex-col items-center justify-center py-0.5 leading-none">
                          <span className="text-[6px]">🇮🇳</span>
                          <span>IND</span>
                        </span>
                        <span className="px-2 py-0.5">{v.registration_number}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 px-2.5 py-1 rounded-full border border-[#2DD4A0]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
                    Active
                  </span>
                </div>

                <div className="p-3.5 bg-[#161C25] rounded-xl space-y-2 text-xs text-white/70 border border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-white/50">
                      <MapPin className="w-3.5 h-3.5 text-[#2DD4A0]" /> Parking Bay:
                    </span>
                    <span className="font-mono font-bold text-white">{v.parking_location || 'Bay Assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-white/50">
                      <Clock className="w-3.5 h-3.5 text-[#2DD4A0]" /> Need Before:
                    </span>
                    <span className="font-mono text-white/90">
                      Before {v.needWashBefore || (v.preferred_wash_time?.startsWith('Before') ? v.preferred_wash_time.replace(/^Before\s+/i, '') : (v.preferred_wash_time || '8:00 AM'))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-white/50">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4A0]" /> Assigned Specialist:
                    </span>
                    <span className="font-bold text-white">
                      {v.assigned_washer_name || user?.assigned_washer_name || 'Amit Kumar'}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <Link
                    href="/owner/dashboard"
                    className="w-full py-2.5 px-4 rounded-full bg-[#161C25] hover:bg-white/10 text-white font-mono text-xs font-bold text-center border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Audit Calendar</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#2DD4A0]" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <OwnerBottomNav />
    </div>
  );
}
