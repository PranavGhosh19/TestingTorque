'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { IndianRupee, ShieldCheck, Download, CreditCard, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerPaymentsPage() {
  const router = useRouter();
  const { isLoggedIn, isHydrated } = useStore();

  useEffect(() => {
    if (isHydrated && !isLoggedIn) {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, router]);

  if (!isHydrated || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#2DD4A0]" />
        <p className="text-xs tracking-widest text-white/50 font-mono uppercase">Authenticating...</p>
      </div>
    );
  }
  const transactions = [
    {
      id: 'txn_01',
      date: '01 Sep 2026',
      description: 'Monthly Verified Wash Subscription — Honda City (DL 01 AB 4291)',
      amount: '₹499',
      status: 'Paid',
      method: 'Razorpay UPI (pranav@okhdfc)',
      invoice: 'INV-2026-0901',
    },
    {
      id: 'txn_02',
      date: '22 Sep 2026',
      description: 'Sunday Priority Wash Addon — Amit Kumar Assigned',
      amount: '₹50',
      status: 'Paid',
      method: 'Razorpay UPI (pranav@okhdfc)',
      invoice: 'INV-2026-0922',
    },
    {
      id: 'txn_03',
      date: '01 Aug 2026',
      description: 'Monthly Verified Wash Subscription — Honda City',
      amount: '₹499',
      status: 'Paid',
      method: 'HDFC Credit Card (•••• 1092)',
      invoice: 'INV-2026-0801',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white pb-28 md:pb-16 selection:bg-[#2DD4A0] selection:text-black">
      <header className="bg-[#0A0D12]/90 backdrop-blur-xl border-b border-white/[0.08] pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
              Billing & Auto-Settlements
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Invoices & Payments
            </h1>
          </div>
          <span className="text-xs font-mono font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 px-3 py-1.5 rounded-full border border-[#2DD4A0]/20 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Auto-Pay Active
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Active Plan Card */}
        <div className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#2DD4A0] bg-[#2DD4A0]/10 px-2.5 py-0.5 rounded-full border border-[#2DD4A0]/20">
              Current Plan
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Torque Care Residence (₹499 / mo)
            </h2>
            <p className="text-xs text-white/60 mt-0.5 font-mono">
              Next billing: 01 October 2026 • Razorpay recurring mandate active
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-5 py-2.5 rounded-full bg-[#161C25] hover:bg-white/10 border border-white/[0.08] text-white text-xs font-mono uppercase tracking-wider transition-colors text-center"
          >
            Change Plan
          </Link>
        </div>

        {/* Transaction History */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 block px-1">
            Recent Tax Invoices & Receipts
          </span>

          <div className="bg-[#11161D] rounded-[20px] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 text-[#2DD4A0] border border-[#2DD4A0]/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {t.description}
                    </div>
                    <div className="text-[11px] text-white/50 mt-0.5 font-mono">
                      {t.date} • {t.method}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-white">
                    {t.amount}
                  </div>
                  <span className="text-[10px] font-mono text-[#2DD4A0] hover:underline flex items-center justify-end gap-1 cursor-pointer mt-0.5">
                    <Download className="w-3 h-3" /> PDF
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <OwnerBottomNav />
    </div>
  );
}
