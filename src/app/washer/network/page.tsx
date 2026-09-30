'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Star, ArrowLeft, ShieldCheck, Phone, ChevronRight } from 'lucide-react';
import WasherBottomNav from '@/components/WasherBottomNav';

export default function WasherNetworkPage() {
  const peers = [
    { name: 'Rahul Sharma', rating: '4.8', washes: '980', cars: '33', status: 'Active on Route', phone: '+91 98111 22334' },
    { name: 'Suresh Verma', rating: '4.9', washes: '1,420', cars: '33', status: 'Active on Route', phone: '+91 98222 33445' },
    { name: 'Vijay Pal', rating: '4.7', washes: '810', cars: '28', status: 'Available', phone: '+91 98333 44556' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <header className="bg-white border-b border-slate-200/80 pt-4 md:pt-0 pt-[max(env(safe-area-inset-top),1rem)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link
            href="/washer/dashboard"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-base font-extrabold text-[#0B132B]">
              Society Partner Cluster
            </h1>
            <span className="text-[11px] text-slate-500">
              Green Valley Residency Network (4 Washers)
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            Your local cluster is fully staffed today. Backup requests are auto-synchronized between your shared schedules.
          </span>
        </div>

        <div className="space-y-3">
          {peers.map((p, i) => (
            <div
              key={i}
              className="premium-card p-4 sm:p-5 bg-white border-slate-200/90 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-extrabold text-xs text-slate-700">
                  {p.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0B132B]">{p.name}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" /> {p.rating}
                    </span>
                    <span>•</span>
                    <span>{p.cars} assigned cars</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <WasherBottomNav />
    </div>
  );
}
