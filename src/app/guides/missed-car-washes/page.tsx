'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Calculator,
  ShieldCheck,
  MessageSquare,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function MissedCarWashesGuidePage() {
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null);

  const copyTemplate = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplate(index);
    setTimeout(() => setCopiedTemplate(null), 2500);
  };

  const templates = [
    {
      title: 'Polite Morning Check-In (When Wash Was Skipped)',
      context: 'Send if your car is unwashed after the agreed morning time.',
      text: 'Hi Bhaiya, noticed the car wasn’t cleaned this morning (Honda City, Bay B-204). Hope all is well. Please let me know if you will be coming later today or if someone else is covering. Thank you!',
    },
    {
      title: 'Advance Notification of Owner Vacation',
      context: 'Send 2–3 days before traveling out of town.',
      text: 'Hi Bhaiya, I will be out of town from Friday to Tuesday. Please skip washing my car during these days. We can adjust the days accordingly in the month-end calculation. Thanks!',
    },
    {
      title: 'Respectful Month-End Payment Settlement',
      context: 'Send along with UPI payment at the end of the month.',
      text: 'Hi Bhaiya, transferring ₹433 for this month via UPI. Breakdown: 30 days total - 4 scheduled Sundays - 2 missed washes (7th & 19th) = 24 washes completed. Thank you for taking care of the car!',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Hero Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide • Society Car Care &amp; Dispute Prevention</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            How to Track Missed Car Washes Fairly
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Understand the difference between scheduled rest days, owner skips, and missed visits. Learn how to handle deductions respectfully without damaging your relationship with your cleaner.
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <Link
              href="/car-wash-payment-calculator"
              className="px-6 py-3 rounded-full bg-[#2DD4A0] hover:bg-[#25ba8c] text-slate-950 font-bold text-xs uppercase tracking-wider transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Payment Calculator</span>
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 flex items-center gap-2"
            >
              <span>Track With Torque Care</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Guide Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">

        {/* Section 1: The Three Categories of Non-Wash Days */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              CHAPTER 01
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              The Three Types of Non-Wash Days
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Before deducting any money from your cleaner&apos;s monthly fee, it is essential to distinguish between the three distinct reasons why a car was not washed on a particular day.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Type 1 */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                  <span>1. Scheduled Rest Days (Non-Deductible)</span>
                </h3>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white/60">
                  Agreed In Advance
                </span>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                Most apartment cleaners wash dozens of cars every morning and require one weekly rest day (often Sunday or Tuesday) to rest and wash cloths. These are planned non-service days agreed when you hired them. They should not be counted as missed visits.
              </p>
            </div>

            {/* Type 2 */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>2. Owner-Requested Skips (Mutual Agreement)</span>
                </h3>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                  Owner Out Of Town
                </span>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                If you take your car on a road trip or leave town for a week, you may request the washer to pause service. Depending on your agreement, some owners pay a 50% retainer to hold their slot, while others deduct the days entirely. Agree on this policy in advance.
              </p>
            </div>

            {/* Type 3 */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-amber-500/30 bg-amber-500/[0.02] space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>3. Unannounced Missed Washes (Eligible for Deduction)</span>
                </h3>
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Deduction Eligible
                </span>
              </div>
              <p className="text-xs text-white/65 leading-relaxed">
                When the washer was scheduled to clean your vehicle, your car was parked in its bay before the agreed morning time, but the washer did not show up and no backup worker was sent. These days are eligible for a per-day deduction based on your agreed monthly rate.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Step-by-Step Resolution Workflow */}
        <section className="space-y-6 border-t border-white/[0.08] pt-12">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              CHAPTER 02
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              How to Handle Deductions Respectfully
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Apartment car washers work hard in demanding conditions. Disagreements usually arise from poor memory, not dishonesty. Follow these four steps for smooth month-end settlements.
            </p>
          </div>

          <div className="space-y-4 text-xs text-white/70">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
              <div className="font-bold text-white text-sm">Step 1: Track each morning, not at month-end</div>
              <p className="leading-relaxed">
                Never try to remember missed washes 3 weeks later. When you leave for work in the morning, glance at your windshield. If it wasn&apos;t washed, note it down immediately or tap No on Torque Care.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
              <div className="font-bold text-white text-sm">Step 2: Know the math before having the conversation</div>
              <p className="leading-relaxed">
                Use our <Link href="/car-wash-payment-calculator" className="text-[#2DD4A0] font-bold underline">Payment Calculator</Link> to calculate the exact per-day deduction beforehand (e.g. ₹500 fee ÷ 30 days = ₹16.67 per day). When numbers are exact, negotiations are painless.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-1.5">
              <div className="font-bold text-white text-sm">Step 3: Send a clear WhatsApp payment summary</div>
              <p className="leading-relaxed">
                Instead of arguing in the basement parking lot, send a polite WhatsApp message along with your UPI payment screenshot showing the dates and math clearly.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Ready-to-Use WhatsApp Communication Templates */}
        <section className="space-y-6 border-t border-white/[0.08] pt-12">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              CHAPTER 03
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase font-automotive-title">
              Ready-to-Use WhatsApp Templates
            </h2>
            <p className="text-sm text-white/65 leading-relaxed">
              Copy and paste these polite message templates into your chat with your car cleaner.
            </p>
          </div>

          <div className="space-y-4">
            {templates.map((tpl, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{tpl.title}</div>
                  <button
                    type="button"
                    onClick={() => copyTemplate(tpl.text, idx)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[11px] font-mono font-bold text-[#2DD4A0] flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedTemplate === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-white/60" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[11px] text-white/50">{tpl.context}</div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-white/80 leading-relaxed">
                  &ldquo;{tpl.text}&rdquo;
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Automating with Torque Care */}
        <section className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#121924] via-[#0E141D] to-[#0A0D12] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-lg text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Automate All of This with Torque Care
            </h3>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
              Keep your existing washer. Answer one quick question each morning: &ldquo;Was your car washed?&rdquo; We calculate the calendar and monthly audit automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/auth/signup"
              className="px-7 py-3.5 rounded-full bg-white text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-all hover:scale-105 shadow-md flex items-center gap-2"
            >
              <span>Get Torque Care</span>
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
            <span>• Missed Car Washes Guide</span>
          </div>

          <div className="flex items-center gap-6 text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/car-wash-payment-calculator" className="hover:text-white">Calculator</Link>
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
