'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Sparkles, Building2, MapPin, CheckCircle2, Phone, User } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function WasherAuthPage() {
  const router = useRouter();
  const { setRole } = useStore();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('98112 33445');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign up form state
  const [name, setName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [society, setSociety] = useState('Green Valley Residency');
  const [experience, setExperience] = useState('1-3 years');
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setRole('washer');
    setTimeout(() => {
      router.push(`/auth/verify?role=washer&phone=${encodeURIComponent('+91 ' + loginPhone)}`);
    }, 350);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setRole('washer');
    setTimeout(() => {
      router.push('/washer/dashboard');
    }, 400);
  };

  return (
    <div className="min-h-[85vh] bg-[#080D1A] text-slate-100 flex items-center justify-center px-4 py-16 selection:bg-emerald-500 selection:text-black">
      {/* Background glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-8 text-center">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center shadow-2xl">
            <span className="text-3xl">🧼</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Service Partner Network
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Torque Care Partner Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xs mx-auto leading-relaxed">
            Dedicated portal for washer partners to view morning routes, upload photo proof, and track daily earnings.
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Sign Up */}
        <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center gap-1 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`w-1/2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Partner Log In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`w-1/2 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'signup'
                ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Sign Up
          </button>
        </div>

        {/* Form Card */}
        <div className="p-7 sm:p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl text-left space-y-6 luxury-sheen">
          {activeTab === 'login' ? (
            /* LOGIN TAB */
            <form onSubmit={handleLoginSubmit} className="space-y-5">
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
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-hidden tracking-wider font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{loginLoading ? 'Accessing Route...' : 'Sign In to Washer App'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <div className="pt-3 border-t border-white/10 text-center">
                <p className="text-[11px] text-slate-400">
                  Instant partner verification • Direct access to today&apos;s morning route
                </p>
              </div>
            </form>
          ) : (
            /* SIGN UP TAB */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2.5">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2">
                  <span className="text-xs font-mono font-bold text-slate-300 px-3 py-1 border-r border-white/10">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="Enter 10-digit number"
                    className="w-full bg-transparent px-3 py-1 text-sm font-bold text-white focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                  Preferred Society / Community
                </label>
                <div className="flex items-center rounded-2xl border border-white/15 bg-white/5 p-2.5">
                  <Building2 className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <select
                    value={society}
                    onChange={(e) => setSociety(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-hidden [&>option]:bg-[#0B132B]"
                  >
                    <option value="Green Valley Residency">Green Valley Residency (Gurugram)</option>
                    <option value="Palm Heights">Palm Heights (Bengaluru)</option>
                    <option value="DLF Phase 5">DLF Phase 5 (Delhi NCR)</option>
                    <option value="Prestige Tech Park">Prestige Lakeside (Jaipur)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-300 uppercase tracking-wider block mb-1.5">
                  Car Washing Experience
                </label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-white/15 bg-white/5 text-xs font-bold text-white focus:outline-hidden [&>option]:bg-[#0B132B]"
                >
                  <option value="1-3 years">1 – 3 Years experience</option>
                  <option value="3+ years">3+ Years expert washer</option>
                  <option value="new">Beginner / Need Microfiber Training</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full py-4 px-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
              >
                <span>{signupLoading ? 'Registering...' : 'Register as Torque Partner'}</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </form>
          )}
        </div>

        {/* Link back to Owner Portal */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
          <span className="text-slate-400">Looking to get your vehicle washed?</span>
          <Link
            href="/auth/login"
            className="text-blue-400 hover:text-blue-300 font-bold transition-colors"
          >
            Car Owner Sign In →
          </Link>
        </div>
      </div>
    </div>
  );
}
