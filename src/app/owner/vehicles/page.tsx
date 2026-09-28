'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Car, Plus, MapPin, Clock, ShieldCheck, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerVehiclesPage() {
  const { vehicles } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

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
      </div>

      <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
      <OwnerBottomNav />
    </div>
  );
}
