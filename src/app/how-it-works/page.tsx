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
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">

      {/* AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[#2DD4A0]/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* HERO / HEADER SECTION */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Kicker Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] shadow-md text-xs font-semibold text-white/70 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
          <span className="tracking-[0.2em] uppercase font-mono text-[10px] text-[#2DD4A0]">
            TRANSPARENT SOCIETY OPERATIONS
          </span>
        </div>

        {/* Grand Headline */}
        <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
          How Torque Care Works
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed mb-16">
          From the moment you register your parking bay to the morning proof certificate delivered directly to your phone.
        </p>

        {/* 3 CORE STEPS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* 01 */}
          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl transition-all space-y-4 relative">
            <span className="text-5xl font-black text-white/10 block font-mono">
              01
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Register Car & Set Bay
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Add your vehicle and specify your parking bay. Your assigned society specialist will handle your morning route.
            </p>
          </div>

          {/* 02 */}
          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-[#2DD4A0]/40 shadow-xl transition-all space-y-4 relative">
            <span className="text-5xl font-black text-[#2DD4A0]/20 block font-mono">
              02
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Water-Conscious Care
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Our verified partner follows gentle dual-bucket, scratch-safe microfiber care protocols between 06:30 AM and 09:30 AM.
            </p>
          </div>

          {/* 03 */}
          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl transition-all space-y-4 relative">
            <span className="text-5xl font-black text-white/10 block font-mono">
              03
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Verified Photo Proof
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Wake up to a high-resolution car photo certificate with parking bay and timestamp logged directly in your portal.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: OPERATIONAL GUARANTEES */}
      <section className="py-20 sm:py-28 border-t border-white/[0.08] bg-[#0A0D12] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0]">
              UNCOMPROMISING STANDARDS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Our Ironclad Operational Guarantees
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed pt-1">
              Built specifically for apartment societies tired of unexcused leaves and phantom charges.
            </p>
          </div>

          {/* Varied Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Featured Wide Card: Peer Handover */}
            <div className="lg:col-span-7 p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] space-y-6 shadow-xl relative">
              <div className="w-12 h-12 rounded-xl bg-[#161C25] border border-white/[0.08] text-[#2DD4A0] flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-2.5">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-[#2DD4A0] bg-[#2DD4A0]/10 px-3 py-0.5 rounded-full border border-[#2DD4A0]/20 uppercase">
                  ZERO MISSED DAYS
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Washer-Appointed Peer Backup
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  When your primary washer takes leave, they personally hand over and appoint a trained peer from their society team to care for your bay. No missing days, no excuses.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/[0.08] text-xs text-white/70 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Personal physical handover</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Keyless exterior protocol</span>
                </div>
              </div>
            </div>

            {/* Right Stack: Missed-Wash Protection & Transparent Billing */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              {/* Card 1 */}
              <div className="p-7 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-3 shadow-xl">
                <div className="w-11 h-11 rounded-xl bg-[#161C25] text-amber-400 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Orange Calendar Audit Flag
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  If a wash is missed, answering &apos;No&apos; on your morning verification flags the day Orange in your calendar for immediate operational review.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-7 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-3 shadow-xl">
                <div className="w-11 h-11 rounded-xl bg-[#161C25] text-[#2DD4A0] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  100% Digital Audit History
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Complete digital transparency. Timestamped before/after photos, bay inspection stamps, and full historical log accessible anytime from your phone.
                </p>
              </div>
            </div>
          </div>

          {/* Full-width rule card: Customer / Vehicle Unavailable Protocol */}
          <div className="mt-6 p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-6 relative">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-400/20 uppercase">
                  FAIR PLAY &amp; PRESENCE POLICY
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Customer / Vehicle Unavailable Protocol
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  If the washer reaches your assigned bay during the scheduled window, but you aren&apos;t available and the car isn&apos;t at the bay, the record is certified with objective live proof:
                </p>
              </div>

              {/* 3 Status Points */}
              <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.06] text-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-white/50 block">Washer</span>
                  <span className="text-sm font-bold text-[#2DD4A0] flex items-center justify-center gap-1 mt-0.5">
                    Present ✓
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.06] text-center min-w-[120px]">
                  <span className="text-[10px] uppercase font-bold text-white/50 block">Service</span>
                  <span className="text-sm font-bold text-white/80 block mt-0.5">
                    Vehicle Away
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#161C25] border border-white/[0.06] text-center min-w-[140px]">
                  <span className="text-[10px] uppercase font-bold text-white/50 block">Route Audit</span>
                  <span className="text-sm font-bold text-[#2DD4A0] flex items-center justify-center gap-1 mt-0.5">
                    Recorded ✓
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-white/60">
              <div className="flex items-center gap-2 text-white/80 font-medium">
                <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                <span>Not classified as a missed wash by the washer partner.</span>
              </div>
              <div className="text-[11px] text-white/40 font-mono">
                Washer captures &apos;BAY EMPTY&apos; photo with geotag verification.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: TWO PILLARS */}
      <section className="py-20 sm:py-28 border-t border-white/[0.08] bg-[#0A0D12] relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0]">
              UNIFIED VEHICLE CARE
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              At Home or Away — Always Cared For
            </h2>
            <p className="text-sm sm:text-base text-white/60 leading-relaxed pt-1">
              Your car care follows you across cities, all consolidated in one vehicle log.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Home Card */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] space-y-5 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[#161C25] text-[#2DD4A0] flex items-center justify-center font-bold">
                <Home className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Torque Care Home</h3>
                <div className="text-xl font-bold text-[#2DD4A0]">
                  Mon–Sat Daily Care
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Recurring society bay care. Timestamped photo every morning before your commute.
              </p>
            </div>

            {/* Away Card */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] space-y-5 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-[#161C25] text-amber-400 flex items-center justify-center font-bold">
                <Car className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">Torque Care Away</h3>
                <div className="text-xl font-bold text-amber-400">
                  Coming Soon! Stay Tuned
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                On-demand verified car care while travelling across partner cities. Stay tuned!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Ready for verified car care in your society?
            </h2>
            <p className="text-sm sm:text-base text-white/60 max-w-xl mx-auto leading-relaxed">
              Join thousands of vehicle owners enjoying spotless cars and photo proof every single morning.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Subscribe Your Car Today</span>
            </Link>
            <Link
              href="/get-started"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#161C25] hover:bg-white/10 text-white font-bold text-sm border border-white/[0.08] transition-all"
            >
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
