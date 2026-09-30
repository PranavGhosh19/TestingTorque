'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Car, CheckCircle2, Sparkles, UserCheck, RefreshCw } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function OwnerLoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setRole, isLoggedIn, isHydrated, role } = useStore();

  useEffect(() => {
    const storedLoggedIn =
      typeof window !== 'undefined' && localStorage.getItem('torque_logged_in') === 'true';
    if ((isHydrated && isLoggedIn) || storedLoggedIn) {
      let targetRole = role || 'owner';
      try {
        const savedUserStr =
          typeof window !== 'undefined' ? localStorage.getItem('torque_user') : null;
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          if (parsed?.role) targetRole = parsed.role;
        }
      } catch (e) {
        // ignore
      }
      router.replace(`/${targetRole}/dashboard`);
    }
  }, [isHydrated, isLoggedIn, role, router]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRole('owner');
    setTimeout(() => {
      router.push(`/auth/verify?role=owner&phone=${encodeURIComponent(phone.startsWith('+91') ? phone : '+91 ' + phone)}`);
    }, 350);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-blue-500 selection:text-white relative">
      {/* Background full coverage & ambient glows */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/15 text-white mx-auto flex items-center justify-center shadow-2xl">
            <Car className="w-8 h-8 text-blue-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
            Vehicle Owner Portal
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Torque Care for Owners
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Enter your mobile number to view daily verified photos, track schedule, and manage parking bay care.
          </p>
        </div>

        {/* Mobile Input Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          <form onSubmit={handleContinue} className="space-y-5">
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Registered Mobile Number
              </label>

              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all shadow-inner">
                <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1.5 border-r border-white/10">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-wider font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(255,255,255,0.15)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{loading ? 'Sending Verification Code...' : 'Sign In with OTP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Verification note & Sign up link */}
          <div className="pt-4 border-t border-white/10 text-center space-y-2">
            <p className="text-[11px] text-slate-400 font-medium">
              Instant OTP verification • Zero password needed
            </p>
            <div>
              <Link
                href="/auth/signup"
                className="text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                Don&apos;t have an account? <span className="text-blue-400 underline">Sign up here</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dedicated Separate Portal Switchers */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <Link
            href="/washer/login"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group block"
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <span>🧼 Washer Login</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Partner Route & Earnings</p>
          </Link>

          <Link
            href="/admin/login"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group block"
          >
            <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <span>⚙️ Admin Login</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Operations & Treasury</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

