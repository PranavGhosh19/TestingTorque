'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calculator,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
  TrendingDown,
  Clock,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  Share2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function CarWashPaymentCalculatorPage() {
  // Input states
  const [monthlyFee, setMonthlyFee] = useState<number>(500);
  const [daysInPeriod, setDaysInPeriod] = useState<28 | 30 | 31>(30);
  const [scheduledHolidays, setScheduledHolidays] = useState<number>(4);
  const [eligibleMissedWashes, setEligibleMissedWashes] = useState<number>(6);
  const [paymentMethod, setPaymentMethod] = useState<'per_day_calendar' | 'per_day_working' | 'fixed'>('per_day_calendar');
  const [copied, setCopied] = useState<boolean>(false);

  // Calculations
  const calculation = useMemo(() => {
    const fee = Math.max(0, monthlyFee || 0);
    const totalDays = daysInPeriod;
    const holidays = Math.min(totalDays, Math.max(0, scheduledHolidays || 0));
    const plannedWorkingDays = Math.max(0, totalDays - holidays);
    const missed = Math.min(plannedWorkingDays, Math.max(0, eligibleMissedWashes || 0));
    const completedWashes = Math.max(0, plannedWorkingDays - missed);

    let payableAmount = 0;
    let deductionAmount = 0;
    let ratePerDay = 0;

    if (paymentMethod === 'fixed') {
      payableAmount = fee;
      deductionAmount = 0;
      ratePerDay = completedWashes > 0 ? fee / completedWashes : 0;
    } else if (paymentMethod === 'per_day_working') {
      // Fee divided only among scheduled working days
      ratePerDay = plannedWorkingDays > 0 ? fee / plannedWorkingDays : 0;
      payableAmount = completedWashes * ratePerDay;
      deductionAmount = missed * ratePerDay;
    } else {
      // Standard illustrative rule: fee divided across all calendar days,
      // and owner pays for delivered washes (Total - Holidays - Missed)
      // Exactly matches: 500 fee, 30 days, 4 holidays, 6 missed -> 20 active days = 500 * (20/30) = ₹333.33
      ratePerDay = totalDays > 0 ? fee / totalDays : 0;
      payableAmount = completedWashes * ratePerDay;
      deductionAmount = fee - payableAmount;
    }

    return {
      fee,
      totalDays,
      holidays,
      plannedWorkingDays,
      missed,
      completedWashes,
      ratePerDay,
      payableAmount: Math.round(payableAmount * 100) / 100,
      deductionAmount: Math.round(deductionAmount * 100) / 100,
      completionRate: plannedWorkingDays > 0 ? Math.round((completedWashes / plannedWorkingDays) * 100) : 0,
    };
  }, [monthlyFee, daysInPeriod, scheduledHolidays, eligibleMissedWashes, paymentMethod]);

  const handleCopySummary = () => {
    const summaryText = `🚗 Monthly Car Wash Payment Summary\n` +
      `• Agreed Monthly Fee: ₹${calculation.fee}\n` +
      `• Billing Period: ${calculation.totalDays} Days\n` +
      `• Washer Scheduled Holidays: ${calculation.holidays} Days\n` +
      `• Missed Washes: ${calculation.missed} Days\n` +
      `• Washes Delivered: ${calculation.completedWashes} Washes (${calculation.completionRate}%)\n` +
      `• Total Deductions: ₹${calculation.deductionAmount.toFixed(2)}\n` +
      `• Estimated Amount Payable: ₹${calculation.payableAmount.toFixed(2)}\n\n` +
      `Calculated fairly using Torque Care: https://torquecare.com/car-wash-payment-calculator`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const feePresets = [400, 500, 600, 800, 1000];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      <Navbar />

      {/* Hero Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5" />
            <span>Free Utility • No Signup Required</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Monthly Car Wash Payment Calculator
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Calculate fair monthly deductions for missed washes and scheduled holidays. Stop guessing or arguing at month-end — know exactly what you owe your existing car cleaner.
          </p>
        </div>
      </header>

      {/* Main Interactive Tool Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================= */}
          {/* LEFT: INPUTS PANEL */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 bg-[#11161D] border border-white/[0.08] rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl">
            
            <div className="border-b border-white/[0.08] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Billing Parameters</h2>
                <p className="text-xs text-white/50">Enter the terms agreed with your existing society cleaner</p>
              </div>
              <span className="text-[11px] font-mono text-[#2DD4A0] bg-[#2DD4A0]/10 px-2.5 py-1 rounded-full border border-[#2DD4A0]/20 font-bold">
                Live Calculation
              </span>
            </div>

            {/* 1. Monthly Car-Washing Fee */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="monthly-fee" className="text-sm font-semibold text-white/90 flex items-center gap-2">
                  <span>Monthly car-washing fee (₹)</span>
                </label>
                <span className="text-xs font-mono text-white/40">agreed monthly rate</span>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-mono text-base font-bold">₹</span>
                <input
                  id="monthly-fee"
                  type="number"
                  min="0"
                  step="50"
                  value={monthlyFee === 0 ? '' : monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  placeholder="500"
                  className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white font-mono text-lg font-bold focus:outline-none focus:border-[#2DD4A0] focus:ring-1 focus:ring-[#2DD4A0] transition-all"
                />
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] text-white/40 mr-1 font-mono">Popular:</span>
                {feePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setMonthlyFee(preset)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-medium transition-all ${
                      monthlyFee === preset
                        ? 'bg-[#2DD4A0] text-slate-950 font-bold shadow-md shadow-[#2DD4A0]/20'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Days in Billing Period */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white/90">
                  Days in billing period
                </label>
                <span className="text-xs font-mono text-white/40">{daysInPeriod} days</span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { value: 28, label: '28 Days', desc: 'February' },
                  { value: 30, label: '30 Days', desc: 'Standard Month' },
                  { value: 31, label: '31 Days', desc: 'Long Month' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setDaysInPeriod(p.value as 28 | 30 | 31)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      daysInPeriod === p.value
                        ? 'bg-[#2DD4A0]/15 border-[#2DD4A0] text-[#2DD4A0] shadow-md shadow-[#2DD4A0]/10 font-bold'
                        : 'bg-white/[0.03] border-white/10 text-white/70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <div className="font-mono text-base font-bold">{p.label}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Scheduled Holidays */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="scheduled-holidays" className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                    <span>Scheduled holidays / rest days</span>
                  </label>
                  <p className="text-[11px] text-white/50">Agreed off-days (e.g. 4 Sundays or washer&apos;s weekly rest day)</p>
                </div>
                <span className="text-base font-mono font-bold text-white px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                  {scheduledHolidays} days
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="scheduled-holidays"
                  type="range"
                  min="0"
                  max="10"
                  value={scheduledHolidays}
                  onChange={(e) => setScheduledHolidays(Number(e.target.value))}
                  className="w-full accent-[#2DD4A0] h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>0 days (no off-days)</span>
                <span>4 Sundays</span>
                <span>8 days (bi-weekly)</span>
              </div>
            </div>

            {/* 4. Eligible Missed Washes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="missed-washes" className="text-sm font-semibold text-white/90 flex items-center gap-1.5">
                    <span className="text-amber-400">●</span>
                    <span>Eligible missed washes</span>
                  </label>
                  <p className="text-[11px] text-white/50">Scheduled working days where car was skipped without cover</p>
                </div>
                <span className="text-base font-mono font-bold text-amber-400 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  {eligibleMissedWashes} missed
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="missed-washes"
                  type="range"
                  min="0"
                  max={Math.max(1, daysInPeriod - scheduledHolidays)}
                  value={eligibleMissedWashes}
                  onChange={(e) => setEligibleMissedWashes(Number(e.target.value))}
                  className="w-full accent-amber-400 h-2 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                <span>0 (flawless attendance)</span>
                <span>6 days missed</span>
                <span>{daysInPeriod - scheduledHolidays} days (all skipped)</span>
              </div>
            </div>

            {/* 5. Payment Rule Mode */}
            <div className="space-y-3 border-t border-white/[0.08] pt-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-white/90">
                  Payment calculation rule
                </label>
                <span className="text-xs text-white/40 font-mono">Deduction policy</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Method 1: Illustrative Per-Day Deduction */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('per_day_calendar')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'per_day_calendar'
                      ? 'bg-[#2DD4A0]/10 border-[#2DD4A0] text-white ring-1 ring-[#2DD4A0]/30'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#2DD4A0] font-mono uppercase tracking-wider">
                      Illustrative per-day deduction
                    </span>
                    {paymentMethod === 'per_day_calendar' && <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                  </div>
                  <div className="text-xs text-white/70 font-medium">Standard Calendar Ratio</div>
                  <p className="text-[11px] text-white/45 mt-1 leading-snug">
                    Fee divided across 30 days. Pay for delivered washes (Total − Holidays − Missed).
                  </p>
                </button>

                {/* Method 2: Working Days Only */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('per_day_working')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'per_day_working'
                      ? 'bg-[#2DD4A0]/10 border-[#2DD4A0] text-white ring-1 ring-[#2DD4A0]/30'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                      Working-days rate
                    </span>
                    {paymentMethod === 'per_day_working' && <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />}
                  </div>
                  <div className="text-xs text-white/70 font-medium">Rest Days Excluded</div>
                  <p className="text-[11px] text-white/45 mt-1 leading-snug">
                    Holidays excluded from rate base. Fee divided across planned working days only.
                  </p>
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT: LIVE ESTIMATE OUTPUT CARD */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-gradient-to-br from-[#131B26] via-[#10161F] to-[#0A0D12] border border-[#2DD4A0]/30 rounded-3xl p-6 sm:p-8 space-y-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#2DD4A0]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Title & Estimated Badge */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
                  ESTIMATED BILLABLE AMOUNT
                </span>
                <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
                  <span className="text-2xl text-[#2DD4A0]">₹</span>
                  <span>{calculation.payableAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-white/50 pt-1">
                  Estimated amount under the selected illustrative rule
                </p>
              </div>

              {/* Visual Breakdown Bar */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">Service Distribution</span>
                  <span className="text-[#2DD4A0] font-bold">{calculation.completedWashes} of {calculation.plannedWorkingDays} Washes Delivered</span>
                </div>

                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden flex">
                  {/* Completed Washes */}
                  <div
                    style={{ width: `${(calculation.completedWashes / calculation.totalDays) * 100}%` }}
                    className="bg-[#2DD4A0] h-full transition-all"
                    title={`Completed: ${calculation.completedWashes} days`}
                  />
                  {/* Missed Washes */}
                  <div
                    style={{ width: `${(calculation.missed / calculation.totalDays) * 100}%` }}
                    className="bg-amber-400 h-full transition-all"
                    title={`Missed: ${calculation.missed} days`}
                  />
                  {/* Scheduled Holidays */}
                  <div
                    style={{ width: `${(calculation.holidays / calculation.totalDays) * 100}%` }}
                    className="bg-white/20 h-full transition-all"
                    title={`Holidays: ${calculation.holidays} days`}
                  />
                </div>

                <div className="flex items-center gap-4 text-[10px] font-mono text-white/60 pt-1 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4A0]" />
                    <span>Done ({calculation.completedWashes})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Missed ({calculation.missed})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white/30" />
                    <span>Off-days ({calculation.holidays})</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Rows */}
              <div className="space-y-3 pt-3 border-t border-white/[0.08] text-xs">
                <div className="flex items-center justify-between text-white/70">
                  <span>Agreed monthly base fee:</span>
                  <span className="font-mono font-bold text-white">₹{calculation.fee}</span>
                </div>
                <div className="flex items-center justify-between text-white/70">
                  <span>Effective rate per wash:</span>
                  <span className="font-mono font-bold text-white">₹{calculation.ratePerDay.toFixed(2)} / day</span>
                </div>
                <div className="flex items-center justify-between text-amber-300">
                  <span>Missed wash deductions:</span>
                  <span className="font-mono font-bold text-amber-400">− ₹{calculation.deductionAmount.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-white/50 text-[11px] pt-1 border-t border-white/[0.06]">
                  <span>Attendance reliability:</span>
                  <span className="font-mono font-bold text-white/80">{calculation.completionRate}% completed</span>
                </div>
              </div>

              {/* Share & Copy Action Buttons */}
              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/15 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#2DD4A0]" />
                      <span className="text-[#2DD4A0]">Summary Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-white/70" />
                      <span>Copy Summary for WhatsApp</span>
                    </>
                  )}
                </button>
              </div>

              {/* Official Required Disclaimer */}
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-white/50 leading-relaxed space-y-1">
                <p className="font-bold text-white/60">Important Note:</p>
                <p>
                  This is a simplified estimate, not a binding bill. Actual charges depend on the agreed monthly fee, which days are billable, and whether missed washes qualify for deductions. Avoid counting a day twice.
                </p>
              </div>

            </div>

            {/* Bridge to Torque Care App */}
            <div className="p-6 rounded-3xl bg-[#11161D] border border-white/[0.08] space-y-4 text-center">
              <div className="w-10 h-10 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0] mx-auto">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Tired of manual math at month-end?</h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Torque Care tracks every wash with 1-tap daily confirmation (Yes / No). Maintain a clean record with your existing cleaner automatically.
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="w-full py-3.5 px-6 rounded-2xl bg-[#2DD4A0] hover:bg-[#25ba8c] text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,160,0.3)] hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Track Your Car for Free</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* EDUCATIONAL & SEO CONTENT SECTION */}
        {/* ========================================================= */}
        <section className="mt-20 sm:mt-28 border-t border-white/[0.08] pt-16 space-y-16">
          
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              PAYMENT TRANSPARENCY GUIDE
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              How Car Washer Monthly Payments Actually Work
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Most car owners in residential societies pay their cleaners a fixed monthly fee (typically between ₹400 and ₹800 per car). However, without daily attendance records, missed washes go unnoticed or lead to awkward discussions on the 1st of every month.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-3">
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2DD4A0]">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">1. Scheduled Rest Days</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Car cleaners are entitled to weekly rest days (most commonly Sundays or a designated weekday like Tuesday). These are agreed non-working days and are not penalized as missed washes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">2. Uncovered Missed Washes</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                When a washer skips an expected wash without providing a replacement or informing you, that day is an eligible missed wash. Deductions should reflect the effective daily rate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-3">
              <div className="w-8 h-8 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-white">3. Fair &amp; Transparent Billing</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Using an objective tracking record protects both sides. Washers get paid accurately for every day they worked, and car owners only pay for washes actually received.
              </p>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold text-white">Frequently Asked Questions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>How is the per-day deduction calculated?</span>
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  In a standard 30-day month with a ₹500 monthly fee, the daily rate is ₹16.67. If 6 eligible washes were missed, you deduct 6 × ₹16.67 = ₹100, resulting in an adjusted payment of ₹333.33 to ₹400 depending on your holiday agreement.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Do I need to replace my existing car washer?</span>
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Not at all. Torque Care is built specifically to work with your existing society cleaner. You simply keep track of their daily attendance so that monthly payments are fair and respectful for both parties.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>What if I was traveling out of town?</span>
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  If you requested the washer not to wash your car while away, policies vary by society. Some owners pay a 50% retainer, while others deduct the days. Discuss this upfront with your cleaner.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Can I download an Excel attendance spreadsheet?</span>
                </h4>
                <p className="text-xs text-white/60 leading-relaxed">
                  Yes! We provide a free monthly car wash tracking template for Excel and Google Sheets, as well as a printable daily checklist. Visit our <Link href="/car-wash-tracking-template" className="text-[#2DD4A0] underline font-bold">free template page</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Conversion Banner */}
          <div className="p-8 sm:p-12 rounded-3xl bg-[#11161D] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Start tracking with Torque Care today
              </h3>
              <p className="text-xs sm:text-sm text-white/60 max-w-lg">
                Join apartment owners across the city tracking daily car washes without disputes or guesswork.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/auth/signup"
                className="px-6 py-3.5 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md"
              >
                Track Your Car
              </Link>
              <Link
                href="/car-wash-tracking"
                className="px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10"
              >
                Tracking Guide
              </Link>
            </div>
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
            <span>• Fair Car Wash Payment Tracking</span>
          </div>

          <div className="flex items-center gap-6 text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/car-wash-payment-calculator" className="text-[#2DD4A0] font-bold">Calculator</Link>
            <Link href="/car-wash-tracking" className="hover:text-white">Tracking Guide</Link>
            <Link href="/car-wash-tracking-template" className="hover:text-white">Free Template</Link>
            <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
          </div>

          <div>© 2026 Torque Care. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
