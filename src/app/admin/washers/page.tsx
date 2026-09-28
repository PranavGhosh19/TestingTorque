'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles, Star, ShieldCheck, Check, Clock, Plus, Phone } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminWashersPage() {
  const washers = [
    {
      id: 'wsh_amit',
      name: 'Amit Kumar',
      avatar: '/images/washer_amit.jpg',
      rating: '4.9',
      society: 'Green Valley Residency',
      assignedCars: 34,
      status: 'Active on Route',
      payoutDue: '₹1,940',
      kyc: 'Verified (Aadhaar & Police Clear)',
    },
    {
      id: 'wsh_rahul',
      name: 'Rahul Sharma',
      avatar: '/images/washer_amit.jpg',
      rating: '4.8',
      society: 'Green Valley Residency',
      assignedCars: 33,
      status: 'Active on Route',
      payoutDue: '₹2,100',
      kyc: 'Verified',
    },
    {
      id: 'wsh_suresh',
      name: 'Suresh Verma',
      avatar: '/images/washer_amit.jpg',
      rating: '4.9',
      society: 'Palm Residency',
      assignedCars: 33,
      status: 'Active on Route',
      payoutDue: '₹2,350',
      kyc: 'Verified',
    },
    {
      id: 'wsh_vijay',
      name: 'Vijay Pal',
      avatar: '/images/washer_amit.jpg',
      rating: '4.7',
      society: 'Sunrise Heights',
      assignedCars: 28,
      status: 'Available Backup',
      payoutDue: '₹1,200',
      kyc: 'Verified',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Partner Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Washer Network
            </h1>
          </div>
          <button className="px-4 py-2.5 rounded-xl bg-[#0B132B] hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Onboard New Partner</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {washers.map((w) => (
            <div
              key={w.id}
              className="premium-card p-6 bg-white border-slate-200/90 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200">
                    <Image
                      src={w.avatar}
                      alt={w.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#0B132B]">{w.name}</h2>
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500" /> {w.rating} Rating
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {w.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Society:</span>
                  <span className="font-semibold text-slate-900">{w.society}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Fleet:</span>
                  <span className="font-semibold text-slate-900">{w.assignedCars} Vehicles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">KYC Status:</span>
                  <span className="text-emerald-700 font-semibold">{w.kyc}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-slate-200/60">
                  <span>Pending Payout:</span>
                  <span className="text-[#0B132B]">{w.payoutDue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
