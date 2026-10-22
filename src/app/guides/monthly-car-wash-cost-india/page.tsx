'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calculator,
  ShieldCheck,
  TrendingDown,
  Building,
  Car,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function MonthlyCarWashCostIndiaPage() {
  const cityRates = [
    {
      city: 'Bengaluru (Bangalore)',
      hatchback: '₹400 – ₹500',
      sedan: '₹500 – ₹700',
      suv: '₹700 – ₹1,000',
      notes: 'Water scarcity guidelines enforce dry/microfiber daily dusting with 1-2 wet washes/week.',
    },
    {
      city: 'Mumbai & MMR',
      hatchback: '₹500 – ₹600',
      sedan: '₹600 – ₹800',
      suv: '₹800 – ₹1,200',
      notes: 'High dust & coastal moisture. Daily exterior wipe + alternate Sunday interior vacuuming.',
    },
    {
      city: 'Delhi-NCR (Gurgaon/Noida)',
      hatchback: '₹400 – ₹550',
      sedan: '₹550 – ₹750',
      suv: '₹750 – ₹1,100',
      notes: 'Heavy winter pollution & PM2.5 requires frequent microfiber cloth swaps to avoid swirls.',
    },
    {
      city: 'Pune',
      hatchback: '₹350 – ₹500',
      sedan: '₹450 – ₹650',
      suv: '₹650 – ₹900',
      notes: 'Gated societies in Hinjewadi/Kharadi often bundle rates through resident associations.',
    },
    {
      city: 'Hyderabad',
      hatchback: '₹350 – ₹500',
      sedan: '₹500 – ₹700',
      suv: '₹700 – ₹950',
      notes: 'Large basement parking complexes with standard 6-days-per-week cleaning schedules.',
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
            <span className="text-[#2DD4A0]">Pricing Benchmarks</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Monthly Car Wash Subscription Cost in India (2026)
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            A comprehensive benchmark guide on monthly car cleaning charges in Indian gated communities. Compare costs across cities and vehicle types.
          </p>

          <div className="flex items-center justify-center gap-4 text-xs font-mono text-white/40 pt-2">
            <span>Updated: October 2026</span>
            <span>•</span>
            <span>8 min read</span>
            <span>•</span>
            <span>Indian Automotive Costs</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        {/* Cost Summary Pill Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#11161D] border border-[#2DD4A0]/30 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-[#2DD4A0] uppercase font-mono tracking-wider">
            <IndianRupee className="w-4 h-4" />
            <span>2026 Quick Benchmark</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xs font-mono text-white/50 uppercase">Hatchback / Compact</div>
              <div className="text-2xl font-bold text-white mt-1">₹400 – ₹550</div>
              <div className="text-[11px] text-white/40 mt-1">i10, Swift, Tiago, Baleno</div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xs font-mono text-white/50 uppercase">Sedan / Compact SUV</div>
              <div className="text-2xl font-bold text-white mt-1">₹500 – ₹750</div>
              <div className="text-[11px] text-white/40 mt-1">City, Creta, Nexon, Brezza</div>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="text-xs font-mono text-white/50 uppercase">Full-Size SUV / Luxury</div>
              <div className="text-2xl font-bold text-white mt-1">₹750 – ₹1,200</div>
              <div className="text-[11px] text-white/40 mt-1">Fortuner, XUV700, BMW, Audi</div>
            </div>
          </div>
        </div>

        {/* Section 1: City Breakdown Table */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            City-by-City Monthly Car Cleaning Rates
          </h2>
          <p className="text-white/70 leading-relaxed text-sm sm:text-base">
            Rates vary based on local labor costs, water availability guidelines, and society size. Here is the verified 2026 pricing across major metro areas:
          </p>

          <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#11161D]">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs font-mono uppercase tracking-wider text-white/60 border-b border-white/[0.08]">
                <tr>
                  <th className="py-4 px-4 sm:px-6">City</th>
                  <th className="py-4 px-3">Hatchback</th>
                  <th className="py-4 px-3">Sedan/CSUV</th>
                  <th className="py-4 px-3">Full SUV</th>
                  <th className="py-4 px-4 sm:px-6 hidden md:table-cell">Local Context</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] text-white/80">
                {cityRates.map((r, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-semibold text-white">{r.city}</td>
                    <td className="py-4 px-3 font-mono text-xs text-white/70">{r.hatchback}</td>
                    <td className="py-4 px-3 font-mono text-xs text-[#2DD4A0] font-bold">{r.sedan}</td>
                    <td className="py-4 px-3 font-mono text-xs text-white/70">{r.suv}</td>
                    <td className="py-4 px-4 sm:px-6 text-xs text-white/50 hidden md:table-cell">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: What is Included */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            What Does a Monthly Apartment Car Cleaning Include?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>Standard Deliverables</span>
              </div>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4 pt-1 leading-relaxed">
                <li>Daily morning exterior dusting / wet wipe (6 days/week)</li>
                <li>Glass &amp; windshield cleaning</li>
                <li>Tire surface wipe</li>
                <li>Weekly or bi-weekly interior floor mat shakeout</li>
              </ul>
            </div>
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Usually Excluded (Extra Cost)</span>
              </div>
              <ul className="text-xs text-white/70 space-y-1.5 list-disc pl-4 pt-1 leading-relaxed">
                <li>Pressure wash or underbody cleaning (requires garage visit)</li>
                <li>Deep interior foam shampooing &amp; vacuuming</li>
                <li>Paint ceramic / wax polishing</li>
                <li>Daily interior cleaning without keys/owner present</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: The "Ghost Wash" Tax */}
        <section className="p-8 rounded-2xl bg-[#11161D] border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400 uppercase font-mono tracking-wider">
            <TrendingDown className="w-4 h-4" />
            <span>The Hidden Cost: The &quot;Ghost Wash&quot; Tax</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            Are You Actually Paying 30% More Than You Think?
          </h3>
          <p className="text-sm text-white/75 leading-relaxed">
            Most apartment car owners pay a fixed monthly charge (e.g. ₹600) expecting 26 washes. But due to unannounced cleaner leaves, public holidays, and owner travel, the average cleaner only washes the car <strong>18 to 20 times</strong> a month.
          </p>
          <div className="p-4 rounded-xl bg-black/50 border border-white/[0.06] text-xs font-mono text-white/80 space-y-1">
            <div>• Agreed Monthly Rate: ₹600 (Expected ~26 washes = ₹23/wash)</div>
            <div>• Actual Washes Delivered: 19 washes</div>
            <div>• Actual Real Cost per Wash: <strong className="text-amber-400">₹31.57/wash (37% overpayment)</strong></div>
          </div>
          <p className="text-xs text-white/60">
            Torque Care eliminates this hidden surcharge by allowing you to track daily attendance in 1-tap and auto-deduct missed washes fairly.
          </p>
          <div className="pt-2">
            <Link
              href="/car-wash-payment-calculator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              <span>Calculate Your Monthly Deductions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
              <p className="text-xs text-white/50 mt-1">Methods and tools for gated society car owners.</p>
            </Link>
            <Link
              href="/guides/pay-for-missed-car-wash-days"
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-colors block group"
            >
              <div className="text-sm font-semibold text-white group-hover:text-[#2DD4A0] transition-colors">
                Is It Fair to Pay for Missed Car Wash Days? →
              </div>
              <p className="text-xs text-white/50 mt-1">Deduction etiquette, WhatsApp scripts, and fair calculation.</p>
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
