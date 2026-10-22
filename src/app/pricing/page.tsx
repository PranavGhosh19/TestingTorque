'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Check,
  ArrowRight,
  ShieldCheck,
  Building2,
  Car,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function PricingPage() {
  const faqs = [
    {
      q: 'Is the daily car wash tracking app really free for car owners?',
      a: 'Yes, 100% free. You can track your daily washes, log missed days, view your monthly attendance calendar, and use our month-end payment calculator without paying a single rupee.',
    },
    {
      q: 'Do I need to enter credit card or bank details to register?',
      a: 'No. Registration only requires your Google account or email. We never ask for payment details or credit cards for individual car tracking.',
    },
    {
      q: 'Does my existing cleaner need to install a special app?',
      a: 'No! You can use Torque Care as your own personal tracker. If your apartment society adopts Torque Care Community, washers receive an ultra-simple dedicated workflow, but as an individual car owner, your cleaner doesn’t need anything.',
    },
    {
      q: 'What is the Society / RWA plan?',
      a: 'For apartment resident associations (RWAs) and societies that want centralized cleaner attendance, route clustering, complaint management, and verified multi-vehicle parking bay coverage, we offer custom community onboarding.',
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
            <span>Transparent Pricing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Simple, Transparent Plans
          </h1>

          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto leading-relaxed font-normal">
            Free forever for individual car owners to track attendance and calculate payments. Enterprise solutions available for apartment societies and RWAs.
          </p>
        </div>
      </header>

      {/* Main Pricing Cards */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Individual Car Owner (Free) */}
          <div className="p-8 rounded-3xl bg-[#11161D] border-2 border-[#2DD4A0] shadow-[0_0_40px_rgba(45,212,160,0.12)] flex flex-col justify-between relative">
            <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-[#2DD4A0] text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider">
              Most Popular • For Car Owners
            </div>

            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono uppercase text-[#2DD4A0] font-bold">Individual Owner</div>
                <h2 className="text-2xl font-bold text-white mt-1">Daily Wash Tracking</h2>
                <p className="text-xs text-white/60 mt-1">
                  Everything you need to eliminate month-end arguments and track missed washes accurately.
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-white">₹0</span>
                <span className="text-xs font-mono text-white/50">/ forever free</span>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-3 text-xs sm:text-sm text-white/80">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>1-Tap daily Yes / No wash confirmation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Midnight auto-confirmation if unreviewed</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Monthly calendar view with missed days logged</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Automatic month-end payment deduction calculator</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>One-click WhatsApp UPI settlement breakdown</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Multi-vehicle support for your family cars</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/auth/signup"
                className="w-full py-3.5 px-6 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Society & Community Plan */}
          <div className="p-8 rounded-3xl bg-[#11161D] border border-white/[0.08] flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-mono uppercase text-white/40 font-bold">Societies &amp; RWAs</div>
                <h2 className="text-2xl font-bold text-white mt-1">Community Fleet</h2>
                <p className="text-xs text-white/60 mt-1">
                  For apartment committees and property managers seeking verified cleaner operations.
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">Custom</span>
                <span className="text-xs font-mono text-white/50">based on society size</span>
              </div>

              <div className="pt-4 border-t border-white/[0.08] space-y-3 text-xs sm:text-sm text-white/80">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Centralized Society Admin Dashboard</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Basement parking bay route clustering</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Cleaner attendance and leave management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Complaint logging and replacement coverage</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Society-wide billing and monthly reconciliation</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                  <span>Dedicated resident support channel</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/contact"
                className="w-full py-3.5 px-6 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 border border-white/10"
              >
                <span>Talk to Community Team</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <section className="space-y-6 pt-8 border-t border-white/[0.08]">
          <h2 className="text-2xl font-bold text-white tracking-tight text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-2">
                <h3 className="font-bold text-white text-base">{faq.q}</h3>
                <p className="text-xs sm:text-sm text-white/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
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
            <Link href="/pricing" className="text-[#2DD4A0]">Pricing</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <div>© 2026 Torque Care Technologies Inc.</div>
        </div>
      </footer>
    </div>
  );
}
