'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Sparkles, Compass, Eye } from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';
import TorqueEmblem from '@/components/brand/TorqueEmblem';
import TorqueAppIcon from '@/components/brand/TorqueAppIcon';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">

      {/* AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-[#2DD4A0]/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 space-y-16 sm:space-y-20">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] shadow-md text-xs font-semibold text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
            <span className="tracking-[0.2em] uppercase font-mono text-[10px] text-[#2DD4A0]">
              OUR PHILOSOPHY & STORY
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Bringing Dignity & Verification to Urban Car Care
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Every morning before 7:00 AM, millions of vehicles in gated apartment societies undergo rushed, unverified cleaning. We created Torque Care to transform this broken daily ritual.
          </p>
        </div>

        {/* STORY CARD */}
        <div className="p-8 sm:p-12 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-6 text-sm sm:text-base text-white/70 leading-relaxed relative">
          <p className="text-lg sm:text-xl text-white font-medium leading-relaxed">
            Car owners felt frustrated by swirl marks, dry cloth scratches, missed days, and zero accountability. Washers felt undervalued, trapped in low-paying arrangements where they spent half their time chasing late monthly cash payments instead of taking pride in their craft.
          </p>
          <p>
            We created <strong className="text-white">Torque Care</strong> with one clear mission: <em className="text-white">Your car. Always cared for.</em> By introducing verified morning photos, clustered neighborhood routes, washer-appointed peer backup coverage, and 100% Sunday bonus payments, we ensure owners wake up to spotless vehicles while care technicians earn predictable, dignified livelihoods.
          </p>
          <p>
            Whether your vehicle is parked in your society basement or parked at a hotel during out-of-town travel, Torque Care unifies your automotive maintenance under one verifiable standard of excellence.
          </p>
        </div>

        {/* 3 CORE STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl transition-all text-center space-y-2 relative">
            <div className="text-4xl font-bold text-white">100%</div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#2DD4A0]">Photo Verified</div>
            <p className="text-xs text-white/60 mt-1">Every wash logged with parking bay proof & timestamps</p>
          </div>

          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl transition-all text-center space-y-2 relative">
            <div className="text-4xl font-bold text-[#2DD4A0]">Peer Assigned</div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">Leave Backup Protocol</div>
            <p className="text-xs text-white/60 mt-1">Primary washer assigns a trusted peer to cover, else money is credited</p>
          </div>

          <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl transition-all text-center space-y-2 relative">
            <div className="text-4xl font-bold text-white">Zero Loss</div>
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">Missed-Wash Credit</div>
            <p className="text-xs text-white/60 mt-1">Never pay for absent washers — automated credit applied if unverified</p>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BRAND IDENTITY & DESIGN SYSTEM SPOTLIGHT                         */}
        {/* ================================================================= */}
        <div className="p-8 sm:p-12 rounded-[24px] bg-[#11161D] border border-white/[0.08] space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#2DD4A0] block mb-1 font-bold">
                VISUAL IDENTITY & AERODYNAMICS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                The Anatomy of the Torque Care Emblem
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60 max-w-md">
              Designed as a true automotive performance badge — engineered to belong on steering wheels, fenders, and key fobs rather than a generic SaaS website.
            </p>
          </div>

          {/* HERO EMBLEM LOCKUP SHOWCASE */}
          <div className="p-10 sm:p-14 rounded-[20px] bg-[#0A0D12] border border-white/[0.08] flex items-center justify-center shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#2DD4A0_1px,transparent_1px)] opacity-10 [background-size:24px_24px] pointer-events-none" />
            <div className="relative z-10 flex items-center justify-center scale-110 sm:scale-125">
              <TorqueLogo emblemSize={68} />
            </div>
          </div>

          {/* 4 CORE DESIGN INGREDIENTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-[20px] bg-[#161C25] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2DD4A0]" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Shield Emblem
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Car lovers recognize performance badges from steering wheels, fenders, and key fobs. It reads as a luxury automotive brand, not a commodity startup.
              </p>
            </div>

            <div className="p-6 rounded-[20px] bg-[#161C25] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2DD4A0]" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Angular &apos;T&apos;
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                The chamfered crossbar echoes a fastback roofline. The tapered stem mirrors an aerodynamic blade and front intake grille.
              </p>
            </div>

            <div className="p-6 rounded-[20px] bg-[#161C25] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2DD4A0]" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#2DD4A0]">
                  Two Mint Slashes
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Headlight and DRL (daytime running light) signatures. When seen at a glance, it evokes a supercar&apos;s face at night. Mint is also the hallmark verified state.
              </p>
            </div>

            <div className="p-6 rounded-[20px] bg-[#161C25] border border-white/[0.06] space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2DD4A0]" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Spec-sheet Wordmark
                </h3>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                <strong className="text-white">TORQUE</strong> is bold and wide-tracked with a slanted mint baseline. <strong className="text-white/60">CARE</strong> is feather-light and grey, like an engineering spec line.
              </p>
            </div>
          </div>

          {/* 3 VARIANT APPLICATIONS (App Icon, On Light, On Mint) */}
          <div className="space-y-4 pt-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 block">
              Application Environments
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* App Icon */}
              <div className="p-6 rounded-[20px] bg-[#161C25] border border-white/[0.08] flex flex-col items-center justify-center space-y-4">
                <TorqueAppIcon size={76} variant="dark" />
                <span className="text-xs font-mono text-white/70 font-bold">App Icon</span>
              </div>

              {/* On Light */}
              <div className="p-6 rounded-[20px] bg-slate-100 border border-slate-200 flex flex-col items-center justify-center space-y-4">
                <TorqueAppIcon size={76} variant="light" />
                <span className="text-xs font-mono text-slate-800 font-bold">On Light</span>
              </div>

              {/* On Mint */}
              <div className="p-6 rounded-[20px] bg-[#2DD4A0] border border-[#2DD4A0]/40 flex flex-col items-center justify-center space-y-4">
                <TorqueAppIcon size={76} variant="mint" />
                <span className="text-xs font-mono text-[#0A0D12] font-bold">On Mint</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="p-10 sm:p-12 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative text-center sm:text-left">
          <div className="space-y-1.5">
            <h3 className="text-2xl font-bold text-white">
              Discover the new standard of vehicle care.
            </h3>
            <p className="text-xs sm:text-sm text-white/60">
              Register your vehicle in 2 minutes or partner with our society network.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Get Started
            </Link>
            <Link
              href="/for-washers"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#161C25] hover:bg-white/10 text-white font-bold text-xs border border-white/[0.08] transition-all flex items-center justify-center gap-1.5"
            >
              <span>Join as Partner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] py-14 px-4 sm:px-6 lg:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={32} />
            </Link>
            <span className="text-white/40 text-[11px] hidden md:inline font-mono">
              — Verified Society Car Care
            </span>
          </div>

          <div className="flex items-center gap-6 text-white/65">
            <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/for-owners" className="hover:text-white transition-colors">Car Owners</Link>
            <Link href="/for-washers" className="hover:text-white transition-colors">For Washers</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>

          <div>© 2026 Torque Care Technologies Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
