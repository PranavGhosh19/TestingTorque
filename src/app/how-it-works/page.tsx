'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Check,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Smartphone,
  HeartHandshake,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Hero Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How It Works • Product Philosophy</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            How Torque Care Works
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Torque Care helps apartment car owners maintain a daily record of their car cleaning, track missed washes, and understand their monthly payments — without replacing their existing cleaner.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/signup"
              className="px-7 py-3 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>Start Tracking for Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/car-wash-payment-calculator"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-[#2DD4A0]" />
              <span>Try Payment Calculator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ========================================================= */}
        {/* THE 3-STEP PROCESS */}
        {/* ========================================================= */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              SIMPLE &amp; FRICTIONLESS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase font-automotive-title">
              Three Simple Steps to Fair Car Care
            </h2>
            <p className="text-sm text-white/60 leading-relaxed">
              No complicated sensors, no intrusive cameras, and no awkward negotiations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4 relative overflow-hidden">
              <span className="text-4xl font-mono font-bold text-[#2DD4A0]">01</span>
              <h3 className="text-xl font-bold text-white">Register in 60 Seconds</h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                Sign in with Google, add your vehicle details, and optionally specify your society. Keep your existing cleaner — we don&apos;t change your setup.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4 relative overflow-hidden">
              <span className="text-4xl font-mono font-bold text-[#2DD4A0]">02</span>
              <h3 className="text-xl font-bold text-white">1-Tap Daily Check (Yes / No)</h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                Each morning, answer a quick prompt: &ldquo;Was your car washed today?&rdquo; If it was missed, tap No. If you don&apos;t open the app by midnight, it is safely recorded as washed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4 relative overflow-hidden">
              <span className="text-4xl font-mono font-bold text-[#2DD4A0]">03</span>
              <h3 className="text-xl font-bold text-white">Analyse &amp; Pay Fairly</h3>
              <p className="text-xs sm:text-sm text-white/65 leading-relaxed">
                At the end of the month, view your complete service breakdown with every missed wash calculated. Settle with your cleaner accurately via a 1-click summary card.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* WHAT TORQUE CARE DOES AND DOES NOT DO */}
        {/* ========================================================= */}
        <section className="bg-[#11161D] border border-white/[0.08] rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              TRANSPARENCY MANIFESTO
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              What Torque Care Does (and Does NOT Do)
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              We believe in extreme product honesty. Here is our clear commitment to car owners and society workers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* What we do */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-[#2DD4A0]/20 space-y-4">
              <div className="flex items-center gap-2 text-[#2DD4A0] font-bold text-sm">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>What Torque Care DOES</span>
              </div>
              <ul className="text-xs text-white/70 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0 mt-0.5" />
                  <span>Maintains a transparent, objective daily wash calendar for your vehicle.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0 mt-0.5" />
                  <span>Tracks missed washes when your cleaner is unavailable or takes unauthorized leave.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0 mt-0.5" />
                  <span>Calculates fair daily deductions so you only pay for actual washes received.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0 mt-0.5" />
                  <span>Provides respectful, shareable monthly summaries for easy WhatsApp settlements.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#2DD4A0] shrink-0 mt-0.5" />
                  <span>Completely 100% free for individual car owners.</span>
                </li>
              </ul>
            </div>

            {/* What we do not do */}
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-rose-500/20 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <X className="w-4 h-4 stroke-[3]" />
                <span>What Torque Care DOES NOT Do</span>
              </div>
              <ul className="text-xs text-white/70 space-y-3 leading-relaxed">
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>We do NOT replace your existing car cleaner with our own agency.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>We do NOT require intrusive cameras, IoT sensors, or expensive hardware.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>We do NOT take commissions or cuts from your cleaner&apos;s hard-earned monthly pay.</span>
                </li>
                <li className="flex items-start gap-2">
                  <X className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>We do NOT penalize scheduled weekly rest days (e.g. regular Sunday off).</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* THE SOCIETY DISTRIBUTION LOOP */}
        {/* ========================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#121924] via-[#0E141D] to-[#0A0D12] border border-white/[0.08] space-y-6">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              APARTMENT COMMUNITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              Why Apartment Societies Love Torque Care
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              When residents in a building track with Torque Care, informal cleaners take attendance seriously. Attendance reliability jumps from 70% to over 95% within the first month.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="text-lg font-bold text-white font-mono text-[#2DD4A0]">95%+</div>
              <div className="text-xs font-bold text-white">Consistent Attendance</div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                When cleaners know tracking is active, unannounced skips virtually disappear.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white font-mono text-[#2DD4A0]">Zero</div>
              <div className="text-xs font-bold text-white">Month-End Arguments</div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Every deduction has an exact date and clear record, removing confrontation.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold text-white font-mono text-[#2DD4A0]">Fair</div>
              <div className="text-xs font-bold text-white">Respect for Workers</div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Cleaners who show up every day get paid promptly in full without random haggling.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CONVERSION CALL TO ACTION */}
        {/* ========================================================= */}
        <section className="border-t border-white/[0.08] pt-16 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              Know when it was washed. Keep track of what you pay.
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Register in under 60 seconds. Track your car tomorrow morning with a simple Yes / No.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>Start Tracking Your Car</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 text-xs text-white/40 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={30} />
            </Link>
            <span>• How Torque Care Works</span>
          </div>

          <div className="flex items-center gap-6 text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/car-wash-payment-calculator" className="hover:text-white">Calculator</Link>
            <Link href="/car-wash-tracking" className="hover:text-white">Tracking Guide</Link>
            <Link href="/car-wash-tracking-template" className="hover:text-white">Free Template</Link>
            <Link href="/how-it-works" className="text-[#2DD4A0] font-bold">How It Works</Link>
          </div>

          <div>© 2026 Torque Care. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
