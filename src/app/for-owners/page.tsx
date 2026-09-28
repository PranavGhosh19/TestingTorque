'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  History,
  ShieldAlert,
  Users,
  Sparkles,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  Compass,
  Check,
  Car,
} from 'lucide-react';

export default function ForOwnersPage() {
  const trustFeatures = [
    {
      title: 'Verified Washes',
      icon: ShieldCheck,
      color: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      description:
        'Every wash requires a clean car photograph with verified parking bay details and accurate timestamps directly from the washer’s phone.',
    },
    {
      title: 'Wash History Timeline',
      icon: History,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-400/30',
      description:
        'A comprehensive digital logbook of every wash performed on your car. Track washer performance, dates, photos, and inspection notes going back months.',
    },
    {
      title: 'Missed-Wash Protection',
      icon: ShieldAlert,
      color: 'bg-amber-500/20 text-amber-400 border-amber-400/30',
      description:
        'Never pay for absent washers. If an unverified day occurs, an automated credit is applied to your next billing cycle with zero manual hassle.',
    },
    {
      title: 'Washer-Appointed Backup',
      icon: Users,
      color: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
      description:
        'If your primary washer takes time off, they personally hand over and appoint a trusted peer from their society team to cover your bay. Zero missed days.',
    },
    {
      title: 'Away & Travel Care',
      icon: Compass,
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30',
      description:
        'Going out of town or parking elsewhere? Locate the nearest verified Torque Care washer at your destination and book care until you return.',
    },
    {
      title: 'Sunday Priority',
      icon: Sparkles,
      color: 'bg-rose-500/20 text-rose-400 border-rose-400/30',
      description:
        'Weekend plans? Request a guaranteed Sunday wash slot directly from the app. 100% of the priority surcharge goes directly to incentivize your washer.',
    },
    {
      title: 'Transparent Payments',
      icon: IndianRupee,
      color: 'bg-teal-500/20 text-teal-400 border-teal-400/30',
      description:
        'Razorpay & UPI recurring billing with no unexpected price hikes, upfront tipping pressure, or awkward cash collections.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-slate-100 overflow-hidden selection:bg-blue-500 selection:text-white py-20 sm:py-28">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20 sm:space-y-24">
        {/* HERO HEADER — AIRY & SPACIOUS */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase font-mono text-[11px] text-blue-300">
              Torque Care Nationwide Network
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Your car. <span className="text-gradient-blue">Cared for, wherever you go.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Recurring society car care (₹599/mo) and on-demand washes when travelling (Away Mode) — unified in one continuous vehicle history with verified morning photo certificates.
          </p>
        </div>

        {/* 7 TRUST FEATURES GRID — LUXURY DARK GLASS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {trustFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-2xl transition-all space-y-4 luxury-sheen relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Extra Highlights Card: Customer / Vehicle Unavailable Guarantee */}
          <div className="p-8 rounded-3xl bg-linear-to-br from-amber-500/10 via-[#0B132B] to-[#080D1A] border border-amber-500/30 backdrop-blur-xl shadow-2xl space-y-4 luxury-sheen relative flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 uppercase">
                Presence & Payout Rule
              </div>
              <h3 className="text-2xl font-black text-white">
                Customer / Vehicle Unavailable Protocol
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                If the washer reaches your assigned parking bay during the scheduled morning window, but your vehicle isn&apos;t parked there, Torque Care opens the live camera to capture a timestamped photo of the empty bay. Washer is marked <span className="text-emerald-400 font-bold">Present ✓</span>, payout is protected, and it is not classified as a missed wash by the washer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs font-mono">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Washer Presence</span>
                <span className="font-bold text-emerald-400">Present ✓</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Service Status</span>
                <span className="font-bold text-slate-300">Not possible</span>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                <span className="text-[10px] text-slate-400 block uppercase">Washer Payout</span>
                <span className="font-bold text-emerald-400">Protected ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* OWNER DASHBOARD CTA BANNER */}
        <div className="p-10 sm:p-14 rounded-3xl bg-linear-to-r from-blue-900/30 via-white/5 to-[#080D1A] border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 luxury-sheen relative">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to experience verified morning car care?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign up your vehicle, specify your parking bay, and wake up to a spotless car with timestamped photo proof every morning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105 text-center"
            >
              <span>Get Started as Owner</span>
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/15 backdrop-blur-md transition-all hover:scale-105 text-center flex items-center justify-center gap-2"
            >
              <span>View Pricing Plans</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
