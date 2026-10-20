'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Check,
  X,
  AlertTriangle,
  CheckCircle2,
  Car,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  HelpCircle,
  Calculator,
  FileSpreadsheet,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function CarWashTrackingGuidePage() {
  // Interactive calendar demonstration state
  const [selectedDay, setSelectedDay] = useState<number | null>(18);
  const [demoWashes, setDemoWashes] = useState<{ [day: number]: 'done' | 'missed' | 'off' }>({
    1: 'done', 2: 'done', 3: 'done', 4: 'off', 5: 'done',
    6: 'done', 7: 'missed', 8: 'done', 9: 'done', 10: 'done',
    11: 'off', 12: 'done', 13: 'done', 14: 'missed', 15: 'done',
    16: 'done', 17: 'done', 18: 'done', 19: 'done', 20: 'done',
    21: 'done', 22: 'done', 23: 'done', 24: 'missed', 25: 'off',
    26: 'done', 27: 'done', 28: 'done', 29: 'done', 30: 'done',
  });

  const toggleDayStatus = (day: number) => {
    setDemoWashes((prev) => {
      const current = prev[day] || 'done';
      const nextStatus = current === 'done' ? 'missed' : current === 'missed' ? 'off' : 'done';
      return { ...prev, [day]: nextStatus };
    });
    setSelectedDay(day);
  };

  const doneCount = Object.values(demoWashes).filter((s) => s === 'done').length;
  const missedCount = Object.values(demoWashes).filter((s) => s === 'missed').length;
  const offCount = Object.values(demoWashes).filter((s) => s === 'off').length;

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Hero Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Product Guide • Attendance &amp; Records</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Daily Car Wash Tracking: Attendance, Records &amp; Proof
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Understand how daily car wash tracking works. Replace memory and month-end arguments with a clean, reliable record of every wash completed, skipped, or scheduled off.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/auth/signup"
              className="px-7 py-3 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>Track Your Car for Free</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/car-wash-payment-calculator"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2"
            >
              <Calculator className="w-3.5 h-3.5 text-[#2DD4A0]" />
              <span>Payment Calculator</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-20">

        {/* ========================================================= */}
        {/* INTERACTIVE CALENDAR DEMONSTRATION */}
        {/* ========================================================= */}
        <section className="bg-[#11161D] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
                INTERACTIVE DEMO
              </span>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                The Monthly Wash Calendar in Action
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mt-0.5">
                Click any day below to toggle between Washed (Green), Missed (Amber), and Scheduled Rest Day (Gray).
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] flex items-center gap-1.5 font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{doneCount} Washed</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1.5 font-bold">
                <X className="w-3.5 h-3.5 stroke-[3]" />
                <span>{missedCount} Missed</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 flex items-center gap-1.5">
                <span>{offCount} Rest Days</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid Demo */}
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[11px] font-mono font-bold text-white/40 pb-1">
              <div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div><div className="text-white/60">SUN</div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const status = demoWashes[day] || 'done';
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDayStatus(day)}
                    className={`relative p-2 sm:p-3.5 rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-white/40' : ''
                    } ${
                      status === 'done'
                        ? 'bg-[#2DD4A0]/15 border-[#2DD4A0]/40 text-[#2DD4A0] hover:bg-[#2DD4A0]/25'
                        : status === 'missed'
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 hover:bg-amber-500/25'
                        : 'bg-white/[0.02] border-white/10 text-white/40 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-mono font-bold opacity-80">{day}</span>
                    <div className="mt-1">
                      {status === 'done' && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />}
                      {status === 'missed' && <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />}
                      {status === 'off' && <span className="text-[9px] sm:text-[10px] font-mono">OFF</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Inspection Feedback */}
          {selectedDay && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                  demoWashes[selectedDay] === 'done'
                    ? 'bg-[#2DD4A0]/20 text-[#2DD4A0]'
                    : demoWashes[selectedDay] === 'missed'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-white/10 text-white/50'
                }`}>
                  {selectedDay}
                </div>
                <div>
                  <div className="font-bold text-white">
                    Day {selectedDay} Status: {demoWashes[selectedDay] === 'done' ? 'Cleaned & Verified' : demoWashes[selectedDay] === 'missed' ? 'Missed Wash (Eligible for Deduction)' : 'Scheduled Weekly Rest Day'}
                  </div>
                  <div className="text-[11px] text-white/50">
                    {demoWashes[selectedDay] === 'done'
                      ? 'Recorded via daily morning Yes / No response.'
                      : demoWashes[selectedDay] === 'missed'
                      ? 'Automatically calculated in month-end billing audit.'
                      : 'Non-working day agreed in advance with cleaner.'}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-white/40 font-mono">
                Click day again to cycle status
              </div>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* HOW TORQUE CARE TRACKING WORKS: 3 SIMPLE PRINCIPLES */}
        {/* ========================================================= */}
        <section className="space-y-12">
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              METHODOLOGY
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white uppercase font-automotive-title">
              Why Daily Tracking Works Better Than Monthly Guesswork
            </h2>
            <p className="text-base text-white/65 leading-relaxed font-normal">
              Most car owners try to remember 30 days of cleaning at the end of the month. The cleaner claims they only missed one Sunday; you remember finding bird droppings on your windshield multiple weekdays. Both sides leave feeling cheated.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0] font-mono font-bold text-lg">
                01
              </div>
              <h3 className="text-xl font-bold text-white">1-Tap Daily Check</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Every morning, Torque Care asks a simple question: &ldquo;Was your car washed today?&rdquo; Answering takes 2 seconds. If you don&apos;t answer by day&apos;s end, the system records it as washed.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0] font-mono font-bold text-lg">
                02
              </div>
              <h3 className="text-xl font-bold text-white">Zero Arguments</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                By tracking daily when memory is fresh, discrepancies are resolved immediately — not 28 days later when nobody remembers whether it rained or the cleaner took a leave.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0] font-mono font-bold text-lg">
                03
              </div>
              <h3 className="text-xl font-bold text-white">Fair Monthly Payout</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                At the end of the month, Torque Care compiles your complete service audit. You pay your cleaner exactly what they earned based on actual washes delivered.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* WHAT COUNTS AS A MISSED WASH */}
        {/* ========================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#121924] via-[#0E141D] to-[#0A0D12] border border-white/[0.08] space-y-8">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              STANDARDS &amp; DEFINITIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              What Counts as an Eligible Missed Wash?
            </h2>
            <p className="text-xs sm:text-sm text-white/60">
              Clear rules keep tracking objective and respectful for both car owner and society washer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Eligible for Deduction (Missed Wash)</span>
              </div>
              <ul className="text-xs text-white/70 space-y-2 list-disc list-inside leading-relaxed">
                <li>Washer does not show up on a scheduled working day.</li>
                <li>No substitute or backup cleaner was assigned.</li>
                <li>The car was parked in its designated bay before the agreed morning cutoff.</li>
                <li>The owner was not informed in advance of an unavoidable delay.</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-emerald-500/20 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Not a Missed Wash (Non-Deductible)</span>
              </div>
              <ul className="text-xs text-white/70 space-y-2 list-disc list-inside leading-relaxed">
                <li>Agreed weekly rest days (e.g. regular Sunday off).</li>
                <li>Official festival holidays mutually agreed in society rules.</li>
                <li>The vehicle was driven away before the morning wash window.</li>
                <li>Access to the parking bay was blocked or water supply was cut off by society.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CROSS-LINKS & CONVERSION */}
        {/* ========================================================= */}
        <section className="border-t border-white/[0.08] pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Start Tracking Your Car Tomorrow Morning
            </h3>
            <p className="text-sm text-white/65 leading-relaxed">
              Register in under 60 seconds with your Google account. Keep your existing cleaner and stop overpaying for skipped washes.
            </p>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/auth/signup"
              className="px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>Get Torque Care</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
            <Link
              href="/car-wash-tracking-template"
              className="px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#2DD4A0]" />
              <span>Download Excel Template</span>
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
            <span>• Daily Car Wash Tracking &amp; Records</span>
          </div>

          <div className="flex items-center gap-6 text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/car-wash-payment-calculator" className="hover:text-white">Calculator</Link>
            <Link href="/car-wash-tracking" className="text-[#2DD4A0] font-bold">Tracking Guide</Link>
            <Link href="/car-wash-tracking-template" className="hover:text-white">Free Template</Link>
            <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
          </div>

          <div>© 2026 Torque Care. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
