'use client';

import React from 'react';
import { Settings, Shield, Bell, Key, Database } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminSettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B132B] tracking-tight">
            System Settings
          </h1>
        </div>

        <div className="premium-card bg-white p-6 border-slate-200/90 shadow-xs space-y-6 max-w-2xl">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-[#0B132B]">
              Integrations & Operational Thresholds
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
                <div>
                  <div className="font-bold text-slate-800">Razorpay Auto-Debit Webhook</div>
                  <div className="text-slate-500">Live webhook endpoint connected</div>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">Connected</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
                <div>
                  <div className="font-bold text-slate-800">Society Cluster Boundary</div>
                  <div className="text-slate-500">Basement parking zone radius</div>
                </div>
                <span className="font-bold text-slate-900">Active</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-200/80">
                <div>
                  <div className="font-bold text-slate-800">Sunday Priority Surcharge</div>
                  <div className="text-slate-500">Default rate passed to washer</div>
                </div>
                <span className="font-bold text-slate-900">₹50 (100% partner share)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
