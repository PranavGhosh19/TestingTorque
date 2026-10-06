'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Home, Car, Sparkles } from 'lucide-react';

interface PricingPlan {
  id: string;
  name: string;
  badge?: string;
  tagline: string;
  monthlyPrice: number;
  popular?: boolean;
  washesPerWeek: string;
  features: string[];
}

export default function PricingPage() {
  const [vehicleType, setVehicleType] = useState<'hatch_sedan' | 'suv' | 'luxury'>('hatch_sedan');

  // Vehicle category customer pricing
  const vehicleTiers: Record<
    'hatch_sedan' | 'suv' | 'luxury',
    { label: string; customerPrice: number }
  > = {
    hatch_sedan: { label: 'Hatchback / Sedan', customerPrice: 599 },
    suv: { label: 'Compact / Mid SUV', customerPrice: 649 },
    luxury: { label: 'Luxury / 7-Seater+', customerPrice: 799 },
  };

  const selectedTier = vehicleTiers[vehicleType];

  const plans: PricingPlan[] = [
    {
      id: 'basic',
      name: 'HOME BASIC',
      badge: 'POPULAR CHOICE',
      popular: true,
      tagline: 'Essential weekday care for daily apartment commuters',
      monthlyPrice: selectedTier.customerPrice,
      washesPerWeek: '6 Days / week (Mon – Sat)',
      features: [
        'Exterior microfiber gentle scratchless wash',
        'Windshield & mirror clarity buff',
        'Verified photo proof every morning',
        'Washer-appointed peer backup coverage',
        'Keyless exterior bay care protocol',
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">

      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#2DD4A0]/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 space-y-14">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] shadow-md text-xs font-semibold text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
            <span className="tracking-[0.2em] uppercase font-mono text-[10px] text-[#2DD4A0]">
              TRANSPARENT SOCIETY RATES
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
            Simple, Fair Monthly Plans
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto leading-relaxed mb-8">
            Torque Care Home starts at ₹599/mo for recurring society care with verified morning photo certificates.
          </p>

          {/* Vehicle Selector */}
          <div className="flex items-center justify-center pt-2">
            <div className="bg-[#11161D] border border-white/[0.08] p-1.5 rounded-full flex flex-wrap items-center justify-center gap-1 shadow-xl">
              <button
                onClick={() => setVehicleType('hatch_sedan')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  vehicleType === 'hatch_sedan'
                    ? 'bg-white text-[#0A0D12] shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Hatchback & Sedan
              </button>
              <button
                onClick={() => setVehicleType('suv')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  vehicleType === 'suv'
                    ? 'bg-white text-[#0A0D12] shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Compact & Mid SUV
              </button>
              <button
                onClick={() => setVehicleType('luxury')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  vehicleType === 'luxury'
                    ? 'bg-white text-[#0A0D12] shadow-md'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Luxury / 7-Seater+
              </button>
            </div>
          </div>
        </div>

        {/* 2 SERVICE PILLARS BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-7 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex items-center gap-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-[#161C25] text-[#2DD4A0] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono font-bold text-[#2DD4A0] tracking-[0.2em]">TORQUE CARE HOME</div>
              <div className="text-xl font-bold text-white">Starting at ₹599 / month</div>
              <div className="text-xs text-white/60 mt-0.5">Recurring daily society parking bay care.</div>
            </div>
          </div>

          <div className="p-7 rounded-[20px] bg-[#11161D] border border-white/[0.08] flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#161C25] text-amber-400 border border-white/[0.08] flex items-center justify-center shrink-0">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-amber-300 tracking-[0.2em]">TORQUE CARE AWAY</div>
                <div className="text-xl font-bold text-amber-400">Coming Soon! Stay Tuned</div>
                <div className="text-xs text-white/60 mt-0.5">On-demand verified car care while travelling.</div>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/80 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              Soon
            </span>
          </div>
        </div>

        {/* PRICING CARDS CONTAINER */}
        <div className="max-w-md mx-auto w-full pt-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="p-8 sm:p-9 rounded-[20px] bg-[#11161D] border border-white/[0.08] hover:border-white/20 flex flex-col justify-between relative transition-all shadow-2xl overflow-visible"
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none">
                  <span className="text-[10px] font-mono font-bold px-4 py-1 rounded-full uppercase tracking-wider bg-[#2DD4A0] text-[#0A0D12] shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#0A0D12] shrink-0" />
                    {p.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#2DD4A0] block mb-1">
                    APARTMENT MEMBERSHIP
                  </span>
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {p.name}
                  </h3>
                </div>
                <p className="text-xs text-white/60 min-h-[36px]">{p.tagline}</p>

                <div className="mt-6 pt-6 border-t border-white/[0.08] flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    ₹{p.monthlyPrice}
                  </span>
                  <span className="text-xs text-white/50 font-mono">/ month</span>
                </div>

                <div className="mt-5 p-3.5 bg-[#161C25] rounded-xl text-xs border border-white/[0.06] font-mono text-center sm:text-left">
                  <div className="font-bold text-white/90">{p.washesPerWeek}</div>
                </div>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3 text-xs text-white/70">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#2DD4A0] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.08]">
                <Link
                  href="/auth/signup"
                  className="w-full py-3.5 px-4 rounded-full text-center font-bold text-xs flex items-center justify-center gap-2 transition-all bg-white hover:bg-neutral-200 text-[#0A0D12] shadow-md active:scale-95"
                >
                  <span>Select {p.name} ({selectedTier.label})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SOCIETY BULK DISCOUNTS BANNER */}
        <div className="p-8 sm:p-10 bg-[#11161D] rounded-[20px] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl max-w-4xl mx-auto">
          <div className="space-y-1">
            <div className="font-bold text-white text-base">
              Are you an RWA / Apartment Society Association?
            </div>
            <div className="text-xs text-white/60 max-w-xl leading-relaxed">
              We offer centralized society onboarding with discounted bulk rates, parking bay mapping, and dedicated supervisor oversight.
            </div>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-[#161C25] hover:bg-white/10 text-white border border-white/[0.08] font-bold text-xs text-center shrink-0 transition-all active:scale-95"
          >
            Contact Society Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
