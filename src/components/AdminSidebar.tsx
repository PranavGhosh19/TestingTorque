'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Layers,
  Users,
  Car,
  CreditCard,
  Building2,
  AlertTriangle,
  Wallet,
  Settings,
  BarChart3,
  RefreshCw,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, role, washers } = useStore();

  const myWashersCount = washers.filter((w) => w.id !== 'wsh_amit').length;

  if (role === 'washer') {
    return (
      <aside className="w-64 bg-[#0B132B] text-white shrink-0 hidden lg:flex flex-col border-r border-white/10 min-h-screen p-6 justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">
                Torque<span className="text-blue-400">Care</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                Access Restricted
              </span>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <p className="font-bold">Washer Role Active</p>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              Washers do not have control over washers or operations. Please use your washer route portal.
            </p>
            <Link
              href="/washer/dashboard"
              className="inline-block mt-2 px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors"
            >
              Go to Washer Route
            </Link>
          </div>
        </div>
      </aside>
    );
  }

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { href: '/admin/dashboard', label: 'Overview Dashboard', icon: Activity },
        { href: '/admin/operations', label: 'Live Operations', icon: Layers },
        { href: '/admin/complaints', label: 'Exceptions & Issues', icon: AlertTriangle },
      ],
    },
    {
      title: 'Customers',
      items: [
        { href: '/admin/customers', label: 'Owners & Vehicles', icon: Users },
      ],
    },
    {
      title: 'Washers',
      items: [
        {
          href: '/admin/washers',
          label: 'Washer Network',
          icon: Sparkles,
          badge: `${myWashersCount} Active`,
        },
      ],
    },
    {
      title: 'Societies',
      items: [
        { href: '/admin/societies', label: 'Societies & Capacity', icon: Building2 },
      ],
    },
    {
      title: 'Platform',
      items: [
        { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#0B132B] text-white shrink-0 hidden lg:flex flex-col border-r border-white/10 min-h-screen">
      {/* Nav Items */}
      <div className="flex-1 p-4 overflow-y-auto space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block">
              {group.title}
            </span>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const badge = (item as any).badge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {badge && (
                    <span className="text-[9px] font-mono font-bold bg-white/10 px-1.5 py-0.5 rounded-md text-emerald-300 border border-white/10">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}
