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
  Compass,
} from 'lucide-react';

export default function ForOwnersPage() {
  const trustFeatures = [
    {
      title: 'Verified Washes',
      icon: ShieldCheck,
      description:
        'Every wash requires a clean car photograph with verified parking bay details and accurate timestamps directly from the washer’s phone.',
    },
    {
      title: 'Wash History Timeline',
      icon: History,
      description:
        'A comprehensive digital logbook of every wash performed on your car. Track washer performance, dates, photos, and inspection notes going back months.',
    },
    {
      title: 'Missed-Wash Protection',
      icon: ShieldAlert,
      description:
        'Never pay for absent washers. If an unverified day occurs, an automated credit is applied to your next billing cycle with zero manual hassle.',
    },
    {
      title: 'Washer-Appointed Backup',
      icon: Users,
      description:
        'If your primary washer takes time off, they personally hand over and appoint a trusted peer from their society team to cover your bay. Zero missed days.',
    },
    {
      title: 'Away & Travel Care',
      icon: Compass,
      description:
        'Going out of town or parking elsewhere? Locate the nearest verified Torque Care washer at your destination and book care until you return.',
    },
    {
      title: 'Sunday Priority',
      icon: Sparkles,
      description:
        'Weekend plans? Request a guaranteed Sunday wash slot directly from the app. 100% of the priority surcharge goes directly to incentivize your washer.',
    },
    {
      title: 'Transparent Payments',
      icon: IndianRupee,
      description:
        'Razorpay & UPI recurring billing with no unexpected price hikes, upfront tipping pressure, or awkward cash collections.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">

      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[#2DD4A0]/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 space-y-16 sm:space-y-20">
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] shadow-md text-xs font-semibold text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
            <span className="tracking-[0.2em] uppercase font-mono text-[10px] text-[#2DD4A0]">
              VERIFIED APARTMENT SERVICE
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Your car. Cared for, wherever you go.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Recurring society car care (₹599/mo) and on-demand washes when travelling (Away Mode) — unified in one continuous vehicle history with verified morning photo certificates.
          </p>
        </div>

        {/* 7 TRUST FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {trustFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl transition-all space-y-4 relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#161C25] border border-white/[0.08] flex items-center justify-center text-[#2DD4A0]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
                    {f.description}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Extra Highlights Card: Customer / Vehicle Unavailable Guarantee */}
          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-4 relative flex flex-col justify-between md:col-span-2 lg:col-span-2">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-400/20 uppercase">
                PRESENCE & FAIR PAYOUT RULE
              </div>
              <h3 className="text-2xl font-bold text-white">
                Customer / Vehicle Unavailable Protocol
              </h3>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                If the washer reaches your assigned parking bay during the scheduled morning window, but your vehicle isn&apos;t parked there, Torque Care opens the live camera to capture a timestamped photo of the empty bay. Washer is marked <span className="text-[#2DD4A0] font-bold">Present ✓</span>, payout is protected, and it is not classified as a missed wash by the washer.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.08] text-xs font-mono">
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-white/50 block uppercase">Washer Presence</span>
                <span className="font-bold text-[#2DD4A0]">Present ✓</span>
              </div>
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-white/50 block uppercase">Service Status</span>
                <span className="font-bold text-white/80">Not possible</span>
              </div>
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.06] text-center">
                <span className="text-[10px] text-white/50 block uppercase">Washer Payout</span>
                <span className="font-bold text-[#2DD4A0]">Protected ✓</span>
              </div>
            </div>
          </div>
        </div>

        {/* OWNER DASHBOARD CTA BANNER */}
        <div className="p-10 sm:p-12 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative">
          <div className="space-y-2 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Ready to experience verified morning car care?
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              Sign up your vehicle, specify your parking bay, and wake up to a spotless car with timestamped photo proof every morning.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-xs shadow-md transition-all active:scale-95 text-center"
            >
              <span>Get Started as Owner</span>
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#161C25] hover:bg-white/10 text-white font-bold text-xs border border-white/[0.08] transition-all text-center flex items-center justify-center gap-2"
            >
              <span>View Pricing Plans</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
