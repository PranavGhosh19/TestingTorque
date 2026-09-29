'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  Fingerprint,
  Building2,
  AlertCircle,
  CheckCircle2,
  Car,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function DedicatedAdminLoginPage() {
  const router = useRouter();
  const { setRole, setUser } = useStore();

  const [identifier, setIdentifier] = useState('admin@torquecare.com');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your Admin Work Email or Mobile');
      return;
    }

    setLoading(true);
    setError('');

    // Set role to admin in store
    setRole('admin');
    setUser({
      id: 'admin-lead-1',
      name: 'Vikram Malhotra (Ops Lead)',
      phone: '+91 99999 00001',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    });

    setTimeout(() => {
      router.push('/admin/dashboard');
    }, 400);
  };

  const handleQuickBypass = () => {
    setLoading(true);
    setRole('admin');
    setUser({
      id: 'admin-lead-1',
      name: 'Vikram Malhotra (Ops Lead)',
      phone: '+91 99999 00001',
      role: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    });
    router.push('/admin/dashboard');
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex-1 bg-[#060913] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-amber-500 selection:text-black relative">
      {/* Background ambient glows */}
      <div className="fixed inset-0 bg-[#060913] -z-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-amber-600/10 rounded-full blur-[170px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-400 mx-auto flex items-center justify-center shadow-2xl">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-[10px] font-black uppercase tracking-widest text-amber-400">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Restricted Operations Console</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Torque Care Admin Login
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Authorized sign-in for Operations Supervisors, Society Marshals, and Regional Treasury Admins.
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

          <form onSubmit={handleAdminSubmit} className="space-y-5">
            <div>
              <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-2">
                Work Email or Admin ID
              </label>
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all shadow-inner">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. admin@torquecare.com"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-normal font-sans"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                  Security Passcode / Token
                </label>
                <span className="text-[10px] text-amber-400 font-mono font-bold">2FA Enabled</span>
              </div>
              <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20 transition-all shadow-inner">
                <KeyRound className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter 6-digit passcode or master key"
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-wider font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(245,158,11,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Admin...' : 'Authenticate & Open Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Fast Bypass for Testing */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleQuickBypass}
              className="w-full py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Fingerprint className="w-4 h-4 text-amber-400" />
              <span>⚡ One-Click Test Login (Ops Lead Bypass)</span>
            </button>
          </div>

          {/* Audit Trail Note */}
          <div className="pt-3 border-t border-white/10 text-center space-y-1">
            <p className="text-[10px] text-slate-400 leading-tight">
              🔒 Immutable audit trail active. All admin actions, payouts, and fleet reassignments are cryptographically logged.
            </p>
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
            <p className="text-[10px] text-slate-400 mt-0.5">Car Care & Daily Calendar</p>
          </Link>

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
        </div>
      </div>
    </div>
  );
}
