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
    <div className="min-h-screen bg-[#080D1A] text-white selection:bg-emerald-500 selection:text-black pb-28 relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="bg-[#0B132B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
              Fintech Wallet & Payouts
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Partner Earnings
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-blue-400" />
            HDFC •••• {washerEarnings.bank_account_last4}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        {/* TOTAL & WEEKLY EARNINGS CARD */}
        <div className="p-6 sm:p-8 bg-[#0B132B] border border-emerald-500/20 text-white rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Earnings
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white mt-1 font-mono">
                ₹{washerEarnings.total_earnings.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 text-left sm:text-right">
              <span className="text-[11px] text-slate-400 font-medium block">
                Earned This Week
              </span>
              <div className="text-xl font-black text-emerald-400 mt-0.5 font-mono">
                ₹{washerEarnings.this_week.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Available vs Pending Breakdown */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                Available to Withdraw
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                ₹{washerEarnings.available.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Instant IMPS ready</span>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                Pending Settlement
              </span>
              <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
                ₹{washerEarnings.pending.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Settles at midnight</span>
            </div>
          </div>

          {/* Withdraw Now CTA */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={washerEarnings.available <= 0}
            className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Withdraw ₹{washerEarnings.available.toLocaleString()} Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SUNDAY BONUS POLICY BANNER */}
        <div className="p-5 bg-linear-to-r from-rose-950/40 via-amber-950/20 to-rose-950/30 rounded-3xl border border-rose-500/30 flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-rose-200 flex items-center gap-1.5 flex-wrap">
                <span>Sunday Bonus Guarantee</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30 uppercase font-mono font-bold">100% Payout to Washers</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                All Sunday wash payments go 100% directly to washers with 0% platform commission deducted.
              </p>
            </div>
          </div>
          <span className="text-xs font-black text-rose-400 shrink-0 hidden sm:block font-mono">
            +100% Retained
          </span>
        </div>

        {/* RECENT PAYOUT HISTORY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
            <span>Recent Bank Disbursements</span>
            <span className="text-emerald-400">Zero Late Payouts</span>
          </div>

          <div className="rounded-3xl bg-[#0B132B] border border-white/10 divide-y divide-white/10 shadow-xl overflow-hidden">
            {washerEarnings.recent_payouts.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-400/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      IMPS Transfer to Bank •••• {p.bank_last4}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {p.date} • Processing Fee: ₹{p.fee}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black text-emerald-400 font-mono">
                    +₹{p.net.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    Processed ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banking Assurance Note */}
        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
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
