'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  Star,
  Users,
  Building2,
  ChevronRight,
  Zap,
  Compass,
  Car,
  History,
  Home,
  Check,
} from 'lucide-react';
import SignatureProofCard from '@/components/SignatureProofCard';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const { todayWash } = useStore();

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-1/3 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* HERO SECTION — AIRY & SPACIOUS */}
      <section className="relative pt-16 pb-28 lg:pt-28 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-center">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 text-center lg:text-left"
          >
            {/* Luxury Brand Trust Pill with generous bottom margin */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-200 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide">Torque Care • Private Automotive Concierge</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
              Your car. <br />
              <span className="text-gradient-blue">Cared for, wherever you go.</span>
            </h1>

            {/* Subheading with relaxed breathing room */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed mb-10">
              Recurring car care + verified service + nationwide partner network. Daily society bay care and travel washes on demand — all in one unified vehicle history.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Get Started Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/owner/travel"
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Car className="w-4 h-4 text-amber-400" />
                <span>Explore Away Mode</span>
              </Link>
            </div>

            {/* Social Proof Counter */}
            <div className="pt-8 border-t border-white/10 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Bay-Verified Proof</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>4.9 / 5 Executive Rating</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span>24+ Premium Societies</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 relative"
          >
            {/* Signature interactive proof card */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <SignatureProofCard wash={todayWash} />

            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 1: CORE VALUE PILLARS — SPACIOUS BENTO GRID */}
      <section className="py-28 sm:py-36 bg-[#0B132B]/70 border-y border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with generous clearance above and below */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">
              Reinventing Gated Community Car Care
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Why traditional car cleaners let you down
            </h2>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
              Unverified washes, dirty rags, dry-wipe scratches, and unpredictable leaves. Torque Care solves every friction point.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all space-y-4 luxury-sheen shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Verified Photo Care
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Clean car photo timestamped right in your society parking bay. Wake up knowing your car is clean and ready.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all space-y-4 luxury-sheen shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Washer-Appointed Backup
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When your regular washer takes time off, they personally hand over and appoint a trusted peer from their team to care for your vehicle. Zero missed days.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all space-y-4 luxury-sheen shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Away & Travel Care
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Going somewhere? Find the nearest Torque Care washer wherever your car is parked and book daily care until you return.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/40 transition-all space-y-4 luxury-sheen shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">
                Sunday Priority Access
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Need your car spotless for a Sunday drive? One-tap priority request dispatches your washer with direct incentive payout.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE 2 PILLARS & UNIFIED VEHICLE HISTORY SECTION */}
      <section className="py-28 sm:py-36 bg-gradient-to-b from-[#080D1A] via-[#0B132B] to-[#080D1A] text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-20">
          {/* Section Header with generous clearance */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">
              The Two Pillars
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
              Torque Care — Your car. Cared for, wherever you go.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl mx-auto">
              Torque Care = recurring car care + verified service + nationwide partner network.
            </p>
          </div>

          {/* 2 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Pillar 1: Home */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white/5 border border-white/15 hover:border-blue-400/50 transition-all space-y-6 luxury-glass-dark luxury-sheen relative shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold">
                  <Home className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30">
                  Society Concierge
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white">Torque Care Home</h3>
                <div className="text-3xl font-black text-blue-400">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">Starting at</span>
                  ₹599<span className="text-sm font-medium text-slate-400">/month</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                For recurring society-based care. Clean car photo every morning before your commute, with trusted peer backup and zero missed days.
              </p>

              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Dedicated parking bay morning verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Washer-appointed peer backup guarantee</span>
                </div>
              </div>
            </div>

            {/* Pillar 2: Away */}
            <div className="p-8 sm:p-10 rounded-3xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-400/50 transition-all space-y-6 luxury-glass-dark luxury-sheen relative shadow-2xl">
              <div className="flex items-center justify-between">
                {/* Car on Road Sign */}
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex flex-col items-center justify-center font-bold relative">
                  <Car className="w-7 h-7" />
                  <div className="w-8 h-1 bg-amber-400/80 rounded-full mt-1 flex justify-center gap-0.5">
                    <span className="w-1.5 h-1 bg-slate-900 rounded-full" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-3 py-1 rounded-full font-bold">
                  Travel Mode
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-black text-white">Torque Care Away</h3>
                <div className="text-3xl font-black text-amber-400">
                  <span className="text-xs font-semibold text-slate-300 block mb-1">Starting at</span>
                  ₹39<span className="text-sm font-medium text-slate-300">/wash or Book Until Return</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                For washes while travelling. Open the app in any city, pick nearest verified partner, and book until you return.
              </p>

              <div className="pt-4 border-t border-white/10 space-y-2.5 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Nationwide partner network in 15+ cities</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Book Until Return multi-day automation</span>
                </div>
              </div>
            </div>
          </div>

          {/* UNIFIED VEHICLE HISTORY SPOTLIGHT */}
          <div className="max-w-2xl mx-auto p-7 sm:p-9 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    Torque Care Vehicle History
                  </h4>
                  <p className="text-xs text-slate-400">
                    All services appear in one seamless timeline
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Live Audit Trail
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-400 font-bold">06 Oct</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-white font-bold">Delhi (Home)</span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">03 Oct</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-white font-bold">Jaipur (Away)</span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">30 Sep</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-white font-bold">Jaipur (Away)</span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-400 font-bold">28 Sep</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-white font-bold">Delhi (Home)</span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              </div>
            </div>

            <div className="text-center pt-2">
              <Link
                href="/auth/signup"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Experience Unified Car Care</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: THREE STEP HOW IT WORKS */}
      <section className="py-28 sm:py-36 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">
            Precision Execution
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
            How Torque Care Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            From seamless digital enrollment to your morning verified certificate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="relative p-8 bg-white/5 rounded-3xl border border-white/10 shadow-xl space-y-4 luxury-sheen">
            <span className="text-5xl font-black text-blue-400/40 block font-mono">01</span>
            <h3 className="text-xl font-bold text-white">Subscribe & Set Bay</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Add your vehicle and specify your parking bay. Choose a flexible monthly plan with zero lock-in.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative p-8 bg-white/5 rounded-3xl border border-white/10 shadow-xl space-y-4 luxury-sheen">
            <span className="text-5xl font-black text-emerald-400/40 block font-mono">02</span>
            <h3 className="text-xl font-bold text-white">Your Vehicle Gets Washed</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our trained partner follows gentle, scratch-safe microfiber care protocols for a spotless finish.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative p-8 bg-white/5 rounded-3xl border border-white/10 shadow-xl space-y-4 luxury-sheen">
            <span className="text-5xl font-black text-amber-400/40 block font-mono">03</span>
            <h3 className="text-xl font-bold text-white">Get Verified Proof</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Wake up to a verified clean car photo certificate with parking bay and time logged directly on your phone.
            </p>
          </div>
        </div>

        <div className="text-center mt-14">
          <Link
            href="/how-it-works"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <span>Learn about our replacement guarantee & missed-wash protection</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 4: APARTMENT VEHICLE SHOWCASE — SPLIT PRESENTATION */}
      <section className="py-24 sm:py-32 bg-slate-950/80 text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black uppercase tracking-widest text-blue-400">
                Operational Excellence
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Concentrated routes. <br />
                Consistent service.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                By clustering vehicles block-by-block within your gated community, our washers spend less time walking between parking spots and more time caring for your finish.
              </p>
              <div className="pt-2 flex flex-col gap-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Average wash duration: 10–12 minutes per car</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dedicated parking bay navigation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Offline photo caching for low-signal basements</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-16/10 rounded-3xl overflow-hidden border border-white/15 shadow-2xl group">
                <Image
                  src="/images/hero_car.jpg"
                  alt="Luxury vehicle showroom clean"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs">
                  <div className="bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 shadow-lg">
                    <span className="text-emerald-400 font-bold">100% Scratch-Safe</span>
                    <span className="text-slate-300 ml-2">Ceramic-safe microfiber</span>
                  </div>
                  <span className="text-slate-300 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 font-mono text-[11px]">
                    Green Valley Residency
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FINAL CTA BANNER — SPACIOUS & DISTINCT */}
      <section className="py-28 sm:py-36 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-8 luxury-sheen">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready for verified car care in your society?
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
              Join thousands of car owners enjoying clean vehicles and unquestionable proof every single morning.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-extrabold text-sm shadow-[0_10px_25px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
            >
              Get Started Now
            </Link>
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm border border-white/15 backdrop-blur-md transition-all hover:scale-105"
            >
              View Society Plans
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#050811] border-t border-white/10 py-14 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <span className="font-bold text-slate-300">Torque Care</span>
            <span>— Daily Verified Car Care</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/how-it-works" className="hover:text-slate-300 transition-colors">How It Works</Link>
            <Link href="/for-owners" className="hover:text-slate-300 transition-colors">For Owners</Link>
            <Link href="/pricing" className="hover:text-slate-300 transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-slate-300 transition-colors">About</Link>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
          <div>© 2026 Torque Care Technologies Inc.</div>
        </div>
      </footer>
    </div>
  );
}
