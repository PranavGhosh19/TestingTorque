'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Car, IndianRupee, Info } from 'lucide-react';

export default function PublicBottomNav() {
  const pathname = usePathname();

  // Show only on public marketing pages (landing, how-it-works, for-owners, pricing, about)
  const isPublicMarketingPage =
    pathname === '/' ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/for-owners') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about');

  if (!isPublicMarketingPage) return null;

  const links = [
    {
      href: '/how-it-works',
      label: 'How it works',
      icon: Sparkles,
    },
    {
      href: '/for-owners',
      label: 'Car Owners',
      icon: Car,
    },
    {
      href: '/pricing',
      label: 'Pricing',
      icon: IndianRupee,
    },
    {
      href: '/about',
      label: 'About',
      icon: Info,
    },
  ];

  return (
    <nav
      aria-label="Public bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#080D1A]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] md:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.6)]"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto items-center">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

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
                    ? 'bg-[#2DD4A0]/15 text-[#2DD4A0] border border-[#2DD4A0]/30 shadow-[0_0_12px_rgba(45,212,160,0.25)]'
                    : 'text-slate-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight text-center leading-none ${
                  isActive ? 'font-bold text-[#2DD4A0]' : 'font-medium text-slate-400'
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
