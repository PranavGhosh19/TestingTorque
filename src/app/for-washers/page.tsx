'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, IndianRupee, Calendar, Users, Zap, ArrowRight, Check, CheckCircle2, ShieldCheck, AlertTriangle, Gift } from 'lucide-react';

export default function ForWashersPage() {
  const washerBenefits = [
    {
      title: 'Get Steady Customers',
      icon: Users,
      color: 'text-emerald-600 bg-emerald-50',
      description:
        'No more knocking on doors or begging for monthly payments. Torque Care assigns verified society subscribers directly to your digital route.',
    },
    {
      title: 'Concentrated Routes',
      icon: MapPin,
      color: 'text-blue-600 bg-blue-50',
      description:
        'All your cars are in the same basement or adjacent towers. Finish up to 35 vehicles in under 3.5 hours with zero cross-city travel.',
    },
    {
      title: 'Direct Weekly Payouts',
      icon: IndianRupee,
      color: 'text-teal-600 bg-teal-50',
      description:
        'Earn ₹20 to ₹35 per wash. Withdraw your earnings anytime directly to your bank account with instant IMPS settlement.',
    },
    {
      title: 'Flexible Leave Protection',
      icon: Calendar,
      color: 'text-amber-600 bg-amber-50',
      description:
        'Need time off? Request leave with 1-tap in the app and your partner network automatically covers your route without losing your customer base.',
    },
    {
      title: 'Backup Network Community',
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50',
      description:
        'Work alongside verified peers in your society. Cover each other’s shifts, earn extra bonuses, and build respect in the community.',
    },
    {
      title: '100% Sunday Payments Bonus',
      icon: Gift,
      color: 'text-rose-600 bg-rose-50',
      description:
        'Now a bonus payment for Washers: All Sunday payments are for Washers. Torque Care takes zero platform fee on Sundays — 100% of every Sunday wash payment goes directly into your pocket.',
    },
    {
      title: 'Payout Protection on Missing Cars',
      icon: ShieldCheck,
      color: 'text-emerald-600 bg-emerald-50',
      description:
        "Reached the assigned parking bay but the vehicle is missing? Tap 'VEHICLE NOT AVAILABLE' and snap a photo of the empty bay. Washer: Present ✓, Payout: Protected ✓. Never counted as a missed wash.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 border border-amber-500/40 text-amber-900 text-xs font-black shadow-xs">
          <Gift className="w-4 h-4 text-amber-600 animate-bounce" />
          <span>BONUS ANNOUNCEMENT: ALL SUNDAY PAYMENTS ARE FOR WASHERS</span>
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Service Partner Network
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B132B] tracking-tight">
          More customers. <br />
          <span className="text-emerald-600">Less chasing.</span>
        </h1>
        <p className="text-sm text-slate-600">
          Transform irregular local car cleaning into a predictable, tech-enabled enterprise with automated routes, protected payouts, and 100% Sunday bonus earnings.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {washerBenefits.map((b, i) => {
          const Icon = b.icon;
          return (
            <div
              key={i}
              className="premium-card p-6 bg-white border-slate-200 space-y-3 shadow-xs"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${b.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#0B132B]">{b.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{b.description}</p>
            </div>
          );
        })}
      </div>

      {/* SUNDAY BONUS PAYMENTS: 100% FOR WASHERS */}
      <div className="p-8 sm:p-10 rounded-3xl bg-linear-to-br from-rose-950 via-[#0B132B] to-[#080D1A] text-white border-2 border-rose-500/40 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-[11px] font-mono font-black uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-rose-400" />
              100% Partner Retention
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Now a bonus payment for Washers: <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-rose-400 via-amber-300 to-rose-300">
                All Sunday payments are for Washers.
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Torque Care takes zero platform fees or commission on Sundays. 100% of every rupee car owners pay for Sunday morning washes is transferred straight to you as an instant bonus.
            </p>
          </div>

          {/* Direct Math Bento */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[95px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner Pays</span>
              <span className="text-xl font-black text-white mt-1 block">₹50</span>
              <span className="text-[9px] text-slate-400">per car</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[95px]">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Torque Fee</span>
              <span className="text-xl font-black text-emerald-400 mt-1 block">₹0</span>
              <span className="text-[9px] text-emerald-400">0% Cut</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-400/50 text-center min-w-[105px]">
              <span className="text-[10px] uppercase font-bold text-rose-300 block">You Receive</span>
              <span className="text-xl font-black text-amber-300 mt-1 block">₹50</span>
              <span className="text-[9px] text-amber-300 font-bold">100% Bonus ✓</span>
            </div>
          </div>
        </div>

        {/* Sunday Perks Row */}
        <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs relative z-10">
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>₹750 extra cash</strong> in ~1.5 hrs (15 cars)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>+₹3,000 to ₹4,000/month</strong> bonus earnings</span>
          </div>
          <div className="flex items-center gap-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Instant IMPS payout</strong> directly to bank</span>
          </div>
        </div>
      </div>

      {/* Fair Partner Protection: Vehicle Unavailable Rule */}
      <div className="p-8 bg-[#0B132B] text-white rounded-3xl space-y-6 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
              Partner Payout Guarantee
            </span>
            <h3 className="text-2xl font-black text-white">
              Customer / Vehicle Unavailable? Your Payout is Protected.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              If you reach the assigned parking bay during the scheduled window, but the owner isn&apos;t available and the vehicle isn&apos;t at the assigned bay, you still get paid:
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Washer</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                Present ✓
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Service</span>
              <span className="text-sm font-bold text-slate-300 block mt-0.5">
                Not possible
              </span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 text-center min-w-[130px]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Payout</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                Protected ✓
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>It should not be classified as a missed wash by the washer.</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            How to verify: Tap &apos;VEHICLE NOT AVAILABLE&apos; → Live camera opens → Snap photo of assigned bay.
          </div>
        </div>
      </div>

      {/* Washer Earning Calculator Preview */}
      <div className="premium-card p-8 bg-white border-slate-200 rounded-3xl space-y-6">
        <div className="max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Earning Potential
          </span>
          <h3 className="text-2xl font-extrabold text-[#0B132B] mt-1">
            Expected Monthly Earnings
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Based on a single 3-hour morning route in a typical 500-apartment society + 100% Sunday payments bonus.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-500 font-medium">Daily Route (Mon-Sat)</span>
            <div className="text-2xl font-extrabold text-[#0B132B] mt-1">30 Cars</div>
            <span className="text-[11px] text-slate-400">~3 hours / morning</span>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
            <span className="text-xs text-rose-700 font-semibold flex items-center justify-center gap-1">
              <Gift className="w-3.5 h-3.5 text-rose-600" />
              Sunday Bonus (100%)
            </span>
            <div className="text-2xl font-extrabold text-rose-800 mt-1">+₹3,000</div>
            <span className="text-[11px] text-rose-600">All Sunday payments for you</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
            <span className="text-xs text-emerald-700 font-semibold">Total Monthly Take-Home</span>
            <div className="text-2xl font-extrabold text-emerald-900 mt-1">₹21,500+</div>
            <span className="text-[11px] text-emerald-600">100% on-time transfer</span>
          </div>
        </div>

        <div className="pt-2 text-center">
          <Link
            href="/washer/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            <span>Washer Partner Login & Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
