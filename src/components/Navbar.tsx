'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ArrowRight, Bell, Sparkles, ChevronDown, Car, Lock } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const loginMenuRef = useRef<HTMLDivElement>(null);
  const { role, user, notifications } = useStore();

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

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (loginMenuRef.current && !loginMenuRef.current.contains(event.target as Node)) {
        setLoginMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080D1A]/95 backdrop-blur-xl border-b border-white/10 transition-colors pt-[env(safe-area-inset-top)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/20 shadow-lg group-hover:scale-105 transition-transform flex items-center justify-center bg-black/40">
            <img
              src="/images/app_icon.jpg"
              alt="Torque Care Icon"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Torque<span className="text-blue-400">Care</span>
            </span>
          </div>
        </Link>

        {/* Public Desktop Nav Links */}
        {isPublicPage ? (
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Link
              href="/how-it-works"
              className={`hover:text-white transition-colors ${
                pathname === '/how-it-works' ? 'text-blue-400' : ''
              }`}
            >
              How It Works
            </Link>
            <Link
              href="/for-owners"
              className={`hover:text-white transition-colors ${
                pathname === '/for-owners' ? 'text-blue-400' : ''
              }`}
            >
              For Owners
            </Link>
            <Link
              href="/for-washers"
              className={`hover:text-white transition-colors ${
                pathname === '/for-washers' ? 'text-blue-400' : ''
              }`}
            >
              For Washers
            </Link>
            <Link
              href="/pricing"
              className={`hover:text-white transition-colors ${
                pathname === '/pricing' ? 'text-blue-400' : ''
              }`}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={`hover:text-white transition-colors ${
                pathname === '/about' ? 'text-blue-400' : ''
              }`}
            >
              About
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Active Session:
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-white font-mono text-xs border border-white/10 capitalize">
              {role} ({user.name})
            </span>
          </div>
        )}

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isPublicPage ? (
            <>
              {/* Dedicated Log In Dropdown */}
              <div className="relative" ref={loginMenuRef}>
                <button
                  type="button"
                  onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Log In</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${loginMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {loginMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0B132B] border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-white/10 mb-1">
                      Choose Portal
                    </div>

                    <Link
                      href="/auth/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Car className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 flex items-center gap-1">
                          <span>Owner Login</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          Daily photos, wash schedule & cars
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/washer/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs">🧼</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1">
                          <span>Washer Partner Login</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          Morning routes & earnings payout
                        </div>
                      </div>
                    </Link>

                    <Link
                      href="/admin/login"
                      onClick={() => setLoginMenuOpen(false)}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1">
                          <span>Admin Console</span>
                        </div>
                        <div className="text-[10px] text-slate-400 leading-tight">
                          Operations, fleet & treasury
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] text-xs font-black shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
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

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
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
              For Owners
            </Link>
            <Link
              href="/for-washers"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 hover:text-white"
            >
              For Washers
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

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-white text-[#080D1A] text-center font-black text-xs shadow-md"
            >
              Get Started as Owner
            </Link>

            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mt-2 px-1">
              Dedicated Portals:
            </div>

            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-bold flex items-center justify-between"
            >
              <span>🚗 Owner Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/washer/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-emerald-300 text-xs font-bold flex items-center justify-between"
            >
              <span>🧼 Washer Partner Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
            </Link>

            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-amber-300 text-xs font-bold flex items-center justify-between"
            >
              <span>⚙️ Admin Operations Login</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
