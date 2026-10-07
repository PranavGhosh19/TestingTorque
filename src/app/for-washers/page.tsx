'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  MapPin,
  IndianRupee,
  Calendar,
  Users,
  ArrowRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  Gift,
} from 'lucide-react';

export default function ForWashersPage() {
  const washerBenefits = [
    {
      title: 'Steady Society Customers',
      icon: Users,
      description:
        'No more knocking on doors or awkward monthly collections. Torque Care assigns verified apartment subscribers directly to your digital route.',
    },
    {
      title: 'Concentrated Basement Routes',
      icon: MapPin,
      description:
        'All your vehicles are in the same basement or adjacent parking towers. Complete up to 35 vehicles in under 3.5 hours with zero cross-city travel.',
    },
    {
      title: 'Weekly Digital Payouts',
      icon: IndianRupee,
      description:
        'Earn ₹12 to ₹21 per completed wash. Withdraw your earnings anytime directly to your bank account with instant IMPS settlement.',
    },
    {
      title: 'Flexible Leave Protection',
      icon: Calendar,
      description:
        'Need time off? Request leave with 1-tap in the app and your society partner team automatically covers your bays without losing your customers.',
    },
    {
      title: 'Trained Peer Community',
      icon: Users,
      description:
        'Work alongside verified peers in your society. Cover each other’s shifts, earn extra bonuses, and build respect in the community.',
    },
    {
      title: '100% Sunday Payments Bonus',
      icon: Gift,
      description:
        'Torque Care takes zero platform fees on Sundays — 100% of every Sunday morning wash payment goes directly into your pocket as a bonus.',
    },
    {
      title: 'Payout Protection on Missing Cars',
      icon: ShieldCheck,
      description:
        "Reached the assigned bay but the car is missing? Snap an empty bay photo. Marked Present ✓, Payout: Protected ✓. Never counted as a missed wash.",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">

      {/* AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#2DD4A0]/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 space-y-16 sm:space-y-20">
        {/* HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] shadow-md text-xs font-semibold text-white/70 mb-8">
            <Gift className="w-3.5 h-3.5 text-[#2DD4A0]" />
            <span className="tracking-[0.2em] uppercase font-mono text-[10px] text-[#2DD4A0]">
              100% SUNDAY PAYMENTS BONUS TO SPECIALISTS
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            More customers. Less chasing.
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            Transform local car cleaning into a predictable, tech-enabled profession with automated basement routes, protected payouts, and respect in the community.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {washerBenefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="p-8 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 shadow-xl space-y-4 transition-all relative flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#161C25] border border-white/[0.08] flex items-center justify-center text-[#2DD4A0]">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{b.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{b.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAIR WORK ECOSYSTEM & DIGNIFIED EMPLOYMENT */}
        <div className="p-8 sm:p-12 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
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
                <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08]">
                  <div className="text-lg font-bold text-white font-mono">100%</div>
                  <div className="text-white/65 mt-0.5">Fixed on-time bank transfers</div>
                </div>
                <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08]">
                  <div className="text-lg font-bold text-white font-mono">₹18,000+</div>
                  <div className="text-white/65 mt-0.5">Monthly earning potential</div>
                </div>
              </div>

              <div>
                <Link
                  href="/washer/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#2DD4A0] hover:underline"
                >
                  <span>Join our certified partner network or sign in →</span>
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

        {/* SUNDAY BONUS PAYMENTS CARD */}
        <div className="p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl relative overflow-hidden space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[#2DD4A0] text-[10px] font-mono font-bold uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-[#2DD4A0]" />
                100% PARTNER RETENTION
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Bonus Payment: All Sunday Payments Are For Specialists
              </h2>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
                Torque Care takes zero platform fees or commission on Sundays. 100% of every rupee car owners pay for Sunday morning washes is transferred straight to you as an instant bonus.
              </p>
            </div>

            {/* Direct Math Bento */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.06] text-center min-w-[95px]">
                <span className="text-[10px] uppercase font-bold text-white/50 block">Owner Pays</span>
                <span className="text-xl font-bold text-white mt-1 block">₹50</span>
                <span className="text-[9px] text-white/40">per car</span>
              </div>
              <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.06] text-center min-w-[95px]">
                <span className="text-[10px] uppercase font-bold text-white/50 block">Torque Fee</span>
                <span className="text-xl font-bold text-[#2DD4A0] mt-1 block">₹0</span>
                <span className="text-[9px] text-[#2DD4A0]">0% Cut</span>
              </div>
              <div className="p-4 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-center min-w-[105px]">
                <span className="text-[10px] uppercase font-bold text-[#2DD4A0] block">You Receive</span>
                <span className="text-xl font-black text-white mt-1 block">₹50</span>
                <span className="text-[9px] text-[#2DD4A0] font-bold">100% Bonus ✓</span>
              </div>
            </div>
          </div>

          {/* Sunday Perks Row */}
          <div className="pt-4 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs relative z-10">
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
              <span><strong>₹750 extra cash</strong> in ~1.5 hrs (15 cars)</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
              <span><strong>+₹3,000 to ₹4,000/month</strong> bonus earnings</span>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
              <span><strong>Instant IMPS payout</strong> directly to bank</span>
            </div>
          </div>
        </div>

        {/* Fair Partner Protection: Vehicle Unavailable Rule */}
        <div className="p-8 bg-[#11161D] text-white rounded-[20px] space-y-6 border border-white/[0.08] shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-400/20">
                PARTNER PAYOUT GUARANTEE
              </span>
              <h3 className="text-2xl font-bold text-white">
                Vehicle Unavailable? Your Payout is Protected.
              </h3>
              <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
                If you reach the assigned parking bay during the scheduled window, but the vehicle isn&apos;t at the bay, you still get paid:
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.06] text-center min-w-[110px]">
                <span className="text-[10px] text-white/50 uppercase font-bold block">Specialist</span>
                <span className="text-sm font-bold text-[#2DD4A0] flex items-center justify-center gap-1 mt-0.5">
                  Present ✓
                </span>
              </div>
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.06] text-center min-w-[110px]">
                <span className="text-[10px] text-white/50 uppercase font-bold block">Service</span>
                <span className="text-sm font-bold text-white/80 block mt-0.5">
                  Not possible
                </span>
              </div>
              <div className="p-3 bg-[#161C25] rounded-xl border border-white/[0.06] text-center min-w-[130px]">
                <span className="text-[10px] text-white/50 uppercase font-bold block">Payout</span>
                <span className="text-sm font-bold text-[#2DD4A0] flex items-center justify-center gap-1 mt-0.5">
                  Protected ✓
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#2DD4A0] font-bold">
              <Check className="w-4 h-4 text-[#2DD4A0] shrink-0" />
              <span>Never classified as a missed wash by the specialist.</span>
            </div>
            <div className="text-white/40 font-mono text-[11px]">
              Tap &apos;VEHICLE NOT AVAILABLE&apos; → Snap photo of assigned empty bay.
            </div>
          </div>
        </div>

        {/* Specialist Earning Potential */}
        <div className="p-8 sm:p-10 rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl space-y-6">
          <div className="max-w-xl space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0] block font-bold">
              EARNING POTENTIAL
            </span>
            <h3 className="text-2xl font-bold text-white">
              Expected Monthly Earnings
            </h3>
            <p className="text-xs text-white/60">
              Based on a single 3-hour morning route in a typical 500-apartment society + 100% Sunday payments bonus.
            </p>
          </div>

          {/* Rates Table */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#161C25] text-white/50 font-mono border-b border-white/[0.08]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Vehicle</th>
                  <th className="py-3 px-4 font-semibold">Customer (Monthly)</th>
                  <th className="py-3 px-4 font-semibold text-right">Specialist earns per completed wash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-medium text-white/80">
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-semibold">Hatchback / Sedan</td>
                  <td className="py-3 px-4 text-white/60">₹499</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#2DD4A0]">₹12</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-semibold">Compact / Mid SUV</td>
                  <td className="py-3 px-4 text-white/60">₹649</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#2DD4A0]">₹16</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 text-white font-semibold">Luxury / 7-Seater+</td>
                  <td className="py-3 px-4 text-white/60">₹799</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#2DD4A0]">₹21</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06]">
              <span className="text-xs text-white/50 font-medium">Daily Route (Mon-Sat)</span>
              <div className="text-2xl font-bold text-white mt-1">30 Cars</div>
              <span className="text-[11px] text-white/40 font-mono">~3 hours / morning</span>
            </div>

            <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06]">
              <span className="text-xs text-[#2DD4A0] font-semibold flex items-center justify-center gap-1">
                <Gift className="w-3.5 h-3.5 text-[#2DD4A0]" />
                Sunday Bonus (100%)
              </span>
              <div className="text-2xl font-bold text-white mt-1">+₹3,000</div>
              <span className="text-[11px] text-white/40">All Sunday payments for you</span>
            </div>

            <div className="p-4 bg-[#161C25] rounded-xl border border-white/[0.06]">
              <span className="text-xs text-[#2DD4A0] font-semibold">Total Monthly Take-Home</span>
              <div className="text-2xl font-bold text-[#2DD4A0] font-mono mt-1">₹21,500+</div>
              <span className="text-[11px] text-white/40 font-mono">100% on-time transfer</span>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/washer/login"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-sm shadow-md transition-all active:scale-95"
            >
              <span>Partner Login & Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
