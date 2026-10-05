'use client';

import React, { useState, useEffect } from 'react';
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
import { fetchWasherDashboardDataFromFirestore } from '@/lib/firebaseService';

export default function WasherEarningsPage() {
  const { user, washerEarnings, setWasherEarnings } = useStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveEarnings() {
      try {
        const storedId = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_id') : null;
        const storedPhone = typeof window !== 'undefined' ? localStorage.getItem('torque_washer_phone') : null;
        const queryId = (user?.role === 'washer' && user?.id && user.id !== 'usr_guest') ? user.id : (storedId || undefined);
        const queryPhone = user?.phone || storedPhone || undefined;
        const data = await fetchWasherDashboardDataFromFirestore(queryId, queryPhone);
        if (isMounted && data.earnings) {
          setWasherEarnings({
            available: data.earnings.available,
            this_week: data.earnings.this_week,
            total_earnings: data.earnings.total_earnings,
            pending: data.earnings.pending,
            bank_account_last4: (data.earnings.bank_account || '').slice(-4) || '••••',
            recent_payouts: [],
          });
        }
      } catch (err) {
        console.warn('Could not sync earnings from Firestore:', err);
      }
    }
    loadLiveEarnings();
    return () => { isMounted = false; };
  }, [user?.id, user?.phone, setWasherEarnings]);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black pb-28 md:pb-16 font-sans">
      {/* Header */}
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
              Fintech Wallet & Payouts
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Partner Earnings
            </h1>
          </div>
          <span className="text-xs font-mono font-bold text-white/80 bg-[#161C25] border border-white/[0.08] px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-[#2DD4A0]" />
            HDFC •••• {washerEarnings.bank_account_last4}
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* TOTAL & WEEKLY EARNINGS CARD */}
        <div className="p-6 sm:p-8 bg-[#11161D] border border-white/[0.08] rounded-[20px] space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">
                Total Net Payouts Earned
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white mt-1">
                ₹{washerEarnings.total_earnings.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 bg-[#161C25] rounded-xl border border-white/[0.06] text-left sm:text-right">
              <span className="text-[11px] font-mono text-white/50 uppercase block">
                Earned This Week
              </span>
              <div className="text-xl font-mono font-bold text-[#2DD4A0] mt-0.5">
                ₹{washerEarnings.this_week.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Available vs Pending Breakdown */}
          <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-white/50 block uppercase tracking-wider">
                Available to Withdraw
              </span>
              <div className="text-2xl font-mono font-bold text-[#2DD4A0] mt-1">
                ₹{washerEarnings.available.toLocaleString()}
              </div>
              <span className="text-[10px] font-mono text-white/40">Instant IMPS ready</span>
            </div>

            <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06]">
              <span className="text-[10px] font-mono text-white/50 block uppercase tracking-wider">
                Pending Settlement
              </span>
              <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                ₹{washerEarnings.pending.toLocaleString()}
              </div>
              <span className="text-[10px] font-mono text-white/40">Settles at midnight</span>
            </div>
          </div>

          {/* Withdraw Now CTA */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={washerEarnings.available <= 0}
            className="w-full py-4 px-4 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] disabled:opacity-40 text-[#0A0D12] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <span>Withdraw ₹{washerEarnings.available.toLocaleString()} Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SUNDAY BONUS POLICY BANNER */}
        <div className="p-5 bg-[#11161D] rounded-[20px] border border-[#2DD4A0]/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#2DD4A0]/10 text-[#2DD4A0] border border-[#2DD4A0]/20 flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                <span>Sunday Bonus Guarantee</span>
                <span className="text-[10px] bg-[#2DD4A0]/10 text-[#2DD4A0] px-2 py-0.5 rounded-full border border-[#2DD4A0]/20 font-mono font-bold uppercase">
                  100% Retained by Specialist
                </span>
              </div>
              <p className="text-[11px] text-white/60 mt-0.5">
                All Sunday priority fees go 100% directly to you. 0% platform take rate.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-[#2DD4A0] shrink-0 hidden sm:block">
            +100% Direct Payout
          </span>
        </div>

        {/* RECENT PAYOUT HISTORY */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-white/50 px-1">
            <span>Recent Bank Disbursements</span>
            <span className="text-[#2DD4A0]">Zero Delay IMPS</span>
          </div>

          <div className="rounded-[20px] bg-[#11161D] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
            {washerEarnings.recent_payouts.map((p) => (
              <div key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 text-[#2DD4A0] border border-[#2DD4A0]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      IMPS Direct Transfer •••• {p.bank_last4}
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5 font-mono">
                      {p.date} • Processing Fee: ₹{p.fee}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-[#2DD4A0]">
                    +₹{p.net.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-mono text-white/50">
                    Processed ✓
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banking Assurance Note */}
        <div className="p-4 bg-[#11161D] rounded-[20px] border border-white/[0.08] text-xs text-white/60 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#2DD4A0] shrink-0" />
          <span>
            Payouts are routed through direct automated clearing. Flat ₹10 processing fee per on-demand withdrawal. Weekly Monday transfers are 100% free.
          </span>
        </div>
      </main>

      <WasherWithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
      />

      <WasherBottomNav />
    </div>
  );
}
