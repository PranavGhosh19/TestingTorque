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
      <div className="bg-[#11161D]/95 backdrop-blur-xl text-white rounded-[20px] p-3 shadow-2xl border border-white/[0.08] max-w-xs transition-all">
        {/* Toggle Bar */}
        <div className="flex items-center justify-between gap-3 px-1 mb-1">
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
            <span>ROLE CONTROLS</span>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/40 hover:text-white transition-colors p-0.5"
            title="Collapse / Expand"
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!collapsed && (
          <div className="space-y-2.5 mt-2 pt-2 border-t border-white/[0.08]">
            {/* Role selector pills */}
            <div className="grid grid-cols-3 gap-1 bg-[#161C25] p-1 rounded-full border border-white/[0.08]">
              <button
                onClick={() => handleSelectRole('owner')}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-full text-[11px] font-medium transition-all ${
                  role === 'owner'
                    ? 'bg-white text-[#0A0D12] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5 mb-0.5" />
                <span>Owner</span>
              </button>

              <button
                onClick={() => handleSelectRole('washer')}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-full text-[11px] font-medium transition-all ${
                  role === 'washer'
                    ? 'bg-white text-[#0A0D12] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 mb-0.5" />
                <span>Washer</span>
              </button>

              <button
                onClick={() => handleSelectRole('admin')}
                className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-full text-[11px] font-medium transition-all ${
                  role === 'admin'
                    ? 'bg-white text-[#0A0D12] font-bold shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 mb-0.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Offline Simulation toggle for Washer PWA */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#161C25] rounded-xl border border-white/[0.06] text-xs">
              <div className="flex items-center gap-2">
                {isOffline ? (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 text-[#2DD4A0]" />
                )}
                <span className="text-[11px] text-white/70">
                  {isOffline ? 'Offline Mode (PWA)' : 'Online Sync'}
                </span>
              </div>
              <button
                onClick={toggleOffline}
                className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider transition-colors ${
                  isOffline
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {isOffline ? 'Go Online' : 'Simulate Cut'}
              </button>
            </div>

            {/* Offline Queue sync button if items queued */}
            {offlineQueueCount > 0 && (
              <button
                onClick={syncOfflineQueue}
                className="w-full py-2 px-3 rounded-full bg-[#2DD4A0] hover:bg-[#25b88a] text-[#0A0D12] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sync {offlineQueueCount} Offline Washes</span>
              </button>
            )}

            {/* Link to public website if currently in app */}
            <div className="text-center pt-1">
              <Link
                href="/"
                className="text-[10px] text-white/50 hover:text-white transition-colors"
              >
                View Public Landing Page →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
