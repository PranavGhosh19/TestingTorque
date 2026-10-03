'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">
      <Navbar />

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
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-xs shadow-md transition-all active:scale-95"
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
    </div>
  );
}
