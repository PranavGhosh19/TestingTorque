'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Shield,
  ShieldCheck,
  Bell,
  Key,
  Database,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Car,
  Sparkles,
} from 'lucide-react';

import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';

export default function AdminSettingsPage() {
  const { vehicles, washers, washes, isDataErased, eraseAllData, resetOwnerData, resetToDemoData } = useStore();
  const [showConfirmErase, setShowConfirmErase] = useState(false);
  const [showConfirmResetOwner, setShowConfirmResetOwner] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const handleErase = () => {
    eraseAllData();
    setShowConfirmErase(false);
    setFeedbackMsg('All test data erased successfully! Ready for real sign up and partner onboarding.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleRestore = () => {
    resetToDemoData();
    setFeedbackMsg('Default demo dataset restored successfully.');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  const handleResetOwnerOnly = async () => {
    await resetOwnerData();
    setShowConfirmResetOwner(false);
    setFeedbackMsg('Owner profile, vehicles, and wash records reset successfully!');
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Platform Configuration & Sandbox
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              System Settings & Data
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${
                isDataErased
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {isDataErased ? '● Clean Slate (Data Erased)' : '● System Active'}
            </span>
          </div>
        </div>

        {feedbackMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* SECTION 1: DATA MANAGEMENT & RESET (Requested Feature) */}
        <div className="premium-card bg-white p-6 sm:p-7 border-slate-200/90 shadow-xs space-y-6 max-w-3xl">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0B132B]">
                Data Management & Real Testing Sandbox
              </h2>
              <p className="text-xs text-slate-500">
                Erase existing records to sign up, log in, and onboard washers with real Aadhaar test data.
              </p>
            </div>
          </div>

          {/* Current Counts Grid */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500">Vehicles</div>
              <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                {vehicles.length}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500">Washer Partners</div>
              <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                {washers.length}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] font-semibold text-slate-500">Wash Records</div>
              <div className="text-xl font-black font-mono text-slate-900 mt-0.5">
                {washes.length}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Erase All Data</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Wipes all vehicles, washes, washers, and owners. Clears browser storage for fresh testing.
                </p>
              </div>

              {!showConfirmErase ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmErase(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  Erase All Data
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleErase}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmErase(false)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-blue-500" />
                  <span>Reset Owner Data Only</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Wipes owner vehicles and subscription history without affecting washer onboarding.
                </p>
              </div>

              {!showConfirmResetOwner ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmResetOwner(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  Reset Owner Data
                </button>
              ) : (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetOwnerOnly}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl cursor-pointer"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowConfirmResetOwner(false)}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restore Demo Dataset</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Loads standard sample vehicles, wash verification photos, and 4 partner routes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRestore}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors shrink-0"
              >
                Restore Demo Data
              </button>
            </div>
          </div>

          {/* Quick Nav Links after erasing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <Link
              href="/auth/signup"
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-500" />
                <span className="font-bold text-slate-900">Sign Up New Vehicle Owner</span>
              </div>
              <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </Link>

            <Link
              href="/auth/washer-onboarding"
              className="p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-between group transition-colors"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-900">Onboard Washer with Aadhaar</span>
              </div>
              <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>

        {/* SECTION 2: Integrations & Operational Settings */}
        <div className="premium-card bg-white p-6 border-slate-200/90 shadow-xs space-y-4 max-w-3xl">
          <h2 className="text-sm font-bold text-[#0B132B]">
            Integrations & Operational Thresholds
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
              <div>
                <div className="font-bold text-slate-800">Razorpay Auto-Debit Webhook</div>
                <div className="text-slate-500">Live webhook endpoint connected</div>
              </div>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Connected</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
              <div>
                <div className="font-bold text-slate-800">Society Cluster Boundary</div>
                <div className="text-slate-500">Basement parking zone radius</div>
              </div>
              <span className="font-bold text-slate-900">Active</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
              <div>
                <div className="font-bold text-slate-800">Sunday Priority Surcharge</div>
                <div className="text-slate-500">Default rate passed to washer</div>
              </div>
              <span className="font-bold text-slate-900">₹50 (100% partner share)</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

