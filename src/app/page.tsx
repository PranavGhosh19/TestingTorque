'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TorqueLogo from '@/components/brand/TorqueLogo';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Shield,
  Building2,
  ChevronRight,
  Zap,
  Play,
  History,
  Check,
  BarChart3,
  Camera,
  Droplets,
  Calendar,
  Lock,
  ThumbsUp,
  RefreshCw,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { useStore } from '@/lib/store';
export default function HomePage() {
  const router = useRouter();
  const { todayWash, isLoggedIn, isHydrated, role } = useStore();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeProofView, setActiveProofView] = useState<'after' | 'before'>('after');
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
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
      {/* 1. HERO SECTION — PIXEL-PERFECT MATCH TO REFERENCE DESIGN */}
      {/* ========================================================================= */}
      <section id="hero-section" className="relative min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
        
        {/* Cinematic Backdrop Image with Glowing Floor Halo */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cinematic_bmw_hero.jpg"
            alt="Torque Care BMW with floor glow halo"
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

        {/* Floating Glassmorphic Proof Chips — Positioned around the car in 3D perspective */}
        <div className="absolute inset-0 z-10 pointer-events-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* CHIP 1: "Wash completed - Today • 7:42 AM" (Top Center / Above Roofline) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-[18%] left-[46%] sm:left-[48%] -translate-x-1/2 pointer-events-auto hidden md:block"
          >
            <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#11161D]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:border-[#2DD4A0]/40 transition-colors group cursor-default">
              <div className="w-6 h-6 rounded-full bg-[#2DD4A0] flex items-center justify-center text-slate-950 shrink-0 shadow-[0_0_12px_rgba(45,212,160,0.6)]">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="text-left pr-2">
                <div className="text-xs font-semibold text-white tracking-tight">Wash completed</div>
                <div className="text-[11px] text-white/65 font-medium">Today • 7:42 AM</div>
              </div>
            </div>
          </motion.div>

          {/* CHIP 2: "VERIFIED - Photo captured" (Top Right / Above Trunk) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="absolute top-[18%] right-6 lg:right-12 pointer-events-auto hidden lg:block"
          >
            <div className="flex items-center gap-3.5 p-2.5 pr-4 rounded-[20px] bg-[#11161D]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.6)] hover:border-[#2DD4A0]/40 transition-colors group cursor-default">
              <div className="w-8 h-8 rounded-xl bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 flex items-center justify-center text-[#2DD4A0] shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white tracking-wider flex items-center gap-1.5">
                  <span className="text-[#2DD4A0]">VERIFIED</span>
                </div>
                <div className="text-[11px] text-white/65">Photo captured at bay</div>
              </div>
              <div className="w-10 h-8 rounded-lg overflow-hidden border border-white/10 bg-black/40 relative shrink-0 ml-1">
                <Image
                  src="/images/creta_after.jpg"
                  alt="Verified Proof Thumbnail"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* CHIP 3: "Tracked washes this month" (Bottom Right) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="absolute bottom-[16%] right-6 lg:right-16 pointer-events-auto hidden md:block"
          >
            <div className="flex items-center gap-3.5 px-4 py-3 rounded-[20px] bg-[#11161D]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_16px_36px_rgba(0,0,0,0.7)] hover:border-white/20 transition-all cursor-default">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-[#2DD4A0]">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-white leading-none font-mono">100%</div>
                <div className="text-[11px] text-white/65 mt-0.5">Verified washes this month</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/40 ml-2" />
            </div>
          </motion.div>

          {/* CHIP 4: Far Right Vertical Accent Tag */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 text-[10px] text-white/40 tracking-[0.25em] uppercase pointer-events-none">
            <div className="flex flex-col gap-1 items-center">
              <span className="w-1 h-1 rounded-full bg-[#2DD4A0]" />
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <span className="w-1 h-1 rounded-full bg-white/20" />
            </div>
            <div className="[writing-mode:vertical-lr] font-semibold text-white/65 tracking-[0.2em] py-2">
              DAILY CAR WASH TRACKING &amp; AUDIT PLATFORM
            </div>
          </div>
        </div>

        {/* Main Hero Content (Left Staged) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16 flex-1 flex flex-col justify-center">
          <div className="max-w-2xl text-left">
            
            {/* Bold Tracking Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-[72px] font-bold text-white tracking-[0.02em] leading-[1.04] uppercase font-automotive-title mb-6"
            >
              TRACK YOUR MISSED WASHES.
            </motion.h1>

            {/* Subheading: 65% White Opacity */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-white/65 max-w-md font-normal leading-relaxed mb-10"
            >
              The daily car wash tracking platform. Mon–Sat morning doorstep wash with timestamped photo proof and instant owner verification.
            </motion.p>

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

              {/* Secondary Translucent Glass Pill */}
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#11161D]/80 hover:bg-[#161C25] text-white text-sm font-medium border border-white/[0.12] backdrop-blur-md hover:border-white/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-white text-white ml-0.5" />
                </div>
                <span>See how it works</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE PHILOSOPHY & HOUSING SOCIETY DAILY WASH PROTOCOL */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Philosophy Banner */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 uppercase font-automotive-title">
              Never wonder if your car was cleaned today.
            </h2>
            <p className="text-base sm:text-lg text-white/65 leading-relaxed font-normal">
              Informal apartment cleaners skip days, leave dry-wipe scratches, and leave you guessing. Torque Care transforms housing society car care into a transparent, tracked, and verifiable daily operation.
            </p>
          </div>

          {/* Daily Wash Tracking Protocol Card */}
          <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex flex-col justify-between space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#2DD4A0]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Everything verified before you leave for work.
              </h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Dedicated background-verified washers assigned exclusively to your society tower. Keyless exterior washes, scratch-free microfiber, and unquestionable morning photo proof.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08] text-xs text-white/80">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Timestamped photo verification</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Daily 1-tap owner Yes/No check</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span>Mon–Sat care with Sunday rest</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VERIFIED SERVICE SHOWCASE — THE MAIN BRAND IDEA IN UI */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#11161D] border-y border-white/[0.08] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Context & Proof Mechanics */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
                  You never have to wonder if your car was cleaned.
                </h2>
                <p className="text-base text-white/65 leading-relaxed font-normal">
                  Every morning, our trained washer takes high-resolution verification photos from your designated society parking bay. The photo is automatically stamped with the time, date, and parking spot before you step into the elevator.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Verified PhotoProof Card */}
            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-[20px] bg-[#161C25] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
                
                {/* Header with Verification Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 flex items-center justify-center text-[#2DD4A0]">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>BMW 5-Series • DL 01 AB 9021</span>
                      </div>
                      <div className="text-xs text-white/65">Green Valley • Bay B-42</div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 text-[11px] font-bold text-[#2DD4A0]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>

                {/* Photo Display with Before/After Switch */}
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-white/10 group">
                  <Image
                    src={activeProofView === 'after' ? '/images/creta_after.jpg' : '/images/honda_city_before.jpg'}
                    alt="Verified Proof Showcase"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Stamp Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 font-mono text-[11px] text-white">
                      <span className="text-[#2DD4A0] font-bold">● LIVE STAMP:</span> TODAY 07:24 AM
                    </div>
                    <div className="flex bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/10 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setActiveProofView('before')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${activeProofView === 'before' ? 'bg-white/20 text-white font-bold' : 'text-white/60'}`}
                      >
                        Before
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveProofView('after')}
                        className={`px-2.5 py-1 rounded-md transition-colors ${activeProofView === 'after' ? 'bg-[#2DD4A0] text-black font-bold' : 'text-white/60'}`}
                      >
                        After Clean
                      </button>
                    </div>
                  </div>
                </div>

                {/* Washer Signature & Metrics */}
                <div className="grid grid-cols-2 gap-3 text-center text-xs pt-2 border-t border-white/[0.08]">
                  <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.05]">
                    <div className="text-[11px] text-white/40 uppercase">Cleanliness</div>
                    <div className="text-sm font-bold text-white mt-0.5">100% Spotless</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.05]">
                    <div className="text-[11px] text-white/40 uppercase">Assigned Care</div>
                    <div className="text-sm font-bold text-white mt-0.5">Amit K. (Staff)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. THREE STEP PRECISION HOW IT WORKS */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase font-automotive-title">
              Three steps to a verified clean car every morning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">01</span>
              <h3 className="text-xl font-bold text-white">Register Car &amp; Set Bay</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Enter your vehicle registration and society parking spot (e.g. Tower 4, Bay B-42). No keys needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">02</span>
              <h3 className="text-xl font-bold text-white">Morning Clean &amp; Photo Proof</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Your assigned society washer cleans your car at dawn and captures timestamped inspection proof directly in the app.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">03</span>
              <h3 className="text-xl font-bold text-white">Track &amp; Verify in 1 Tap</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Wake up to verified photo proof. Confirm with a quick Yes/No check and audit your monthly wash calendar.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* ========================================================================= */}
      {/* 7. FINAL CINEMATIC CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-[20px] bg-[#11161D] border border-white/[0.12] shadow-[0_24px_60px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2DD4A0]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-[#2DD4A0] uppercase">
              TORQUE CARE TRACKING PROTOCOL
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase font-automotive-title">
              Track every wash. Verify with proof.
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed">
              Experience the clarity of waking up to a verified clean vehicle every single morning with transparent photo evidence.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              Start Tracking Today
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#161C25] hover:bg-[#1f2835] text-white font-medium text-sm border border-white/[0.15] backdrop-blur-md transition-all hover:scale-105"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] pt-14 pb-28 md:py-14 px-4 sm:px-6 lg:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={32} />
            </Link>
          </div>

          <div>© 2026 Torque Care Technologies Inc. All rights reserved.</div>
        </div>
      </footer>

      {/* Floating 'Get Started' CTA for smaller screens (appears when first section is scrolled down) */}
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
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
