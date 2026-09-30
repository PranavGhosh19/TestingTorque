'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Car, Plus, MapPin, Clock, ShieldCheck, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerVehiclesPage() {
  const router = useRouter();
  const { vehicles, isLoggedIn, isHydrated } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 font-mono">Verifying owner session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Garage & Subscriptions
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              My Vehicles
            </h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {vehicles.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4 max-w-lg mx-auto my-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
              🚗
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#0B132B]">No Vehicles in Garage</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your garage is currently reset. Add a vehicle or complete owner onboarding to assign a dedicated washer partner and schedule daily doorstep washes.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <Link
                href="/auth/onboarding"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Vehicle & Plan</span>
              </Link>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
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
                className="premium-card p-5 sm:p-6 bg-white border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
                      🚗
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#0B132B]">
                        {v.make} {v.model}
                      </h3>
                      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wide">
                        {v.registration_number}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Active
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" /> Parking Bay:
                    </span>
                    <span className="font-semibold text-slate-900">{v.parking_location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" /> Preferred Time:
                    </span>
                    <span className="font-semibold text-slate-900">{v.preferred_wash_time}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold">
                    <span className="text-slate-500">This Month:</span>
                    <span className="text-emerald-700">{v.washes_this_month} washes verified</span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <Link
                    href="/owner/washes/history"
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B132B] font-bold text-xs text-center transition-colors"
                  >
                    [ View Vehicle History ]
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <OwnerBottomNav />
    </div>
  );
}
