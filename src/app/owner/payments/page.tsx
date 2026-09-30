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
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center gap-3 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-xs tracking-wider text-slate-400 font-mono uppercase">Authenticating...</p>
      </div>
    );
  }
  const transactions = [
    {
      id: 'txn_01',
      date: '01 Sep 2026',
      description: 'Monthly Standard Wash Subscription — Honda City (DL 01 AB 4291)',
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
      description: 'Monthly Standard Wash Subscription — Honda City',
      amount: '₹499',
      status: 'Paid',
      method: 'HDFC Credit Card (•••• 1092)',
      invoice: 'INV-2026-0801',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Billing & Invoices
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              Payments
            </h1>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Auto-Pay Active
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Active Plan Card */}
        <div className="premium-card p-6 bg-white border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Current Plan
            </span>
            <h2 className="text-xl font-extrabold text-[#0B132B] mt-1">
              Standard Plan (₹499 / mo)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Next billing date: 01 October 2026 • Renews automatically
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0B132B] text-xs font-bold transition-colors text-center"
          >
            Change Plan
          </Link>
        </div>

        {/* Transaction History */}
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
            Recent Invoices & Receipts
          </span>

          <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 shadow-xs overflow-hidden">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0B132B]">
                      {t.description}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t.date} • {t.method}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-extrabold text-[#0B132B]">
                    {t.amount}
                  </div>
                  <span className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center justify-end gap-1 cursor-pointer mt-0.5">
                    <Download className="w-3 h-3" /> PDF
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OwnerBottomNav />
    </div>
  );
}
