'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Building2, Shield, LogOut, ChevronRight, Car, Bell, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerProfilePage() {
  const router = useRouter();
  const { user, vehicles, setRole, resetOwnerData, isLoggedIn, isHydrated, logout } = useStore();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

        {/* Danger Zone: Reset Owner Data */}
        <div className="premium-card p-5 bg-rose-50/50 border-rose-200/80 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-rose-900 uppercase tracking-wider">
                Reset Owner Data (Testing Sandbox)
              </h3>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Wipe all registered cars, subscriptions, and proof history to test fresh onboarding.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Owner</span>
            </button>
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-2 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              logout();
              router.replace('/');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-rose-600 border border-slate-200 text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Torque Care</span>
          </button>

          <button
            onClick={() => setRole('washer')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Switch to Washer Partner Mode →
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-[#0B132B]">Reset All Owner Data?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will delete your registered vehicles, chosen plan, assigned washer partner, and wash logs from both local storage and Firebase Firestore. You will have a clean slate to sign up and test onboarding again.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsResetting(true);
                  try {
                    await resetOwnerData();
                    setShowConfirmReset(false);
                  } finally {
                    setIsResetting(false);
                  }
                }}
                disabled={isResetting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                {isResetting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Reset Everything</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <OwnerBottomNav />
    </div>
  );
}
