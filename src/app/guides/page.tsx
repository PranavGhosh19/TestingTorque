'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowRight,
  Calendar,
  Calculator,
  IndianRupee,
  Scale,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function GuidesHubPage() {
  const guides = [
    {
      title: 'How to Track Your Car Washer’s Daily Attendance',
      slug: '/guides/car-washer-attendance-tracking',
      description: 'Keep a friction-free, verifiable record of daily car cleaning without awkward WhatsApp check-ins or month-end guesswork.',
      category: 'Attendance & Records',
      readTime: '6 min read',
      icon: ClipboardList,
      tagColor: 'text-[#2DD4A0]',
    },
    {
      title: 'Is It Fair to Pay for Missed Car Wash Days?',
      slug: '/guides/pay-for-missed-car-wash-days',
      description: 'Understand informal labor norms, how to calculate fair daily deduction rates, and how to settle payments respectfully.',
      category: 'Payment Ethics',
      readTime: '7 min read',
      icon: Scale,
      tagColor: 'text-amber-400',
    },
    {
      title: 'Monthly Car Wash Subscription Cost in India (2026)',
      slug: '/guides/monthly-car-wash-cost-india',
      description: 'Benchmark rates across Bengaluru, Mumbai, Delhi-NCR, Pune & Hyderabad. Compare hatchback, sedan, and SUV cleaning costs.',
      category: 'Pricing Benchmarks',
      readTime: '8 min read',
      icon: IndianRupee,
      tagColor: 'text-emerald-400',
    },
    {
      title: 'Handling Missed Car Washes & Society Cleaning Etiquette',
      slug: '/guides/missed-car-washes',
      description: 'Practical guide and message templates for resolving skipped car washes with your apartment cleaner peacefully.',
      category: 'Society Etiquette',
      readTime: '5 min read',
      icon: BookOpen,
      tagColor: 'text-blue-400',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Header */}
      <header className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Knowledge Base &amp; Guides</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Apartment Car Care Guides
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Everything you need to know about tracking daily car cleaning, managing washer payments, calculating fair deductions, and maintaining your vehicle in gated apartment societies.
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide, idx) => {
            const Icon = guide.icon;
            return (
              <Link
                key={idx}
                href={guide.slug}
                className="p-6 sm:p-8 rounded-2xl bg-[#11161D] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-all hover:-translate-y-0.5 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold uppercase tracking-wider ${guide.tagColor}`}>
                      {guide.category}
                    </span>
                    <span className="text-xs font-mono text-white/40">{guide.readTime}</span>
                  </div>

                  <h2 className="text-xl font-bold text-white group-hover:text-[#2DD4A0] transition-colors leading-snug">
                    {guide.title}
                  </h2>

                  <p className="text-sm text-white/60 leading-relaxed font-normal">
                    {guide.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-white/70 group-hover:text-white">
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#2DD4A0]" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Tools Banner */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-[#11161D] to-[#11161D] border border-[#2DD4A0]/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-white">Need to calculate what you owe your cleaner?</h3>
            <p className="text-xs text-white/60">Our free payment calculator computes working days, holidays, and deductions instantly.</p>
          </div>
          <Link
            href="/car-wash-payment-calculator"
            className="px-6 py-3 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
          >
            <span>Payment Calculator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
            <Link href="/guides" className="text-[#2DD4A0]">Guides</Link>
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
