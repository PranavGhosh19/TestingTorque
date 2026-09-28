'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, Navigation, Wallet, ListChecks, UserCheck } from 'lucide-react';

export default function WasherBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/washer/dashboard', label: 'Today', icon: CalendarCheck },
    { href: '/washer/route', label: 'Routes', icon: Navigation },
    { href: '/washer/earnings', label: 'Earnings', icon: Wallet },
    { href: '/washer/jobs', label: 'Jobs', icon: ListChecks },
    { href: '/washer/profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 md:hidden">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-emerald-800' : 'font-medium'
                }`}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
