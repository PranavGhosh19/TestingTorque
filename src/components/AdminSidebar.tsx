'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
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
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { href: '/admin/dashboard', label: 'Overview Dashboard', icon: Activity },
        { href: '/admin/operations', label: 'Live Operations', icon: Layers },
        { href: '/admin/substitutions', label: 'Substitutions & Leaves', icon: RefreshCw },
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
        { href: '/admin/washers', label: 'Washer Network', icon: Sparkles },
        { href: '/admin/payouts', label: 'Disbursements', icon: Wallet },
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
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-5 h-5 fill-white/20" />
        </div>
        <div>
          <div className="text-base font-extrabold tracking-tight">
            Torque<span className="text-blue-400">Care</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
            Operations Portal
          </span>
        </div>
      </div>

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
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / Ops Status */}
      <div className="p-4 border-t border-white/10 text-xs text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Cluster Node: Delhi-NCR
          </span>
        </div>
        <div className="text-[10px] text-slate-500">v2.4 Production Engine</div>
      </div>
    </aside>
  );
}
