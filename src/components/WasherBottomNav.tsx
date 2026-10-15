'use client';

import React from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import { CalendarCheck, UserCheck } from 'lucide-react';
import NextLink from 'next/link';

export default function WasherBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/washer/dashboard', label: 'Today', icon: CalendarCheck },
    { href: '/washer/profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D12]/95 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 md:hidden">
      <div className="grid grid-cols-2 max-w-sm mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <NextLink
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-[#2DD4A0]/10 text-[#2DD4A0] border border-[#2DD4A0]/30 shadow-[0_0_15px_rgba(45,212,160,0.2)]' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-white' : 'font-medium'
                }`}
              >
                {link.label}
              </span>
            </NextLink>
          );
        })}
      </div>
    </nav>
  );
}
