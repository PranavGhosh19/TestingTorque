'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Star,
  ShieldCheck,
  Plus,
  Car,
  Calendar,
  Wallet,
  ChevronRight,
  ArrowRight,
  Phone,
  CreditCard,
  UserCheck,
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';
import OnboardWasherModal from '@/components/modals/OnboardWasherModal';

export default function AdminWashersPage() {
  const { washers } = useStore();
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Partner Management & Audit Portal
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Aadhaar KYC Enforced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight mt-1">
              Washer Network
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
              {washers.length} Active Partners
            </span>
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Partner</span>
            </button>
          </div>
        </div>

        {/* Empty state if data was erased */}
        {washers.length === 0 ? (
          <div className="premium-card p-12 bg-white border-slate-200/90 text-center space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl">
              🧼
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">
              No Washer Partners Active
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              All data has been cleared. Onboard your first washer partner with government Aadhaar Card verification, mobile OTP authentication, and route assignment.
            </p>
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard First Partner with Aadhaar</span>
            </button>
          </div>
        ) : (
          /* Washer Cards Grid - Each links to dedicated page */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {washers.map((w) => (
              <Link
                key={w.id}
                href={`/admin/washers/${w.id}`}
                className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group block"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-xs shrink-0">
                      <Image
                        src={w.avatar}
                        alt={w.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-[#0B132B] group-hover:text-emerald-700 transition-colors flex items-center gap-1.5">
                        <span>{w.name}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-600 transition-all" />
                      </h2>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {w.rating} Rating
                        </span>
                        <span className="text-slate-400 font-normal">({w.reviewsCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 block">
                      {w.status}
                    </span>
                    {w.aadhaarVerified && (
                      <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-block">
                        UIDAI Aadhaar ✓
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/70 transition-colors">
                    <div className="text-[11px] text-slate-500 font-medium">Cars / Day</div>
                    <div className="text-base font-black text-slate-900 mt-0.5 font-mono">
                      {w.assignedCarsPerDay}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100/70 transition-colors">
                    <div className="text-[11px] text-slate-500 font-medium">Monthly Absences</div>
                    <div
                      className={`text-base font-black mt-0.5 font-mono ${
                        w.absentThisMonth > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {w.absentThisMonth} {w.absentThisMonth === 1 ? 'day' : 'days'}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 group-hover:bg-emerald-100/70 transition-colors">
                    <div className="text-[11px] text-emerald-700 font-medium">Payouts Gone</div>
                    <div className="text-base font-black text-emerald-800 font-mono mt-0.5">
                      ₹{w.monthlyPayoutsGone.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Cluster & KYC Info */}
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Society Cluster:</span>
                    <span className="font-semibold text-slate-900">{w.society}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Morning Route Window:</span>
                    <span className="font-mono text-slate-800 font-semibold">{w.routeWindow}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Aadhaar Card:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {w.aadhaarNumber ? `•••• •••• ${w.aadhaarNumber.slice(-4)}` : 'Verified on File'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone Verification:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {w.phone} (Verified)
                    </span>
                  </div>
                </div>

                {/* Action Banner */}
                <div className="pt-2 flex items-center justify-between text-xs text-emerald-700 font-bold border-t border-slate-100">
                  <span>View Dedicated Profile & Track Record</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Partner Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Onboard Washer Partner Modal */}
      <OnboardWasherModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
      />
    </div>
  );
}

