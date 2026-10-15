'use client';

import React from 'react';
import Link from 'next/link';
import {
  Car,
  Users,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function GetStartedRoleSelectionPage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-between selection:bg-[#2DD4A0] selection:text-black relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="fixed inset-0 bg-[#0A0D12] -z-20 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[#2DD4A0]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Top Header with Centered Logo */}
      <header className="border-b border-white/[0.08] bg-[#0A0D12]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back to Home</span>
          </Link>

          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="inline-flex items-center justify-center group hover:opacity-95 transition-opacity">
              <TorqueLogo emblemSize={40} />
            </Link>
          </div>

          <div className="text-xs text-white/40 font-mono hidden sm:block">
            Portal Selection
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16 flex-1 flex flex-col justify-center">
        {/* Title Section */}
        <div className="text-center space-y-3 mb-10 sm:mb-14">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Select Your Portal
          </h1>
          <p className="text-sm sm:text-base text-white/60 max-w-lg mx-auto leading-relaxed">
            Choose your portal below to subscribe to verified society morning car care or access your partner shift routes.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-3xl mx-auto w-full">
          {/* ========================================================= */}
          {/* OPTION 1: CAR OWNER */}
          {/* ========================================================= */}
          <Link
            href="/auth/signup"
            className="group p-7 sm:p-8 rounded-[28px] bg-gradient-to-b from-[#141C26] via-[#11161F] to-[#0D1219] border border-white/[0.12] hover:border-[#2DD4A0]/60 transition-all duration-300 flex flex-col justify-between relative shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(45,212,160,0.15)] hover:-translate-y-1"
          >
            <div className="space-y-6">
              {/* Badge & Icon Header */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[#2DD4A0] flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-[#2DD4A0]/20 group-hover:shadow-[0_0_24px_rgba(45,212,160,0.3)]">
                  <Car className="w-7 h-7" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2DD4A0] text-black px-3 py-1 rounded-full font-mono shadow-sm">
                  Resident Portal
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-[#2DD4A0] transition-colors flex items-center gap-2">
                  <span>Car Owner</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#2DD4A0]" />
                </h2>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-8">
              <div className="w-full py-4 px-6 rounded-2xl bg-white group-hover:bg-[#2DD4A0] text-[#0A0D12] font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg">
                <span>Continue as Car Owner</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>

          {/* ========================================================= */}
          {/* OPTION 2: WASHER PARTNER */}
          {/* ========================================================= */}
          <Link
            href="/washer/login"
            className="group p-7 sm:p-8 rounded-[28px] bg-gradient-to-b from-[#161C25] via-[#11161F] to-[#0D1219] border border-white/[0.12] hover:border-emerald-400/60 transition-all duration-300 flex flex-col justify-between relative shadow-[0_12px_40px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(52,211,153,0.12)] hover:-translate-y-1"
          >
            <div className="space-y-6">
              {/* Badge & Icon Header */}
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_24px_rgba(52,211,153,0.3)]">
                  <Users className="w-7 h-7 text-emerald-400" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-mono">
                  Partner Route
                </span>
              </div>

              {/* Title */}
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <span>Washer Partner</span>
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400" />
                </h2>
              </div>
            </div>

            {/* Bottom CTA Button */}
            <div className="pt-8">
              <div className="w-full py-4 px-6 rounded-2xl bg-[#1A222F] group-hover:bg-emerald-400 text-white group-hover:text-black border border-white/10 group-hover:border-emerald-400 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg">
                <span>Washer Login / Sign Up</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>
          </Link>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-white/40">
        <p>© {new Date().getFullYear()} Torque Care. All rights reserved.</p>
      </footer>
    </div>
  );
}
