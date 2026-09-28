'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Star, Award, Landmark, Calendar, Phone, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';

export default function WasherProfilePage() {
  const { washerEarnings, setRole } = useStore();

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Certified Partner Identity
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
            Washer Profile
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Profile Card */}
        <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
            <Image
              src="/images/washer_amit.jpg"
              alt="Amit Kumar"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0B132B]">Amit Kumar</h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ✓ Verified Partner
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500" /> 4.9 Rating
              </span>
              <span>•</span>
              <span>Green Valley Residency Cluster</span>
            </div>
          </div>
        </div>

        {/* Operational Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-[#0B132B]">1,240</div>
            <span className="text-[11px] text-slate-500 font-medium">Total Washes</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-emerald-600">99.2%</div>
            <span className="text-[11px] text-slate-500 font-medium">Completion Rate</span>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="text-2xl font-extrabold text-blue-600">34</div>
            <span className="text-[11px] text-slate-500 font-medium">Active Daily Cars</span>
          </div>
        </div>

        {/* Bank & Payout Settings */}
        <div className="premium-card p-5 bg-white border-slate-200/90 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Bank Settlement Account
          </span>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-bold text-slate-900">HDFC Bank Limited</div>
                <div className="text-slate-500">Account ending in •••• {washerEarnings.bank_account_last4}</div>
              </div>
            </div>
            <span className="text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded text-[10px]">
              Verified
            </span>
          </div>
        </div>

        {/* Quick Operational Links */}
        <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 overflow-hidden text-xs font-semibold">
          <Link
            href="/washer/leave"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" /> Request Leave & Assign Backup
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            href="/washer/earnings"
            className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2 text-slate-700">
              <Landmark className="w-4 h-4 text-slate-400" /> Payout History & Tax Summaries
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={() => setRole('owner')}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Switch to Vehicle Owner Mode →
          </button>
        </div>
      </div>

      <WasherBottomNav />
    </div>
  );
}
