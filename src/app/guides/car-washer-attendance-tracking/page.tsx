'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  ShieldCheck,
  FileSpreadsheet,
  Clock,
  Smartphone,
  ClipboardList,
  Sparkles,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function CarWasherAttendanceTrackingGuidePage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-white/50 mb-2">
            <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#2DD4A0]">Attendance Tracking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            How to Track Your Car Washer’s Daily Attendance
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Keep a friction-free, verifiable record of daily car cleaning without daily arguments, awkward WhatsApp check-ins, or month-end guesswork.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-white/40 pt-2">
            <span>Published: October 2026</span>
            <span>•</span>
            <span>6 min read</span>
            <span>•</span>
            <span>Apartment Car Care Series</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Intro Takeaway Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#11161D] border border-[#2DD4A0]/30 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2DD4A0] uppercase font-mono tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>The Core Principle</span>
          </div>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
            You don’t need to replace your apartment cleaner or install basement CCTV cameras. You just need a simple, reliable daily Yes / No verification system that logs missed washes automatically so month-end calculations are 100% fair to both sides.
          </p>
        </div>

        {/* Section 1: Why Tracking Fails in Gated Societies */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Why Apartment Car Wash Tracking Is Usually Broken
          </h2>
          <p className="text-white/70 leading-relaxed">
            In most Indian apartment complexes, car cleaners work in underground basement bays between 5:00 AM and 7:30 AM. By the time you head out to work, the cleaner is already gone. Over 30 days, 3 to 6 unannounced skips commonly happen due to illness, festival travel, or fatigue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-amber-400 font-bold text-sm mb-1">Human Memory Fades</div>
              <p className="text-xs text-white/60 leading-relaxed">
                Neither you nor your cleaner can accurately recall whether your car was cleaned on the 9th or 14th of the month.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-amber-400 font-bold text-sm mb-1">Awkward Deductions</div>
              <p className="text-xs text-white/60 leading-relaxed">
                Deducting money at month-end without an active daily log leads to hurt feelings and defensive arguments.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-amber-400 font-bold text-sm mb-1">Zero Accountability</div>
              <p className="text-xs text-white/60 leading-relaxed">
                When skips go unnoticed, cleaners prioritize cars belonging to owners who actively inspect their vehicles.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Comparing the 3 Tracking Methods */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comparing the 3 Methods of Tracking
          </h2>

          <div className="space-y-4">
            {/* Method A */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Method 1: The Basement Parking Clipboard</h3>
                  <span className="text-xs font-mono text-white/40">Physical paper attendance sheet</span>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">
                Hanging a printable sheet on a clipboard in your parking pillar where the cleaner ticks each morning.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                <span className="text-emerald-400 font-semibold">✓ Easy to start</span>
                <span className="text-rose-400 font-semibold">✗ Weather damage, lost pens, easy to fake ticks</span>
              </div>
            </div>

            {/* Method B */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Method 2: WhatsApp Messages / Notes App</h3>
                  <span className="text-xs font-mono text-white/40">Texting cleaner every missed morning</span>
                </div>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-3">
                Sending a message like <em>&quot;Bhaiya, car not cleaned today&quot;</em> every time you notice dust.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-white/50">
                <span className="text-emerald-400 font-semibold">✓ Timestamped record</span>
                <span className="text-rose-400 font-semibold">✗ Feels confrontational; messages get buried</span>
              </div>
            </div>

            {/* Method C */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-[#2DD4A0]/40 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0]">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Method 3: 1-Tap Daily Digital Tracking (Recommended)</h3>
                  <span className="text-xs font-mono text-[#2DD4A0]">Torque Care system</span>
                </div>
              </div>
              <p className="text-sm text-white/80 leading-relaxed mb-3">
                Answer one 1-tap question whenever you inspect your car: <em>&quot;Was your car washed today?&quot;</em> If you forget to check, the system auto-assumes <strong>Yes</strong> at midnight so you never have to do unnecessary administrative chores.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400 font-semibold">✓ 100% zero-friction</span>
                <span className="text-emerald-400 font-semibold">✓ Automated month-end deductions</span>
                <span className="text-emerald-400 font-semibold">✓ Respectful WhatsApp settlement summary</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Establishing the Ground Rules */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How to Set Up Rules With Your Cleaner Without Conflict
          </h2>
          <div className="space-y-3 text-white/70 leading-relaxed text-sm sm:text-base">
            <p>
              To keep the arrangement positive, set clear expectations at the start of the month:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/80">
              <li><strong>Agree on Rest Days:</strong> Clarify whether Sundays or Tuesdays are weekly offs so neither of you treats an agreed rest day as an unannounced miss.</li>
              <li><strong>Agree on the Deduction Rate:</strong> Decide whether deductions are calculated using 30 calendar days or 26 working days (Working-days calculation is cleaner-friendly and standard).</li>
              <li><strong>Inform Vacation in Advance:</strong> If you travel for 4 days, let your cleaner know 24 hours prior so they can plan their morning workload.</li>
            </ul>
          </div>
        </section>

        {/* CTA Card */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#11161D] to-[#161C25] border border-white/[0.08] text-center space-y-4">
          <h3 className="text-xl sm:text-2xl font-bold text-white uppercase font-automotive-title">
            Start Tracking Your Car in 30 Seconds
          </h3>
          <p className="text-sm text-white/70 max-w-lg mx-auto">
            Free forever for individual apartment car owners. Zero credit card or subscription fees required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/auth/signup"
              className="px-6 py-3 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <span>Register &amp; Track Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/car-wash-payment-calculator"
              className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-white/10"
            >
              <span>Try Payment Calculator</span>
            </Link>
          </div>
        </div>

        {/* Related Guides Links */}
        <div className="pt-8 border-t border-white/[0.08] space-y-4">
          <div className="text-xs font-mono uppercase tracking-wider text-white/40">Related Guides</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/guides/pay-for-missed-car-wash-days"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-colors block group"
            >
              <div className="text-sm font-semibold text-white group-hover:text-[#2DD4A0] transition-colors">
                Is It Fair to Pay for Missed Car Wash Days? →
              </div>
              <p className="text-xs text-white/50 mt-1">Deduction etiquette, working vs calendar days calculation.</p>
            </Link>
            <Link
              href="/guides/monthly-car-wash-cost-india"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-colors block group"
            >
              <div className="text-sm font-semibold text-white group-hover:text-[#2DD4A0] transition-colors">
                Monthly Car Wash Subscription Cost in India →
              </div>
              <p className="text-xs text-white/50 mt-1">City-by-city benchmark rates for hatchbacks, sedans, and SUVs.</p>
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
