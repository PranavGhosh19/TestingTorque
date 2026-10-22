'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Header */}
      <header className="relative pt-12 pb-14 sm:pt-16 sm:pb-16 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Terms &amp; Conditions</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Terms of Service
          </h1>

          <p className="text-xs font-mono text-white/50">
            Last Updated: October 21, 2026 • Torque Care Technologies Inc.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 text-white/80 leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the website, applications, or tools provided by <strong>Torque Care</strong> (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, you should discontinue using the Service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">2. Nature of the Service</h2>
          <p>
            Torque Care is a technology platform providing digital record-keeping, attendance verification, and monthly payment calculation utilities for vehicle owners and society communities.
          </p>
          <p>
            Unless explicitly agreed under an enterprise community management contract, <strong>Torque Care does not employ local car cleaning technicians</strong>. Cleaners remain independent service providers engaged directly by car owners or apartment RWAs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">3. User Responsibilities &amp; Fair Logging</h2>
          <p>Users agree to:</p>
          <ul className="list-disc pl-5 space-y-2 text-white/70">
            <li>Provide accurate vehicle registration and bay information.</li>
            <li>Maintain honesty when recording daily wash confirmations (Yes / No).</li>
            <li>Directly execute payment settlements with their cleaners in good faith and with mutual respect.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">4. Payment Calculator &amp; Deductions Disclaimer</h2>
          <p>
            Calculations provided by the <em>Monthly Car Wash Payment Calculator</em> and monthly settlement cards are mathematical suggestions based on user-input rates, scheduled holidays, and recorded skips. Torque Care is not a bank or payment processor and is not liable for disputes arising from private payment settlements between owners and cleaners.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">5. Intellectual Property</h2>
          <p>
            All software, design elements, algorithms, logos, and written guides on Torque Care are the intellectual property of Torque Care Technologies Inc. You may not copy, reverse-engineer, or commercially exploit any part of the platform without prior written consent.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Torque Care Technologies Inc. shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service, vehicle scratches or damage caused by cleaners, or payment disagreements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">7. Modifications &amp; Governing Law</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of revised terms. These terms are governed by the laws of India, with jurisdiction in Bengaluru, Karnataka.
          </p>
          <div className="p-4 rounded-xl bg-[#11161D] border border-white/[0.08] font-mono text-xs text-white/70 space-y-1">
            <div>Support &amp; Legal Desk: care@torquecare.in</div>
            <div>Torque Care Technologies Inc.</div>
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
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="text-[#2DD4A0]">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
          <div>© 2026 Torque Care Technologies Inc.</div>
        </div>
      </footer>
    </div>
  );
}
