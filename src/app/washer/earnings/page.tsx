'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  IndianRupee,
  Landmark,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Gift,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import WasherWithdrawModal from '@/components/modals/WasherWithdrawModal';

export default function WasherEarningsPage() {
  const { washerEarnings } = useStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Fintech Wallet & Payouts
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              Partner Earnings
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Landmark className="w-3.5 h-3.5 text-blue-600" />
            HDFC •••• {washerEarnings.bank_account_last4}
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TOTAL & WEEKLY EARNINGS CARD (Section 18) */}
        <div className="premium-card p-6 sm:p-8 bg-[#0B132B] text-white rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Earnings
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                ₹{washerEarnings.total_earnings.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-right sm:text-left">
              <span className="text-[11px] text-slate-300 font-medium block">
                Earned This Week
              </span>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5">
                ₹{washerEarnings.this_week.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Available vs Pending Breakdown */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                Available to Withdraw
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                ₹{washerEarnings.available.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Instant IMPS ready</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                Pending Settlement
              </span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                ₹{washerEarnings.pending.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Settles at midnight</span>
            </div>
          </div>

          {/* Withdraw Now CTA */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={washerEarnings.available <= 0}
            className="w-full py-4 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
          >
            <span>[ Withdraw ₹{washerEarnings.available.toLocaleString()} Now ]</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SUNDAY BONUS POLICY BANNER */}
        <div className="p-4 sm:p-5 bg-linear-to-r from-rose-500/10 via-amber-500/10 to-rose-500/5 rounded-2xl border border-rose-300/80 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-950 flex items-center gap-1.5 flex-wrap">
                <span>Sunday Bonus Guarantee</span>
                <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200 uppercase font-mono font-bold">100% Payout to Washers</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Now a bonus payment for Washers: All Sunday payments are for Washers. Torque Care charges 0% platform commission on Sundays.
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-rose-700 shrink-0 hidden sm:block">
            +100% Retained
          </span>
        </div>

        {/* RECENT PAYOUT HISTORY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Recent Bank Disbursements</span>
            <span>Zero Late Payouts</span>
          </div>

          <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {washerEarnings.recent_payouts.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0B132B]">
                      IMPS Transfer to Bank •••• {p.bank_last4}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {p.date} • Processing Fee: ₹{p.fee}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-emerald-700">
                    +₹{p.net.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Processed ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banking Assurance Note */}
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span>
            Payouts are routed through direct automated clearing. Flat ₹10 processing fee per on-demand withdrawal. Weekly Monday auto-transfers are 100% free.
          </span>
        </div>
      </div>

      <WasherWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />

      <WasherBottomNav />
    </div>
  );
}
