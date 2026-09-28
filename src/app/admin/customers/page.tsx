'use client';

import React from 'react';
import { Users, Car, MapPin, CheckCircle2, Search } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useStore } from '@/lib/store';

export default function AdminCustomersPage() {
  const { vehicles } = useStore();

  const customerList = [
    {
      name: 'Pranav Ghosh',
      phone: '+91 98765 43210',
      society: 'Green Valley Residency',
      flat: 'Tower B • 402',
      vehicles: 'Honda City (DL 01 AB 4291), Creta (KA 01 HY 4567)',
      status: 'Active',
      plan: 'Standard Plan',
    },
    {
      name: 'Ananya Sharma',
      phone: '+91 98111 22334',
      society: 'Green Valley Residency',
      flat: 'Tower B • 108',
      vehicles: 'Hyundai Creta (DL 04 EF 2281)',
      status: 'Active',
      plan: 'Standard Plan',
    },
    {
      name: 'Vikram Mehta',
      phone: '+91 99223 34455',
      society: 'Green Valley Residency',
      flat: 'Tower B • 304',
      vehicles: 'Maruti Swift (DL 09 PQ 9821)',
      status: 'Active',
      plan: 'Basic Plan',
    },
    {
      name: 'Col. Rajesh Singh',
      phone: '+91 97112 33445',
      society: 'Green Valley Residency',
      flat: 'Tower C • 1201',
      vehicles: 'Toyota Fortuner (UP 16 AX 8800)',
      status: 'Active',
      plan: 'Premium Plan',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Customer Registry
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
              Vehicle Owners
            </h1>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            8,421 Active Subscriptions
          </span>
        </div>

        <div className="premium-card bg-white border-slate-200/90 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Owner Name</th>
                <th className="p-4">Society & Residence</th>
                <th className="p-4">Vehicles</th>
                <th className="p-4">Plan</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerList.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 text-sm">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{c.society}</div>
                    <div className="text-[11px] text-slate-500">{c.flat}</div>
                  </td>
                  <td className="p-4 font-mono text-slate-700">{c.vehicles}</td>
                  <td className="p-4 font-semibold text-blue-700">{c.plan}</td>
                  <td className="p-4 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
