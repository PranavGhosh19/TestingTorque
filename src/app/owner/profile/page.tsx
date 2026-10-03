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

        {/* Society & Parking Info */}
        <div className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
            Primary Society Residence
          </h3>
          <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06] space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-white/60 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#2DD4A0]" /> Society:
              </span>
              <span className="font-bold text-white">Green Valley Residency</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#2DD4A0]" /> Tower & Flat:
              </span>
              <span className="font-mono text-white/90">Tower B • Flat 402</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Registered Vehicles:</span>
              <span className="font-mono font-bold text-[#2DD4A0]">{vehicles.length} Active in Garage</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#11161D] rounded-[20px] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden text-xs font-medium">
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
            href="/owner/payments"
            className="p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors"
          >
            <span className="flex items-center gap-2.5 text-white/80">
              <Shield className="w-4 h-4 text-[#2DD4A0]" /> Billing & Invoices
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

        {/* Danger Zone: Reset Owner Data */}
        <div className="p-5 bg-rose-500/[0.06] border border-rose-500/20 rounded-[20px] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                Reset Owner Data (Testing Sandbox)
              </h3>
              <p className="text-[11px] text-white/60 mt-0.5">
                Wipe all registered cars, subscriptions, and proof history to test fresh onboarding.
              </p>
            </div>
            <button
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
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
            className="w-full py-3.5 px-4 rounded-full bg-[#161C25] hover:bg-white/[0.08] text-rose-400 border border-white/[0.08] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out from Torque Care</span>
          </button>

          <button
            onClick={() => setRole('washer')}
            className="text-xs font-mono text-[#2DD4A0] hover:underline"
          >
            Switch to Washer Partner Mode →
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-[#11161D] border border-white/[0.08] rounded-[20px] p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Reset All Owner Data?</h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                This will delete your registered vehicles, chosen plan, assigned specialist, and wash logs from both local storage and Firebase Firestore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                disabled={isResetting}
                className="px-4 py-2.5 rounded-full bg-[#161C25] text-white/70 text-xs font-bold transition-colors"
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
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
