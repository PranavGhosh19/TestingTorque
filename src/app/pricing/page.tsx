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
      badge: 'RECOMMENDED PLAN',
      popular: true,
      tagline: 'Essential weekday care for daily office commuters',
      monthlyPrice: selectedTier.customerPrice,
      washesPerWeek: '6 Days / week (Mon – Sat)',
      features: [
        'Exterior microfiber gentle wash',
        'Windshield & side mirror clarity buff',
        'Verified photo proof every wash',
        'Washer-appointed backup coverage',
      ],
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#080D1A] text-slate-100 overflow-hidden selection:bg-blue-500 selection:text-white py-20 sm:py-28">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* FULL-WIDTH RESPONSIVE INNER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* HEADER SECTION — AIRY & SPACIOUS */}
        <div className="text-center max-w-3xl mx-auto">
          {/* Kicker Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/15 backdrop-blur-md shadow-lg text-xs font-semibold text-slate-200 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-widest uppercase font-mono text-[11px] text-blue-300">
              Transparent Membership Pricing
            </span>
          </div>

          {/* Grand Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Simple, Fair <span className="text-gradient-blue">Monthly Plans</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto font-normal leading-relaxed mb-10">
            Torque Care Home starts at ₹599/mo for recurring society care. Torque Care Away starts at ₹39/wash for travel flexibility.
          </p>

          {/* Vehicle Selector */}
          <div className="flex items-center justify-center pt-2">
            <div className="bg-white/5 border border-white/10 p-1.5 rounded-2xl flex flex-wrap items-center justify-center gap-1.5 backdrop-blur-xl shadow-2xl">
              <button
                onClick={() => setVehicleType('hatch_sedan')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  vehicleType === 'hatch_sedan'
                    ? 'bg-white text-[#080D1A] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hatchback & Sedan
              </button>
              <button
                onClick={() => setVehicleType('suv')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  vehicleType === 'suv'
                    ? 'bg-white text-[#080D1A] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Compact & Mid SUV
              </button>
              <button
                onClick={() => setVehicleType('luxury')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  vehicleType === 'luxury'
                    ? 'bg-white text-[#080D1A] shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Luxury / 7-Seater+
              </button>
            </div>
          </div>
        </div>

        {/* 2 SERVICE PILLARS BANNER — DISTINCT & SPACIOUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="p-7 rounded-3xl bg-blue-500/10 border border-blue-400/30 flex items-center gap-4 luxury-sheen shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs uppercase font-mono font-bold text-blue-300">Torque Care Home</div>
              <div className="text-xl font-black text-white">Starting at ₹599 / month</div>
              <div className="text-xs text-slate-300 mt-0.5">Recurring daily society parking bay care.</div>
            </div>
          </div>

          <Link
            href="/owner/travel"
            className="p-7 rounded-3xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between gap-4 hover:border-amber-400/60 transition-all group luxury-sheen shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex flex-col items-center justify-center shrink-0">
                <Car className="w-6 h-6" />
                <div className="w-6 h-0.5 bg-amber-400/80 rounded-full mt-0.5" />
              </div>
              <div>
                <div className="text-xs uppercase font-mono font-bold text-amber-300">Torque Care Away</div>
                <div className="text-xl font-black text-white">Starting at ₹39 / wash</div>
                <div className="text-xs text-slate-300 mt-0.5">Or &ldquo;Book Until Return&rdquo; while travelling.</div>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              Book →
            </span>
          </Link>
        </div>

        {/* PRICING CARDS CONTAINER — CENTERED & LUXURY PROPORTIONS */}
        <div className="max-w-xl mx-auto w-full pt-6">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-8 sm:p-9 rounded-3xl flex flex-col justify-between relative transition-all shadow-2xl overflow-visible ${
                p.popular
                  ? 'border-2 border-blue-500 bg-linear-to-b from-blue-500/15 via-[#0B132B] to-[#080D1A] md:-translate-y-2 z-10 shadow-[0_20px_50px_rgba(59,130,246,0.25)]'
                  : 'border border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap pointer-events-none">
                  <span
                    className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl flex items-center gap-1.5 border ${
                      p.popular
                        ? 'bg-blue-600 text-white border-blue-400/50 shadow-blue-500/40'
                        : 'bg-slate-800 text-slate-200 border-white/20 shadow-black/50'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                    {p.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="mb-2">
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {p.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 min-h-[36px]">{p.tagline}</p>

                <div className="mt-6 pt-6 border-t border-white/10 flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white">
                    ₹{p.monthlyPrice}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 font-mono">/ month</span>
                </div>

                <div className="mt-5 p-4 bg-white/5 rounded-2xl text-xs border border-white/10 font-mono text-center sm:text-left">
                  <div className="font-bold text-white">{p.washesPerWeek}</div>
                </div>

                {/* Feature Checklist */}
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10">
                <Link
                  href="/auth/signup"
                  className={`w-full py-4 px-4 rounded-2xl text-center font-black text-xs flex items-center justify-center gap-2 transition-all ${
                    p.popular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg active:scale-95'
                      : 'bg-white hover:bg-slate-100 text-[#080D1A] active:scale-95'
                  }`}
                >
                  <span>Select {p.name} ({selectedTier.label})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* SOCIETY BULK DISCOUNTS BANNER — FULL WIDTH FIT */}
        <div className="p-8 sm:p-10 bg-white/5 rounded-3xl border border-white/15 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl luxury-sheen">
          <div className="space-y-1">
            <div className="font-black text-white text-base">
              Are you a RWA / Apartment Society Association?
            </div>
            <div className="text-xs text-slate-300 max-w-xl leading-relaxed">
              We offer centralized society onboarding with discounted bulk rates, parking bay mapping, and dedicated supervisor oversight.
            </div>
          </div>
          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs text-center shrink-0 shadow-md transition-all active:scale-95"
          >
            Contact Society Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
