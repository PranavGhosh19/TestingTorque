'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Car,
  Home,
  Check,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* LUXURY AMBIENT BACKGROUND GLOWS */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* HERO / HEADER SECTION */}
      <section className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Kicker Pill with generous clearance */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-200 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-widest uppercase font-mono text-[11px] text-blue-300">
            Transparent Operations
          </span>
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
          How Torque Care <span className="text-gradient-blue">Works</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed mb-16">
          From the moment you register your parking bay to the morning proof certificate delivered directly to your phone.
        </p>

        {/* 3 CORE STEPS (Replacing the stats ribbon) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {/* 01 */}
          <div className="p-8 sm:p-9 rounded-3xl bg-white/5 border border-white/15 hover:border-blue-400/40 backdrop-blur-xl shadow-2xl transition-all space-y-4 luxury-sheen relative">
            <span className="text-5xl font-black text-blue-400/40 block font-mono">
              01
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              Subscribe & Set Bay
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Add your vehicle and specify your parking bay. Choose a flexible monthly plan with zero lock-in.
            </p>
          </div>

          {/* 02 */}
          <div className="p-8 sm:p-9 rounded-3xl bg-white/5 border border-white/15 hover:border-emerald-400/40 backdrop-blur-xl shadow-2xl transition-all space-y-4 luxury-sheen relative">
            <span className="text-5xl font-black text-emerald-400/40 block font-mono">
              02
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              Your Vehicle Gets Washed
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our trained partner follows gentle, scratch-safe microfiber care protocols for a spotless finish.
            </p>
          </div>

          {/* 03 */}
          <div className="p-8 sm:p-9 rounded-3xl bg-white/5 border border-white/15 hover:border-amber-400/40 backdrop-blur-xl shadow-2xl transition-all space-y-4 luxury-sheen relative">
            <span className="text-5xl font-black text-amber-400/40 block font-mono">
              03
            </span>
            <h3 className="text-xl font-black text-white tracking-tight">
              Get Verified Proof
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wake up to a verified clean car photo certificate with parking bay and time logged directly on your phone.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: OPERATIONAL GUARANTEES — ASYMMETRIC BENTO GRID */}
      <section className="py-24 sm:py-32 border-t border-white/10 bg-[#0B132B]/60 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">
              Uncompromising Standards
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Our Ironclad Operational Guarantees
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed pt-1">
              Built specifically for apartment owners tired of unexcused leaves and phantom charges.
            </p>
          </div>

          {/* Varied Asymmetrical Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Featured Wide Card: Peer Handover */}
            <div className="lg:col-span-7 p-8 sm:p-10 rounded-3xl bg-linear-to-br from-white/10 via-[#0B132B] to-[#080D1A] border border-white/15 space-y-6 shadow-2xl relative luxury-sheen">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-400 flex items-center justify-center">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full border border-purple-400/30 uppercase">
                  Zero Missed Days Guarantee
                </div>
                <h3 className="text-2xl font-black text-white">
                  Washer-Appointed Peer Backup
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  When your primary washer takes time off, they personally hand over and appoint a trusted peer from their society team to care for your bay. No missing days, no excuses, and no searching for temporary replacements.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Personal physical handover</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Keyless exterior protocol</span>
                </div>
              </div>
            </div>

            {/* Right Stack: Missed-Wash Protection & Transparent Billing */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {/* Card 1 */}
              <div className="p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all space-y-3 shadow-xl">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Missed-Wash Auto-Refund
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If a wash is missed due to extreme weather or unresolvable access, you receive an automated wallet credit or validity extension. You only pay for washes verified by photo.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all space-y-3 shadow-xl">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  100% Digital Payments & Invoicing
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Zero cash exchanges. Pay securely via UPI, credit cards, or auto-debit. Auto-generated monthly GST invoices with itemized proof breakdown.
                </p>
              </div>
            </div>
          </div>

          {/* Full-width rule card: Customer / Vehicle Unavailable Protocol */}
          <div className="mt-8 p-8 sm:p-10 rounded-3xl bg-linear-to-r from-amber-500/10 via-white/5 to-[#0B132B] border border-amber-500/30 backdrop-blur-xl shadow-2xl space-y-6 luxury-sheen relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 uppercase">
                  Fair Play & Presence Policy
                </div>
                <h3 className="text-2xl font-black text-white">
                  Customer / Vehicle Unavailable Protocol
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  If the washer reaches your assigned parking bay during the scheduled window, but you aren&apos;t available and the vehicle isn&apos;t at the bay, the record is certified with objective live proof:
                </p>
              </div>

              {/* 3 Status Points */}
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Washer</span>
                  <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    Present ✓
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Service</span>
                  <span className="text-sm font-black text-slate-200 block mt-0.5">
                    Not possible
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 text-center min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Washer payout</span>
                  <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                    Protected ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-amber-200 font-semibold">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>It should not be classified as a missed wash by the washer.</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Verified via Live Camera: Washer taps &apos;VEHICLE NOT AVAILABLE&apos; and photographs assigned bay.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: THE TWO PILLARS HIGHLIGHT */}
      <section className="py-24 sm:py-32 border-t border-white/10 bg-linear-to-b from-[#0B132B]/80 to-[#080D1A] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
              Unified Vehicle Care
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              At Home or Away — Always Cared For
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed pt-1">
              Your car care follows you across cities, all consolidated in one vehicle log.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Home Card */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/15 space-y-5 luxury-sheen shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Home className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Torque Care Home</h3>
                <div className="text-2xl font-black text-blue-400">
                  <span className="text-xs font-semibold text-slate-400 block">Starting at</span>
                  ₹599<span className="text-xs font-medium text-slate-400">/month</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Recurring society bay care. Timestamped photo every morning before your commute.
              </p>
            </div>

            {/* Away Card */}
            <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-5 luxury-sheen shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex flex-col items-center justify-center font-bold relative">
                <Car className="w-6 h-6" />
                <div className="w-7 h-0.5 bg-amber-400/80 rounded-full mt-0.5 flex justify-center gap-0.5">
                  <span className="w-1.5 h-0.5 bg-slate-900 rounded-full" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Torque Care Away</h3>
                <div className="text-2xl font-black text-amber-400">
                  <span className="text-xs font-semibold text-slate-400 block">Starting at</span>
                  ₹39<span className="text-xs font-medium text-slate-400">/wash or Book Until Return</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                For washes while travelling. Open in any city, pick nearest verified partner, and book until you return.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-2xl shadow-2xl space-y-8 luxury-sheen">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready for verified car care in your society?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
              Join thousands of discerning vehicle owners enjoying spotless cars and photo proof every single morning.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-sm shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
            >
              <span>Subscribe Your Car Today</span>
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition-all hover:scale-105"
            >
              <span>View Pricing Plans</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
