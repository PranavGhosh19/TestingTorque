'use client';

import React from 'react';
import Link from 'next/link';
import { User, Phone, MapPin, Building2, Shield, LogOut, ChevronRight, Car, Bell } from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerProfilePage() {
  const { user, vehicles, setRole } = useStore();

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Account & Society
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Owner Profile
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* User Card */}
        <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0B132B] text-white flex items-center justify-center text-xl font-bold">
            {user.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-extrabold text-[#0B132B]">{user.name}</h2>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>{user.phone}</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Active Member</span>
            </div>
          </div>
        </div>

        {/* Society & Parking Info */}
        <div className="premium-card p-6 bg-white border-slate-200/90 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Primary Society Residence
          </h3>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> Society:
              </span>
              <span className="font-bold text-slate-900">Green Valley Residency</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" /> Tower & Flat:
              </span>
              <span className="font-medium text-slate-800">Tower B • Flat 402</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Registered Vehicles:</span>
              <span className="font-bold text-slate-900">{vehicles.length} Active in Garage</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 overflow-hidden text-xs font-semibold">
          <Link
            href="/owner/vehicles"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Car className="w-4 h-4 text-slate-400" /> Manage Vehicles ({vehicles.length})
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/owner/payments"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Shield className="w-4 h-4 text-slate-400" /> Billing & Payment Methods
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/owner/notifications"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Bell className="w-4 h-4 text-slate-400" /> Notification Preferences
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        {/* Switch Persona */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setRole('washer')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Switch to Washer Partner Mode →
          </button>
        </div>
      </div>

      <OwnerBottomNav />
    </div>
  );
}
