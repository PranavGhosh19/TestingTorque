'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-slate-100 overflow-hidden selection:bg-blue-500 selection:text-white py-20 sm:py-28">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase font-mono text-[11px] text-blue-300">
              Our Story & Philosophy
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Bringing Dignity & Verification <br />
            <span className="text-gradient-blue">to Urban Car Care</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Every morning before 7:00 AM, millions of vehicles in gated apartment societies undergo rushed, unverified cleaning. We created Torque Care to transform this broken daily ritual.
          </p>
        </div>

        {/* STORY CARD */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 text-sm sm:text-base text-slate-300 leading-relaxed luxury-sheen relative">
          <p className="text-lg sm:text-xl text-white font-medium leading-relaxed">
            Car owners felt frustrated by swirl marks, dry cloth scratches, missed days, and zero accountability. Washers felt undervalued, trapped in low-paying arrangements where they spent half their time chasing late monthly cash payments instead of taking pride in their craft.
          </p>
          <p>
            We created <strong>Torque Care</strong> with one clear mission: <em className="text-white">Your car. Always cared for.</em> By introducing verified morning photos, clustered neighborhood routes, washer-appointed peer backup coverage, and 100% Sunday bonus payments, we ensure owners wake up to spotless vehicles while care technicians earn predictable, dignified livelihoods.
          </p>
          <p>
            Whether your vehicle is parked in your society basement or parked at a hotel during out-of-town travel, Torque Care unifies your automotive maintenance under one verifiable standard of excellence.
          </p>
        </div>

        {/* 3 CORE STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-400/40 backdrop-blur-xl shadow-2xl transition-all text-center space-y-2 luxury-sheen relative">
            <div className="text-4xl font-black text-white">100%</div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-300">Photo Verified</div>
            <p className="text-xs text-slate-400 mt-1">Every wash logged with parking bay proof & timestamps</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-400/40 backdrop-blur-xl shadow-2xl transition-all text-center space-y-2 luxury-sheen relative">
            <div className="text-4xl font-black text-emerald-400">Peer Assigned</div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Leave Backup Protocol</div>
            <p className="text-xs text-slate-400 mt-1">Primary washer assigns a trusted peer to cover, else money is credited</p>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-2xl transition-all text-center space-y-2 luxury-sheen relative">
            <div className="text-4xl font-black text-amber-400">Zero Loss</div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Missed-Wash Credit</div>
            <p className="text-xs text-slate-400 mt-1">Never pay for absent washers — automated credit applied if unverified</p>
          </div>
        </div>


        {/* BOTTOM CTA BANNER */}
        <div className="p-10 sm:p-14 rounded-3xl bg-linear-to-r from-blue-900/30 via-white/5 to-[#080D1A] border border-white/15 backdrop-blur-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 luxury-sheen relative text-center sm:text-left">
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">
              Discover the new standard of vehicle care.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Join thousands of owners enjoying spotless cars every single morning.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 shrink-0">
            <Link
              href="/pricing"
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs transition-all hover:scale-105"
            >
              View Pricing
            </Link>
            <Link
              href="/"
              className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/15 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
