'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, AlertTriangle, Sparkles, Shield, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import OwnerBottomNav from '@/components/OwnerBottomNav';

export default function OwnerNotificationsPage() {
  const { notifications, markNotificationRead } = useStore();

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-24 md:pb-12">
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Activity Alerts
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B132B] tracking-tight">
              Notifications
            </h1>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {notifications.length} updates
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => markNotificationRead(n.id)}
            className={`premium-card p-4 sm:p-5 bg-white border-slate-200/90 shadow-xs flex items-start justify-between gap-4 transition-all cursor-pointer ${
              !n.read ? 'border-l-4 border-l-blue-600' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  n.category === 'wash'
                    ? 'bg-emerald-50 text-emerald-600'
                    : n.category === 'sunday'
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-blue-50 text-blue-600'
                }`}
              >
                {n.category === 'wash' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : n.category === 'sunday' ? (
                  <Sparkles className="w-5 h-5" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#0B132B]">
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {n.body}
                </p>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">
                  {n.timestamp}
                </span>
              </div>
            </div>

            {n.action_url && (
              <Link
                href={n.action_url}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 p-2 shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ))}
      </div>

      <OwnerBottomNav />
    </div>
  );
}
