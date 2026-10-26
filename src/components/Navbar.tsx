'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarCheck, UserCheck, Car, CheckCircle2, User, Settings, LayoutDashboard } from 'lucide-react';
import { useStore } from '@/lib/store';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function Navbar() {
  const pathname = usePathname();
  const { role, notifications } = useStore();

  // Auth and role selection pages have their own dedicated centered navigation
  if (pathname.startsWith('/auth')) {
    return null;
  }

  const isAppRoute =
    (pathname.startsWith('/owner') && pathname !== '/owner/login') ||
    (pathname.startsWith('/washer') && !pathname.startsWith('/washer/login')) ||
    (pathname.startsWith('/admin') && pathname !== '/admin/login');

  const hideOnMobile = pathname === '/owner/dashboard' ? false : isAppRoute;

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/car-wash-payment-calculator') ||
    pathname.startsWith('/car-wash-tracking') ||
    pathname.startsWith('/car-wash-tracking-template') ||
    pathname.startsWith('/guides') ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/washer/login') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/owner/login');

  const isOwnerPortal =
    pathname.startsWith('/owner') &&
    pathname !== '/owner/login';

  const isWasherPortal =
    pathname.startsWith('/washer') &&
    !pathname.startsWith('/washer/login');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isOwnerDashboard = pathname === '/owner/dashboard';

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#080D1A]/95 backdrop-blur-xl border-b border-white/10 transition-colors pt-[max(env(safe-area-inset-top),1rem)] md:pt-0 ${
        hideOnMobile ? 'hidden md:block' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between relative">
        {/* Brand Logo - Performance Shield Emblem & Spec-sheet Wordmark */}
        <Link
          href={isOwnerPortal ? '/owner/dashboard' : '/'}
          className={`flex items-center group transition-transform hover:opacity-95 shrink-0 ${
            isOwnerDashboard
              ? 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10'
              : ''
          }`}
        >
          <TorqueLogo emblemSize={36} />
        </Link>

        {/* Center Nav: Owner Portal Desktop Nav (Dashboard, Vehicles, Profile) */}
        {isOwnerPortal && !isOwnerDashboard ? (
          <nav className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href="/owner/dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname === '/owner/dashboard'
                  ? 'bg-[#2DD4A0] text-slate-950 shadow-md shadow-[#2DD4A0]/25 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/owner/vehicles"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname.startsWith('/owner/vehicles')
                  ? 'bg-[#2DD4A0] text-slate-950 shadow-md shadow-[#2DD4A0]/25 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vehicles</span>
            </Link>

            <Link
              href="/owner/profile"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname.startsWith('/owner/profile')
                  ? 'bg-[#2DD4A0] text-slate-950 shadow-md shadow-[#2DD4A0]/25 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>
          </nav>
        ) : isWasherPortal ? (
          <nav className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href="/washer/dashboard"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname === '/washer/dashboard' || pathname === '/washer/route'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Today</span>
            </Link>

            <Link
              href="/washer/profile"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname === '/washer/profile'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Profile</span>
            </Link>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] p-1 rounded-2xl backdrop-blur-xl shadow-lg md:absolute md:left-1/2 md:-translate-x-1/2">
            <Link
              href="/car-wash-payment-calculator"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname === '/car-wash-payment-calculator'
                  ? 'bg-[#2DD4A0] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Calculator
            </Link>
            <Link
              href="/car-wash-tracking"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname === '/car-wash-tracking'
                  ? 'bg-[#2DD4A0] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Tracking
            </Link>
            <Link
              href="/guides"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname.startsWith('/guides')
                  ? 'bg-[#2DD4A0] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Guides
            </Link>
            <Link
              href="/pricing"
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                pathname === '/pricing'
                  ? 'bg-[#2DD4A0] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Pricing
            </Link>
          </nav>
        )}

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          {isPublicPage ? (
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] text-xs font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            >
              <span>Track Your Car</span>
            </Link>
          ) : isOwnerPortal ? (
            <div className="flex items-center gap-3">
              {isOwnerDashboard && (
                <Link
                  href="/owner/vehicles"
                  className="flex items-center gap-2 p-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 hover:text-white transition-colors"
                >
                  <Car className="w-4 h-4 text-[#2DD4A0]" />
                  <span>Vehicles</span>
                </Link>
              )}
              <Link
                href="/owner/profile"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-[#2DD4A0]/50 bg-[#2DD4A0]/10 flex items-center justify-center text-[#2DD4A0]">
                  <User className="w-4 h-4" />
                </div>
                <span>Profile</span>
              </Link>
            </div>
          ) : isWasherPortal ? (
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Route Active
              </span>
              <Link
                href="/washer/profile"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-400/50 bg-emerald-950/40 relative">
                  <img
                    src="/images/washer_amit.jpg"
                    alt="Partner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>Partner</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {role === 'washer' && (
                <Link
                  href="/washer/notifications"
                  className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </Link>
              )}
              <Link
                href={`/${role}/dashboard`}
                className="text-xs font-bold text-[#080D1A] bg-white px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
              >
                Go to {role.toUpperCase()} App
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
