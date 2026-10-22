'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, ArrowRight } from 'lucide-react';
import TorqueLogo from '@/components/brand/TorqueLogo';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black font-sans">
      {/* Header */}
      <header className="relative pt-12 pb-14 sm:pt-16 sm:pb-16 border-b border-white/[0.08] overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2DD4A0]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/20 text-[#2DD4A0] text-xs font-mono font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Legal &amp; Trust</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-automotive-title">
            Privacy Policy
          </h1>

          <p className="text-xs font-mono text-white/50">
            Last Updated: October 21, 2026 • Torque Care Technologies Inc.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 text-white/80 leading-relaxed text-sm sm:text-base">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">1. Overview &amp; Commitment</h2>
          <p>
            At <strong>Torque Care</strong> (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;), your privacy is fundamental. We build digital record-keeping tools for urban car care, designed to keep car owners and cleaners aligned through transparent wash attendance records. We do not sell your personal data, nor do we run predatory third-party advertising networks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">2. Information We Collect</h2>
          <p>We collect only the minimal data strictly necessary to provide the service:</p>
          <ul className="list-disc pl-5 space-y-2 text-white/70">
            <li><strong>Account Data:</strong> Name, email address, and authentication tokens provided when signing in via Google OAuth or email authentication.</li>
            <li><strong>Vehicle &amp; Parking Bay Details:</strong> Vehicle make, model, registration number, society/apartment community name, and assigned parking bay number.</li>
            <li><strong>Wash Attendance Logs:</strong> Daily Yes / No wash status confirmations, timestamps, and month-end calculated summaries.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">3. What We Do NOT Collect</h2>
          <ul className="list-disc pl-5 space-y-2 text-white/70">
            <li><strong>No Continuous GPS Tracking:</strong> We never track your vehicle’s live coordinates or monitor your movements in the background.</li>
            <li><strong>No Financial Card Details:</strong> We do not store credit card numbers, CVVs, or bank account credentials. Payment settlements are made directly between owners and washers via third-party UPI apps.</li>
            <li><strong>No Intrusive Surveillance:</strong> We do not operate video cameras or collect biometric data.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">4. How We Use Your Information</h2>
          <p>Your information is used strictly to:</p>
          <ul className="list-disc pl-5 space-y-2 text-white/70">
            <li>Display your personal daily wash calendar and calculate fair monthly deductions.</li>
            <li>Provide society administrators with aggregated operational attendance if your building has opted into community management.</li>
            <li>Send critical service updates and account security notifications.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">5. Data Storage &amp; Security</h2>
          <p>
            All records are stored using industry-standard encrypted cloud databases (Google Cloud Firebase &amp; Firestore) adhering to enterprise SOC 2 and ISO 27001 standards. Access is restricted by strict role-based security rules.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">6. Your Rights &amp; Data Deletion</h2>
          <p>
            You have the right to request a full export of your wash history or complete deletion of your account and personal records at any time. Simply email our data protection desk at <a href="mailto:care@torquecare.in" className="text-[#2DD4A0] underline">care@torquecare.in</a> and your request will be processed within 48 hours.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white tracking-tight">7. Contact Information</h2>
          <p>
            For privacy inquiries, questions, or compliance notices, please contact us at:
          </p>
          <div className="p-4 rounded-xl bg-[#11161D] border border-white/[0.08] font-mono text-xs text-white/70 space-y-1">
            <div>Torque Care Technologies Inc.</div>
            <div>Email: care@torquecare.in</div>
            <div>Website: https://torquecare.in</div>
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
            <Link href="/privacy" className="text-[#2DD4A0]">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </div>
          <div>© 2026 Torque Care Technologies Inc.</div>
        </div>
      </footer>
    </div>
  );
}
