'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Shield, Car, Sparkles, Cpu, Wifi, WifiOff, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

export default function RoleSwitcher() {
  const { role, setRole, isOffline, toggleOffline, offlineQueueCount, syncOfflineQueue } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleSelectRole = (newRole: 'owner' | 'washer' | 'admin') => {
    setRole(newRole);
    if (newRole === 'owner') router.push('/owner/dashboard');
    else if (newRole === 'washer') router.push('/washer/dashboard');
    else if (newRole === 'admin') router.push('/admin/dashboard');
  };

  return (
    <div className="fixed bottom-20 sm:bottom-4 right-4 z-50 select-none">
      <div className="glass-dark text-white rounded-2xl p-2.5 shadow-2xl border border-white/15 max-w-xs transition-all">
        {/* Toggle Bar */}
        <div className="flex items-center justify-between gap-3 px-1 mb-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ROLE & TEST CONTROLS</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white transition-colors p-0.5"
            title="Collapse / Expand"
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-2 mt-2 pt-2 border-t border-white/10">
            {/* Role selector pills */}
            <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl">
              <button
                onClick={() => handleSelectRole('owner')}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                  role === 'owner'
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Car className="w-3.5 h-3.5 mb-0.5" />
                <span>Owner</span>
              </button>

              <button
                onClick={() => handleSelectRole('washer')}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                  role === 'washer'
                    ? 'bg-emerald-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mb-0.5" />
                <span>Washer</span>
              </button>

              <button
                onClick={() => handleSelectRole('admin')}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-amber-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 mb-0.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Offline Simulation toggle for Washer PWA */}
            <div className="flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-[11px] text-slate-200">
                  {isOffline ? 'Offline Mode (PWA)' : 'Online'}
                </span>
              </div>
              <button
                onClick={toggleOffline}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                  isOffline
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {isOffline ? 'Go Online' : 'Simulate Cut'}
              </button>
            </div>

            {/* Offline Queue sync button if items queued */}
            {offlineQueueCount > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sync {offlineQueueCount} Offline Washes</span>
              </button>
            )}

            {/* Link to public website if currently in app */}
            <div className="text-center pt-1">
              <Link
                href="/"
                className="text-[10px] text-slate-400 hover:text-slate-200 underline decoration-slate-600"
              >
                View Public Marketing Site →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
