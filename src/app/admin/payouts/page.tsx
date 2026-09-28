'use client';

import React from 'react';
import { Wallet, Landmark, CheckCircle2, Download } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPayoutsPage() {
  const payouts = [
    { washer: 'Amit Kumar', bank: 'HDFC (•••• 4821)', amount: '₹2,840', fee: '₹10', status: 'Completed', date: '20 Sep 2026' },
    { washer: 'Rahul Sharma', bank: 'ICICI (•••• 9912)', amount: '₹2,680', fee: '₹10', status: 'Completed', date: '20 Sep 2026' },
    { washer: 'Suresh Verma', bank: 'SBI (•••• 3301)', amount: '₹3,100', fee: '₹10', status: 'Completed', date: '20 Sep 2026' },
    { washer: 'Vijay Pal', bank: 'Axis (•••• 7811)', amount: '₹2,140', fee: '₹10', status: 'Completed', date: '20 Sep 2026' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Treasury & Settlements
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Washer Disbursements
            </h1>
          </div>
          <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
            Approve Weekly Batch
          </button>
        </div>

        <div className="premium-card bg-white border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {payouts.map((p, i) => (
            <div key={i} className="p-5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">{p.washer}</div>
                  <div className="text-slate-500">{p.bank} • {p.date}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-extrabold text-emerald-700 text-sm">{p.amount}</div>
                <div className="text-[10px] text-slate-400">IMPS Net (Fee {p.fee})</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
