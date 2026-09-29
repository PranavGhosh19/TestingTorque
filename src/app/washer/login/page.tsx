'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function DedicatedWasherLoginPage() {
  const router = useRouter();
  const { setRole, washers, setUser } = useStore();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setRole('washer');

    // If there is an onboarded washer matching this phone, match them
    const matched = washers.find(
      (w) =>
        w.phone.replace(/\D/g, '').includes(cleanPhone) ||
        cleanPhone.includes(w.phone.replace(/\D/g, ''))
    );
    if (matched) {
      setUser({
        id: matched.id,
        name: matched.name,
        phone: matched.phone,
        role: 'washer',
        avatar_url: matched.avatar,
        status: 'active',
        created_at: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      router.push(`/auth/verify?role=washer&phone=${encodeURIComponent('+91 ' + cleanPhone)}`);
    }, 350);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-emerald-500 selection:text-black relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[#080D1A] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🧼</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Dedicated Partner Portal
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Torque Care Partner Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Enter your registered partner mobile number to view today&apos;s morning route, upload photo proof, and track weekly earnings.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleContinue} className="space-y-5">
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Registered Partner Mobile
              </label>

              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all shadow-inner">
                <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1.5 border-r border-white/10">
                  +91
                </span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-wider font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(16,185,129,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Sending OTP...' : 'Sign In to Washer Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Washer Onboarding Link */}
          <div className="pt-4 border-t border-white/10 text-center space-y-2">
            <p className="text-[11px] text-slate-400 font-medium">
              Not an active partner yet?
            </p>
            <div>
              <Link
                href="/auth/washer-onboarding"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Onboard with Aadhaar Card →</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Portal Switchers */}
        <div className="grid grid-cols-2 gap-3 text-left">
          <Link
            href="/auth/login"
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group block"
          >
            <div className="text-xs font-bold text-blue-400 flex items-center gap-1">
              <span>🚗 Owner Login</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Vehicle Care & Schedule</p>
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
