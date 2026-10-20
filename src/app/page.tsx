'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TorqueLogo from '@/components/brand/TorqueLogo';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Check,
  BarChart3,
  Calendar,
  RefreshCw,
  Car,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingDown,
  Calculator,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, isHydrated, role } = useStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [demoAnswer, setDemoAnswer] = useState<'yes' | 'no'>('yes');
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const heroEl = document.getElementById('hero-section');
      const threshold = heroEl ? heroEl.offsetHeight * 0.7 : 450;
      setShowFloatingCta(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const storedLoggedIn =
      typeof window !== 'undefined' && localStorage.getItem('torque_logged_in') === 'true';
    if ((isHydrated && isLoggedIn) || storedLoggedIn) {
      setIsRedirecting(true);
      let targetRole = role || 'owner';
      try {
        const savedUserStr =
          typeof window !== 'undefined' ? localStorage.getItem('torque_user') : null;
        if (savedUserStr) {
          const parsed = JSON.parse(savedUserStr);
          if (parsed?.role) targetRole = parsed.role;
        }
      } catch (e) {
        // ignore
      }
      router.replace(`/${targetRole}/dashboard`);
    }
  }, [isHydrated, isLoggedIn, role, router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#0A0D12] flex flex-col items-center justify-center gap-3 text-white">
        <div className="w-12 h-12 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center shadow-lg">
          <RefreshCw className="w-6 h-6 text-[#2DD4A0] animate-spin" />
        </div>
        <p className="text-xs font-mono font-bold tracking-wider text-white/80">RESUMING ACTIVE SESSION</p>
        <p className="text-[11px] text-white/40">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black overflow-x-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION — PURELY TO TRACK MISSED WASHES */}
      {/* ========================================================================= */}
      <section id="hero-section" className="relative min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
        
        {/* Cinematic Backdrop Image with Floor Glow */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cinematic_bmw_hero.jpg"
            alt="Torque Care vehicle tracking"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center lg:object-[center_35%]"
          />
          {/* Subtle directional vignette gradients to ensure high-contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D12] via-[#0A0D12]/75 to-transparent sm:via-[#0A0D12]/60 lg:via-[#0A0D12]/45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D12] via-transparent to-[#0A0D12]/60" />
          <div className="absolute inset-0 bg-radial-[circle_at_25%_45%] from-transparent via-[#0A0D12]/20 to-[#0A0D12]/80 pointer-events-none" />
        </div>

        {/* Floating Tracking Chips */}
        <div className="absolute inset-0 z-10 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* CHIP 1: "Daily Wash Check • Yes / No" */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-[18%] left-[46%] sm:left-[48%] -translate-x-1/2 pointer-events-auto hidden md:block"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#11161D]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:border-[#2DD4A0]/40 transition-colors group cursor-default">
              <div className="w-6 h-6 rounded-full bg-[#2DD4A0] flex items-center justify-center text-slate-950 shrink-0 shadow-[0_0_12px_rgba(45,212,160,0.6)]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="text-left pr-2">
                <div className="text-xs font-semibold text-white tracking-tight">Daily Wash Check</div>
                <div className="text-[11px] text-white/65 font-medium">1-Tap Confirmation • Yes / No</div>
              </div>
            </div>
          </motion.div>

          {/* CHIP 2: "MISSED WASH FLAGGED • Auto-Deducted" */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="absolute top-[18%] right-6 lg:right-12 pointer-events-auto hidden lg:block"
          >
            <div className="flex items-center gap-3.5 p-3 pr-4 rounded-[20px] bg-[#11161D]/85 backdrop-blur-xl border border-amber-500/30 shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:border-amber-400/50 transition-colors group cursor-default">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                  <span>MISSED WASH FLAGGED</span>
                </div>
                <div className="text-[11px] text-white/65">Deduct from your monthly bill</div>
              </div>
            </div>
          </motion.div>

          {/* CHIP 3: "Pay Only For Washes • Monthly Audit" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute bottom-[16%] right-6 lg:right-16 pointer-events-auto hidden md:block"
          >
            <div className="flex items-center gap-3.5 px-4 py-3 rounded-[20px] bg-[#11161D]/85 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.7)] hover:border-white/20 transition-all cursor-default">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#2DD4A0]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-white leading-tight font-mono">Pay Only For Washes</div>
                <div className="text-[11px] text-white/65 mt-0.5">Automated Monthly Service Audit</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 ml-2" />
            </div>
          </motion.div>

          {/* CHIP 4: Far Right Vertical Accent Tag */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 text-[10px] text-white/40 tracking-[0.25em] uppercase pointer-events-none">
            <div className="flex flex-col gap-1 items-center">
              <span className="w-1 h-1 rounded-full bg-[#2DD4A0]" />
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="w-1 h-1 rounded-full bg-white/20" />
            </div>
            <div className="[writing-mode:vertical-lr] font-semibold text-white/65 tracking-[0.2em] py-2">
              TRACK MISSED WASHES • PAY ONLY FOR SERVICES PROVIDED
            </div>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16 flex-1 flex flex-col justify-center">
          <div className="max-w-2xl text-left">
            {/* Bold Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-[68px] font-bold text-white tracking-tight leading-[1.08] mb-6"
            >
              Your car, always cared for
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-white/75 max-w-xl font-normal leading-relaxed mb-8"
            >
              Torque Care helps car owners maintain a record of their daily car cleaning, track missed washes and understand their monthly payments — without replacing their existing car washer.
            </motion.p>

            {/* Four Pillars Pills */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="flex items-center gap-2.5 sm:gap-3 flex-wrap mb-8 text-xs font-mono text-white/70"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />
                <span>Wash calendar</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />
                <span>Missed-wash records</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />
                <span>Daily 1-tap check</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <Check className="w-3.5 h-3.5 text-[#2DD4A0]" />
                <span>Fair-payment tracking</span>
              </div>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 mb-8"
            >
              {/* Primary White Pill Button */}
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#0A0D12] text-sm font-bold shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Track Your Car</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              {/* Secondary Calculator Button */}
              <Link
                href="/car-wash-payment-calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-bold border border-white/10 transition-all hover:border-[#2DD4A0]/40"
              >
                <Calculator className="w-4 h-4 text-[#2DD4A0]" />
                <span>Free Payment Calculator</span>
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE PHILOSOPHY & ACCURATE BILLING */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Philosophy Banner */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 uppercase font-automotive-title">
              Stop paying for car washes you never received.
            </h2>
            <p className="text-base sm:text-lg text-white/65 leading-relaxed font-normal">
              Informal apartment cleaners frequently skip days unnoticed and charge you for the full month regardless. Torque Care gives you complete control: track missed washes daily and pay only for the washes actually provided.
            </p>
          </div>

          {/* Daily Wash Tracking Protocol Card */}
          <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex flex-col justify-between space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2DD4A0]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4">
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
                FAIR BILLING &amp; SERVICE TRANSPARENCY
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Track your missed washes for the month and pay only for the washes.
              </h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Keep your existing cleaner or society wash partner. There is no complicated photo proof or camera inspection to manage. Just register with us, answer a simple daily question — “Was your car washed today?” — and analyse your monthly services provided with complete financial accuracy.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08] text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Daily 1-tap Yes / No tracking</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Automated monthly service audit</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Pay only for actual washes done</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE YES / NO TRACKER & AUDIT SHOWCASE */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#11161D] border-y border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Context & Mechanics */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
                  SIMPLICITY FIRST
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
                  Track your missed washes with Yes / No.
                </h2>
                <p className="text-base text-white/65 leading-relaxed font-normal">
                  No camera proof, no complicated uploads. Each day, simply mark whether your car was washed. If it was missed, flag it with one tap. We compile your complete monthly service audit so you never overpay again.
                </p>
              </div>

              <div className="space-y-3 text-xs text-white/80">
                <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Instant 1-Tap Check</div>
                    <div className="text-white/50 text-xs mt-0.5">Answer “Was your car washed today?” in 2 seconds.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Missed Wash Auto-Deduction</div>
                    <div className="text-white/50 text-xs mt-0.5">Skipped washes are catalogued and deducted from your monthly bill.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">Monthly Service Analytics</div>
                    <div className="text-white/50 text-xs mt-0.5">Analyse wash reliability, active days, and exact monthly fees.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Demo Card */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-[24px] bg-[#161C25] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0]">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Maruti Suzuki Swift • DL 01 AB 4291</div>
                      <div className="text-xs text-white/50">Tower 2 • Bay B-14</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#11161D] border border-white/10 text-white/70">
                    Live Demo
                  </span>
                </div>

                {/* Question Prompt Box */}
                <div className="p-5 rounded-2xl bg-[#11161D] border border-white/[0.08] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2DD4A0]">
                      TODAY&apos;S WASH LOG
                    </span>
                    <span className="text-xs font-mono text-white/50">Today</span>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Was your car washed today?
                  </p>

                  {/* Yes / No Toggle Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDemoAnswer('yes')}
                      className={`p-3 rounded-xl border font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        demoAnswer === 'yes'
                          ? 'bg-[#2DD4A0] text-black border-[#2DD4A0] shadow-[0_0_20px_rgba(45,212,160,0.4)] scale-[1.02]'
                          : 'bg-[#161C25] text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Yes, Cleaned</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDemoAnswer('no')}
                      className={`p-3 rounded-xl border font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        demoAnswer === 'no'
                          ? 'bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] scale-[1.02]'
                          : 'bg-[#161C25] text-white/70 border-white/10 hover:border-white/25 hover:text-white'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>No, Missed</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Result State */}
                <div className="space-y-3">
                  {demoAnswer === 'yes' ? (
                    <div className="p-4 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 text-xs text-white flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-[#2DD4A0]">Wash Logged as Completed ✓</div>
                        <div className="text-white/70 mt-0.5">Today is logged into your audit calendar as serviced. Full accountability verified.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-white flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-amber-300">Missed Wash Flagged ⚠</div>
                        <div className="text-white/70 mt-0.5">Today is flagged as not cleaned. Auto-deducted from your monthly billing statement.</div>
                      </div>
                    </div>
                  )}

                  {/* Monthly Summary Strip */}
                  <div className="grid grid-cols-3 gap-2.5 text-center text-xs pt-1">
                    <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.06]">
                      <div className="text-[10px] text-white/40 uppercase font-mono">Washes Done</div>
                      <div className="text-sm font-bold text-[#2DD4A0] mt-0.5 font-mono">
                        {demoAnswer === 'yes' ? '25 Washes' : '24 Washes'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.06]">
                      <div className="text-[10px] text-white/40 uppercase font-mono">Missed Flagged</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5 font-mono">
                        {demoAnswer === 'yes' ? '1 Missed' : '2 Missed'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.06]">
                      <div className="text-[10px] text-white/40 uppercase font-mono">Monthly Bill</div>
                      <div className="text-sm font-bold text-white mt-0.5 font-mono">
                        {demoAnswer === 'yes' ? '₹770 (Save ₹30)' : '₹740 (Save ₹60)'}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TOOLS & ARCHITECTURE SUITE */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12] border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase block">
              FREE TOOLS &amp; RESOURCES
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase font-automotive-title">
              Tools to track, calculate and settle fairly
            </h2>
            <p className="text-sm text-white/65 leading-relaxed font-normal">
              Explore our free interactive payment calculator, attendance guides, and downloadable templates built specifically for apartment car owners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Calculator */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 flex items-center justify-center text-[#2DD4A0]">
                  <Calculator className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2DD4A0] transition-colors">
                  Payment Calculator
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Enter your monthly fee, scheduled holidays, and missed washes to calculate exact fair deductions with zero arguments.
                </p>
              </div>
              <Link
                href="/car-wash-payment-calculator"
                className="text-xs font-bold font-mono text-[#2DD4A0] flex items-center gap-1.5 hover:underline"
              >
                <span>Calculate Deductions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Tracking Guide */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2DD4A0] transition-colors">
                  Wash Calendar Guide
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Explore our interactive monthly calendar demo. Learn how 1-tap daily confirmation maintains indisputable proof.
                </p>
              </div>
              <Link
                href="/car-wash-tracking"
                className="text-xs font-bold font-mono text-blue-400 flex items-center gap-1.5 hover:underline"
              >
                <span>Explore Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3: Free Template */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2DD4A0] transition-colors">
                  Free Excel Template
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Download a pre-configured Excel attendance sheet or print a daily clipboard checklist for your parking bay.
                </p>
              </div>
              <Link
                href="/car-wash-tracking-template"
                className="text-xs font-bold font-mono text-purple-400 flex items-center gap-1.5 hover:underline"
              >
                <span>Download Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4: Missed Washes Guide */}
            <div className="p-6 rounded-2xl bg-[#11161D] border border-white/[0.08] hover:border-[#2DD4A0]/40 transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#2DD4A0] transition-colors">
                  Missed-Wash Guide
                </h3>
                <p className="text-xs text-white/60 leading-relaxed">
                  Understand rest days vs. missed visits. Ready-to-use polite WhatsApp templates to settle payments respectfully.
                </p>
              </div>
              <Link
                href="/guides/missed-car-washes"
                className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5 hover:underline"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. THREE STEP HOW IT WORKS */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase block mb-3">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase font-automotive-title">
              Three steps to track your monthly washes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">01</span>
              <h3 className="text-xl font-bold text-white">Register With Us</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Add your vehicle and society details in under 2 minutes. No hardware, no upfront payments, and no disruptions to your current routine.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">02</span>
              <h3 className="text-xl font-bold text-white">Track With Yes / No</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Answer a quick daily question: &ldquo;Was your car washed today?&rdquo; Tap Yes if your vehicle was cleaned, or No if skipped.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">03</span>
              <h3 className="text-xl font-bold text-white">Analyse &amp; Pay Only For Washes</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Review your monthly service breakdown, see every missed wash deducted, and pay only for the washes actually provided.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FINAL CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-[20px] bg-[#11161D] border border-white/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2DD4A0]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              TORQUE CARE AUDIT PLATFORM
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase font-automotive-title">
              Track your missed washes. Pay only for the washes.
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed">
              Register with us today. Track your daily car washes with Yes / No and analyse your monthly services provided.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              Start Tracking Today
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] pt-14 pb-28 md:py-14 px-4 sm:px-6 lg:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={32} />
            </Link>
            <span>• Fair Car Cleaning Records &amp; Payment Tracking</span>
          </div>

          <div className="flex items-center gap-5 sm:gap-6 text-white/60 flex-wrap justify-center font-medium">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/car-wash-payment-calculator" className="hover:text-[#2DD4A0]">Payment Calculator</Link>
            <Link href="/car-wash-tracking" className="hover:text-[#2DD4A0]">Tracking Guide</Link>
            <Link href="/car-wash-tracking-template" className="hover:text-[#2DD4A0]">Free Template</Link>
            <Link href="/guides/missed-car-washes" className="hover:text-[#2DD4A0]">Missed Washes</Link>
            <Link href="/how-it-works" className="hover:text-[#2DD4A0]">How It Works</Link>
          </div>

          <div>© 2026 Torque Care Technologies Inc. All rights reserved.</div>
        </div>
      </footer>

      {/* Floating 'Track Your Car' CTA for mobile screens */}
      <AnimatePresence>
        {showFloatingCta && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-5 left-0 right-0 z-40 flex justify-center pointer-events-none md:hidden px-4 pb-[env(safe-area-inset-bottom)]"
          >
            <Link
              href="/auth/signup"
              className="pointer-events-auto w-full max-w-xs py-3.5 px-6 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(255,255,255,0.25)] active:scale-[0.97] border border-white/20"
            >
              <span>Track Your Car</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
