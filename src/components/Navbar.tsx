'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Bell, CalendarCheck, Wallet, UserCheck, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { role, notifications } = useStore();

  const isAppRoute =
    (pathname.startsWith('/owner') && pathname !== '/owner/login') ||
    (pathname.startsWith('/washer') && !pathname.startsWith('/washer/login') && !pathname.startsWith('/washer/auth')) ||
    (pathname.startsWith('/admin') && pathname !== '/admin/login');

  const hideOnMobile = isAppRoute;

  const isPublicPage =
    pathname === '/' ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/for-owners') ||
    pathname.startsWith('/for-washers') ||
    pathname.startsWith('/pricing') ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/contact') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/washer/login') ||
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/owner/login');

  const isWasherPortal =
    pathname.startsWith('/washer') &&
    !pathname.startsWith('/washer/login') &&
    !pathname.startsWith('/washer/auth');

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[#080D1A]/95 backdrop-blur-xl border-b border-white/10 transition-colors pt-[max(env(safe-area-inset-top),1rem)] md:pt-0 ${
        hideOnMobile ? 'hidden md:block' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo - Performance Shield Emblem & Spec-sheet Wordmark */}
        <Link href="/" className="flex items-center group transition-transform hover:opacity-95">
          <TorqueLogo emblemSize={36} />
        </Link>

        {/* Washer Portal Desktop Nav (Today, Earnings, Profile) */}
        {isWasherPortal ? (
          <nav className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-xl shadow-lg">
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
              href="/washer/earnings"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                pathname === '/washer/earnings'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Earnings</span>
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
        ) : isPublicPage ? (
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-white/70">
            <Link
              href="/how-it-works"
              className={`hover:text-white transition-colors ${
                pathname === '/how-it-works' ? 'text-white font-semibold' : ''
              }`}
            >
              How it works
            </Link>
            <Link
              href="/for-owners"
              className={`hover:text-white transition-colors ${
                pathname === '/for-owners' ? 'text-white font-semibold' : ''
              }`}
            >
              Car Owners
            </Link>
            <Link
              href="/pricing"
              className={`hover:text-white transition-colors ${
                pathname === '/pricing' ? 'text-white font-semibold' : ''
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`hover:text-white transition-colors ${
                pathname === '/about' ? 'text-white font-semibold' : ''
              }`}
            >
              About
            </Link>
          </nav>
        ) : null}

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isPublicPage ? (
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] text-xs font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-[0.98]"
            >
              <span>Get Torque Care</span>
            </Link>
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
              <Link
                href={role === 'owner' ? '/owner/notifications' : '/washer/notifications'}
                className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </Link>
              <Link
                href={`/${role}/dashboard`}
                className="text-xs font-bold text-[#080D1A] bg-white px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors shadow-sm"
              >
                Go to {role.toUpperCase()} App
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Navbar Actions */}
        <div className="flex md:hidden items-center gap-2">
          {pathname === '/' ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('torque-open-lead-modal'));
                }
              }}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#141C27] to-[#0D131D] hover:from-[#1b2535] hover:to-[#121a28] border border-[#2DD4A0]/40 text-white text-xs font-bold shadow-[0_12px_36px_rgba(0,0,0,0.8),0_0_20px_rgba(45,212,160,0.2)] flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4A0] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4A0]" />
              </span>
              <span className="tracking-wide">Register Interest</span>
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4A0] group-hover:rotate-12 transition-transform" />
            </button>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-white text-[#080D1A]"
              >
                Get Started
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/10"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B132B] px-5 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              How It Works
            </Link>
            <Link
              href="/for-owners"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Car Owners
            </Link>

            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
