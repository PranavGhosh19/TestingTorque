'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, CheckCircle2, IndianRupee, User, Compass } from 'lucide-react';

export default function OwnerBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/owner/dashboard', label: 'Home', icon: Home },
    { href: '/owner/travel', label: 'Away', icon: Compass },
    { href: '/owner/vehicles', label: 'Vehicles', icon: Car },
    { href: '/owner/washes/history', label: 'Washes', icon: CheckCircle2 },
    { href: '/owner/payments', label: 'Payments', icon: IndianRupee },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#080D1A]/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 md:hidden">
      <div className="grid grid-cols-5 max-w-md mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 transition-all ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-black text-white' : 'font-medium'
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
