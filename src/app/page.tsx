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
  Star,
  Users,
  Building2,
  ChevronRight,
  Zap,
  Play,
  Car,
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
      <section className="relative min-h-[92vh] lg:min-h-[96vh] flex flex-col justify-between overflow-hidden border-b border-white/[0.08]">
        
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
          
          {/* CHIP 1: "Wash completed - Today • 8:24 AM" (Top Center / Above Roofline) */}
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
                <div className="text-[11px] text-white/65 font-medium">Today • 8:24 AM</div>
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
                <div className="text-[11px] text-white/65">Photo captured</div>
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

          {/* CHIP 3: "12 Washes this month" (Bottom Right) */}
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
                <div className="text-lg font-bold text-white leading-none font-mono">12</div>
                <div className="text-[11px] text-white/65 mt-0.5">Washes this month</div>
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
              SMARTER CAR CARE FOR A CLEANER TOMORROW
            </div>
          </div>
        </div>

        {/* Main Hero Content (Left Staged) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16 flex-1 flex flex-col justify-center">
          <div className="max-w-2xl text-left">
            
            {/* Wide-Tracked Porsche/Polestar Confidence Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-4xl sm:text-6xl lg:text-[72px] font-bold text-white tracking-[0.02em] leading-[1.04] uppercase font-automotive-title mb-6"
            >
              YOUR CAR.<br />
              ALWAYS TAKEN<br />
              CARE OF.
            </motion.h1>

            {/* Subheading: 65% White Opacity */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="text-base sm:text-lg text-white/65 max-w-md font-normal leading-relaxed mb-10"
            >
              Your everyday car care, organized, verified and effortless.
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
                <span>Get Torque Care</span>
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

            {/* Mobile View: Floating Chips Summary Card (Visible on small screens) */}
            <div className="md:hidden mt-6 p-4 rounded-2xl bg-[#11161D]/85 border border-white/[0.08] backdrop-blur-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#2DD4A0] text-black flex items-center justify-center">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Daily 7:30 AM Verified Proof</div>
                  <div className="text-[11px] text-white/65">₹599/mo • Housing Societies</div>
                </div>
              </div>
              <span className="text-[10px] font-mono uppercase bg-[#2DD4A0]/15 text-[#2DD4A0] px-2.5 py-1 rounded-full border border-[#2DD4A0]/25 font-bold">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Scroll to explore indicator */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-6 flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-6 rounded-full border border-white/20 flex items-start justify-center p-1">
              <div className="w-1 h-1.5 rounded-full bg-[#2DD4A0] animate-bounce" />
            </div>
            <span className="tracking-wider uppercase text-[11px] font-medium text-white/50">Scroll to explore</span>
          </div>

          <div className="hidden sm:flex items-center gap-6 text-[11px] font-mono text-white/50">
            <span>• 100% SCRATCH-SAFE MICROFIBER</span>
            <span>• ZERO MISS-DAY PEER BACKUP</span>
            <span>• WATERLESS POLYMER CARE</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CORE PHILOSOPHY & HOUSING SOCIETY SUBSCRIPTION (₹599/MONTH) */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Philosophy Banner */}
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 text-[11px] font-semibold uppercase tracking-wider text-[#2DD4A0] mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Luxury of Certainty</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6 uppercase font-automotive-title">
              Car care should feel like owning a luxury product.
            </h2>
            <p className="text-base sm:text-lg text-white/65 leading-relaxed font-normal">
              Not hiring a random neighborhood washer with dirty rags and dry-wipe scratches. We built Torque Care as a dedicated concierge for apartment complexes and gated societies.
            </p>
          </div>

          {/* Pricing Highlight Card — ₹599/month */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Feature Card (7 cols) */}
            <div className="lg:col-span-7 p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex flex-col justify-between space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#2DD4A0]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#2DD4A0] bg-[#2DD4A0]/10 px-3 py-1 rounded-full border border-[#2DD4A0]/20">
                  Society Residency Plan
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Everything your car needs before you wake up.
                </h3>
                <p className="text-sm text-white/65 leading-relaxed">
                  Dedicated background-verified washers assigned exclusively to your society tower. Keyless exterior washes, scratch-free microfiber, and unquestionable morning photo proof.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.08] text-xs text-white/80">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Every morning by 7:30 AM</span>
                </div>
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
                  <span>Zero-scratch microfiber guarantee</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Washer peer-backup (0 missed days)</span>
                </div>
              </div>
            </div>

            {/* Right Pricing Card (5 cols) */}
            <div className="lg:col-span-5 p-8 sm:p-10 rounded-[20px] bg-[#161C25] border border-white/[0.12] flex flex-col justify-between relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/65 uppercase tracking-wider">Fixed Monthly Care</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2DD4A0] text-black px-2.5 py-0.5 rounded-full">
                    Popular
                  </span>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">₹599</span>
                    <span className="text-sm font-medium text-white/65">/ month</span>
                  </div>
                  <p className="text-xs text-white/40 mt-1">Billed monthly • Pause or cancel anytime</p>
                </div>

                <div className="p-4 rounded-xl bg-[#11161D] border border-white/[0.08] text-xs text-white/65 space-y-2">
                  <div className="flex items-center justify-between text-white font-medium">
                    <span>Average washes per month</span>
                    <span className="font-mono text-[#2DD4A0]">24 washes</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Cost per verified wash</span>
                    <span className="font-mono text-white/80">~₹24 / day</span>
                  </div>
                </div>
              </div>

              <div className="pt-8">
                <Link
                  href="/auth/signup"
                  className="w-full py-3.5 px-6 rounded-full bg-[#2DD4A0] hover:bg-[#25b889] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(45,212,160,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Start Society Subscription</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
                <div className="text-center mt-3">
                  <Link href="/for-owners" className="text-[11px] text-white/40 hover:text-white transition-colors">
                    Looking to enroll your whole society? Contact RWA sales →
                  </Link>
                </div>
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
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#2DD4A0] bg-[#2DD4A0]/15 px-3 py-1 rounded-full border border-[#2DD4A0]/25">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Proof Over Promises
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
                  You never have to wonder if your car was cleaned.
                </h2>
                <p className="text-base text-white/65 leading-relaxed font-normal">
                  Every morning, our trained washer takes high-resolution verification photos from your designated society parking bay. The photo is automatically stamped with the time, date, and parking spot before you step into the elevator.
                </p>
              </div>

              {/* Verified Process Timeline */}
              <div className="space-y-4 border-l-2 border-white/10 pl-6 ml-2 text-xs">
                
                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-white/20 border-2 border-[#11161D]" />
                  <div className="text-white/40 font-mono text-[11px]">06:45 AM</div>
                  <div className="text-white font-semibold text-sm">Washer checks into Tower B Basement</div>
                  <div className="text-white/65 text-xs">Background-verified partner scans into parking grid.</div>
                </div>

                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-white/20 border-2 border-[#11161D]" />
                  <div className="text-white/40 font-mono text-[11px]">07:10 AM</div>
                  <div className="text-white font-semibold text-sm">Waterless Polymer Foam Lift</div>
                  <div className="text-white/65 text-xs">Safe lifting of overnight dust without grit-friction or scratching.</div>
                </div>

                <div className="relative group">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#2DD4A0] border-2 border-[#11161D] shadow-[0_0_10px_#2DD4A0]" />
                  <div className="text-[#2DD4A0] font-mono text-[11px] font-bold">07:24 AM • VERIFIED</div>
                  <div className="text-white font-semibold text-sm">Certificate photo captured & uploaded</div>
                  <div className="text-white/65 text-xs">Clean hood, windshield, and tire dressing proof delivered.</div>
                </div>
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
                <div className="grid grid-cols-3 gap-3 text-center text-xs pt-2 border-t border-white/[0.08]">
                  <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.05]">
                    <div className="text-[11px] text-white/40 uppercase">Cleanliness</div>
                    <div className="text-sm font-bold text-white mt-0.5">100% Spotless</div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#11161D] border border-white/[0.05]">
                    <div className="text-[11px] text-white/40 uppercase">Gloss Index</div>
                    <div className="text-sm font-bold text-[#2DD4A0] mt-0.5">98.4 Rating</div>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono uppercase tracking-widest text-white/65 mb-4">
              Effortless Routine
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase font-automotive-title">
              Three steps to a clean car every morning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">01</span>
              <h3 className="text-xl font-bold text-white">Enroll & Specify Bay</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Enter your car registration and society parking spot (e.g. Tower 4, Bay #102). No keys needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">02</span>
              <h3 className="text-xl font-bold text-white">Silent 7:30 AM Cleanse</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Your dedicated society washer arrives at dawn, using high-density microfiber and waterless polymer shampoo.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 transition-all space-y-5">
              <span className="text-4xl font-bold font-mono text-[#2DD4A0]">03</span>
              <h3 className="text-xl font-bold text-white">Morning Photo Proof</h3>
              <p className="text-sm text-white/65 leading-relaxed">
                Get notified with verified timestamped photos before you leave for work. Know your car is spotless with zero doubts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. HOUSING SOCIETIES VS TRADITIONAL CLEANERS COMPARISON */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#11161D] border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase font-automotive-title mb-4">
              Traditional Cleaners vs Torque Care
            </h2>
            <p className="text-sm text-white/65">
              Why leading housing societies are replacing informal cleaners with certified Torque Care.
            </p>
          </div>

          <div className="rounded-[20px] bg-[#161C25] border border-white/[0.08] overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              
              {/* Traditional Cleaner */}
              <div className="p-8 sm:p-10 space-y-6 bg-red-950/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-red-400 uppercase tracking-wider font-mono">Traditional Informal Washers</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Outdated</span>
                </div>

                <div className="space-y-4 text-xs text-white/65">
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Single bucket used for 15 cars, spreading abrasive grit.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Dry-wipe cotton rags creating permanent swirl marks and paint dulling.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Random unannounced absences with zero backup coverage.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>No proof of service — you pay monthly regardless of missed days.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-red-400 font-bold">✕</span>
                    <span>Unvetted strangers wandering around society parking basements.</span>
                  </div>
                </div>
              </div>

              {/* Torque Care */}
              <div className="p-8 sm:p-10 space-y-6 bg-[#2DD4A0]/[0.03]">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#2DD4A0] uppercase tracking-wider font-mono">Torque Care Society Standard</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] border border-[#2DD4A0]/30 font-bold">Verified</span>
                </div>

                <div className="space-y-4 text-xs text-white/80">
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                    <span>Individual microfiber towels per vehicle; zero cross-contamination.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                    <span>Ceramic-friendly polymer polish that protects clearcoat and adds gloss.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                    <span>Washer peer-backup system guarantees 100% attendance 365 days.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                    <span>Timestamped daily photo certificate delivered directly to your phone.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                    <span>Police-verified, uniformed staff with digital society gate integration.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. DIGNIFIED EMPLOYMENT FOR WASHERS */}
      {/* ========================================================================= */}
      <section className="py-24 sm:py-32 bg-[#0A0D12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono uppercase tracking-widest text-[#2DD4A0]">
                Fair Work Ecosystem
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white uppercase font-automotive-title">
                Respect, fair pay, and dignity for our washers.
              </h2>
              <p className="text-sm text-white/65 leading-relaxed">
                Informal washers are often underpaid, unequipped, and treated with disregard. Torque Care transforms car washing into professional, dignified employment with guaranteed monthly income, health coverage, and ergonomic high-grade tools.
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                <div className="p-4 rounded-xl bg-[#11161D] border border-white/[0.08]">
                  <div className="text-lg font-bold text-white font-mono">100%</div>
                  <div className="text-white/65 mt-0.5">Fixed on-time bank transfers</div>
                </div>
                <div className="p-4 rounded-xl bg-[#11161D] border border-white/[0.08]">
                  <div className="text-lg font-bold text-white font-mono">₹18,000+</div>
                  <div className="text-white/65 mt-0.5">Monthly earning potential</div>
                </div>
              </div>

              <div>
                <Link
                  href="/for-washers"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#2DD4A0] hover:underline"
                >
                  <span>Read how we recruit, train and support our partners →</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative aspect-16/10 rounded-[20px] overflow-hidden border border-white/[0.12] shadow-2xl">
                <Image
                  src="/images/washer_amit.jpg"
                  alt="Torque Care Professional Partner"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white text-sm">Amit Kumar</div>
                    <div className="text-white/65 text-[11px]">Senior Care Lead • Green Valley Residency (4.9★)</div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/30 font-mono text-[10px] font-bold">
                    CERTIFIED
                  </span>
                </div>
              </div>
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
              TORQUE CARE RESIDENCY
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase font-automotive-title">
              Your car. Always taken care of.
            </h2>
            <p className="text-sm sm:text-base text-white/65 leading-relaxed">
              Experience the luxury of waking up to a spotless, verified clean vehicle every single morning for ₹599/month.
            </p>
          </div>

          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0A0D12] font-bold text-sm shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
            >
              Get Torque Care Now
            </Link>
            <Link
              href="/for-owners"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-[#161C25] hover:bg-[#1f2835] text-white font-medium text-sm border border-white/[0.15] backdrop-blur-md transition-all hover:scale-105"
            >
              Explore Society Plans
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER */}
      {/* ========================================================================= */}
      <footer className="bg-[#05080E] border-t border-white/[0.08] py-14 px-4 sm:px-6 lg:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={32} />
            </Link>
            <span className="text-white/40 text-[11px] hidden md:inline font-mono">
              — Verified Society Car Care
            </span>
          </div>

          <div className="flex items-center gap-6 text-white/65">
            <Link href="/how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="/for-owners" className="hover:text-white transition-colors">Car Owners</Link>
            <Link href="/for-washers" className="hover:text-white transition-colors">For Washers</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>

          <div>© 2026 Torque Care Technologies Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
