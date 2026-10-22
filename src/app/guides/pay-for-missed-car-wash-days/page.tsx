'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  ShieldCheck,
  Copy,
  Check,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function PayForMissedCarWashDaysPage() {
  const [copiedScript, setCopiedScript] = useState<number | null>(null);

  const copyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(index);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const scripts = [
    {
      title: 'Standard Month-End Fair Deduction Message',
      scenario: 'Send via WhatsApp when transferring monthly UPI fee with missed day adjustments.',
      text: 'Hi Bhaiya, transferring ₹433 for this month via UPI. Calculation breakdown: Monthly ₹500 across 30 days minus 4 scheduled Sundays and 2 missed wash days (7th and 18th) = 24 washes completed. Thank you for your hard work!',
    },
    {
      title: 'Advance Notice For Vacation / Travel Days',
      scenario: 'Send 2 days before leaving for an out-of-town trip.',
      text: 'Hi Bhaiya, I will be out of town from Thursday to Monday. Please do not wash the car during these days. We will adjust these 4 days from the monthly total. Thanks for understanding!',
    },
    {
      title: 'Handling Friendly Disputes or Confusion',
      scenario: 'Send if the cleaner questions the deducted amount at month-end.',
      text: 'Hi Bhaiya, I have maintained a daily check on my Torque Care app every morning. The dates not washed were the 5th and 19th. If you had someone else cover for you on those dates, please let me know and I will gladly update it.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-white/50 mb-2">
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2DD4A0]">Payment &amp; Ethics</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Is It Fair to Pay for Missed Car Wash Days?
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Understand informal labor norms, how to calculate fair daily deduction rates, and how to settle payments respectfully without confrontation.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-white/40 pt-2">
            <span>Published: October 2026</span>
            <span>•</span>
            <span>7 min read</span>
            <span>•</span>
            <span>Apartment Payment Ethics</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Key Takeaway Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#11161D] border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase font-mono tracking-wider">
            <Scale className="w-4 h-4" />
            <span>The Quick Answer</span>
          </div>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
            <strong>Yes, it is completely fair to deduct for unannounced missed washes.</strong> However, scheduled weekly rest days (like Sundays) and emergency leaves communicated in advance should be handled consistently so you protect both your wallet and your cleaner’s dignity.
          </p>
        </div>

        {/* Section 1: The 3 Types of Non-Wash Days */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 3 Types of Non-Wash Days (And How to Treat Them)
          </h2>
          <div className="space-y-4 pt-2">
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">1</span>
                <h3 className="text-lg font-bold text-white">Scheduled Cleaner Rest Days (e.g. Sundays)</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                Car cleaners are human beings who need rest. Most apartment complexes observe Sundays or Tuesdays as washer holidays. <strong>Do NOT deduct for scheduled rest days</strong> if your monthly rate was agreed based on 6 days/week.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">2</span>
                <h3 className="text-lg font-bold text-white">Owner Vacation Days</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                If you leave town for 1–2 days, standard practice is to let the cleaner wash the parked car or take the day off without deduction. If you leave for <strong>4+ consecutive days</strong> and inform them in advance, you are entitled to a prorated pause or deduction.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-amber-500/30">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">3</span>
                <h3 className="text-lg font-bold text-white">Unannounced Missed Days</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">
                If your car was scheduled to be washed on Wednesday morning and the cleaner skipped it without notice or replacement, <strong>you should not pay for that service</strong>. Deducting for unrendered work is fair and prevents recurring absenteeism.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Calendar Days vs Working Days Calculation */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How to Calculate the Daily Deduction Amount
          </h2>
          <p className="text-white/70 leading-relaxed">
            There are two primary formulas used in residential apartments. Deciding which one you use upfront prevents misunderstandings.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-white/40">Method 1 (Consumer Common)</div>
              <h3 className="text-lg font-bold text-white">Calendar-Days Deduction</h3>
              <div className="p-3 rounded-lg bg-white/5 font-mono text-sm text-[#2DD4A0]">
                Daily Rate = Monthly Fee ÷ 30 Days
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Example: On a ₹600/month plan, each missed wash deducts ₹20.00. Simple to understand, but treats unpaid rest days as paid days.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11161D] border border-[#2DD4A0]/40 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#2DD4A0]">Method 2 (Cleaner Recommended)</div>
              <h3 className="text-lg font-bold text-white">Working-Days Deduction</h3>
              <div className="p-3 rounded-lg bg-white/5 font-mono text-sm text-[#2DD4A0]">
                Daily Rate = Monthly Fee ÷ 26 Working Days
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Example: On a ₹600/month plan (excluding 4 Sundays), each delivered wash is worth ₹23.08. This accurately reflects the value of delivered labor.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-white text-base">Want an exact calculation for your bill?</div>
              <div className="text-xs text-white/60">Our free calculator handles holidays, missed days, and both formulas instantly.</div>
            </div>
            <Link
              href="/car-wash-payment-calculator"
              className="px-5 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
            >
              <span>Open Payment Calculator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Section 3: WhatsApp Scripts */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Polite WhatsApp Settlement Templates
          </h2>
          <p className="text-white/70 leading-relaxed text-sm">
            Copy and adapt these messages when paying your monthly cleaning bill via UPI to keep the relationship smooth and professional:
          </p>

          <div className="space-y-4">
            {scripts.map((script, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-white">{script.title}</h3>
                  <button
                    onClick={() => copyScript(script.text, idx)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-mono transition-colors border border-white/10"
                  >
                    {copiedScript === idx ? (
                      <>
                        <Check className="w-3 h-3 text-[#2DD4A0]" />
                        <span className="text-[#2DD4A0]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="text-xs text-white/50">{script.scenario}</div>
                <div className="p-4 rounded-xl bg-black/40 border border-white/[0.04] text-xs font-mono text-white/80 leading-relaxed select-all">
                  {script.text}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Guides Links */}
        <div className="pt-8 border-t border-white/[0.08] space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40">Related Guides</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/guides/car-washer-attendance-tracking"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-colors block group"
            >
              <div className="text-sm font-semibold text-white group-hover:text-[#2DD4A0] transition-colors">
                How to Track Your Car Washer’s Attendance →
              </div>
              <p className="text-xs text-white/50 mt-1">Comparing paper clipboards, WhatsApp checks, and 1-tap tracking.</p>
            </Link>
            <Link
              href="/guides/monthly-car-wash-cost-india"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-colors block group"
            >
              <div className="text-sm font-semibold text-white group-hover:text-[#2DD4A0] transition-colors">
                Monthly Car Wash Subscription Cost in India →
              </div>
              <p className="text-xs text-white/50 mt-1">Hatchback, sedan, and SUV benchmarks across major Indian cities.</p>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] py-12 px-4 sm:px-6 lg:px-8 text-xs text-white/40 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/">
              <TorqueLogo emblemSize={28} />
            </Link>
            <span>• Fair Car Cleaning Records &amp; Payment Tracking</span>
          </div>
          <div className="flex items-center gap-5 text-white/60 flex-wrap justify-center font-medium">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/guides" className="hover:text-white">Guides</Link>
            <Link href="/car-wash-payment-calculator" className="hover:text-[#2DD4A0]">Calculator</Link>
            <Link href="/car-wash-tracking" className="hover:text-[#2DD4A0]">Tracking</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <div>© 2026 Torque Care Technologies Inc.</div>
        </div>
      </footer>
    </div>
  );
}
