'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageSquare, Check, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white selection:bg-[#2DD4A0] selection:text-black">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161C25] border border-white/[0.08] text-[11px] font-mono tracking-[0.2em] uppercase font-bold text-[#2DD4A0]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Support & Society Audits
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            We&apos;re Here to Help.
          </h1>
          <p className="text-sm text-white/60 max-w-md mx-auto">
            Need help with your subscription, have a touchup inquiry, or want to bring Torque Care to your apartment society?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Contact Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 bg-[#11161D] rounded-[20px] border border-white/[0.08] space-y-4">
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-[#2DD4A0] font-bold">
                Direct Channels
              </h3>

              <div className="flex items-center gap-3.5 text-xs text-white/80 p-3 rounded-xl bg-[#161C25] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-[#2DD4A0] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Helpline</div>
                  <div className="text-white/60 font-mono text-[11px]">+91 1800 420 9000 (6 AM – 9 PM)</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs text-white/80 p-3 rounded-xl bg-[#161C25] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-[#2DD4A0] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">WhatsApp Support</div>
                  <div className="text-white/60 font-mono text-[11px]">+91 98111 00000 (Instant Concierge)</div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 text-xs text-white/80 p-3 rounded-xl bg-[#161C25] border border-white/[0.04]">
                <div className="w-9 h-9 rounded-xl bg-white/[0.06] text-[#2DD4A0] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white">Email</div>
                  <div className="text-white/60 font-mono text-[11px]">care@torquecare.in</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#161C25] border border-[#2DD4A0]/20 rounded-[20px] text-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2DD4A0] animate-pulse" />
                <span className="font-mono text-[11px] font-bold tracking-widest text-[#2DD4A0] uppercase">
                  Society Onboarding
                </span>
              </div>
              <p className="text-white/70 text-xs leading-relaxed">
                We provide free site audits, water-metered inspections, and trial runs for RWA management committees looking to standardize car washing.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7 bg-[#11161D] p-6 sm:p-8 rounded-[20px] border border-white/[0.08]">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-[#2DD4A0] mx-auto flex items-center justify-center">
                  <Check className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Received</h3>
                <p className="text-xs text-white/60 max-w-xs mx-auto leading-relaxed">
                  Thank you! Our operations support desk will respond to your mobile within 30 minutes.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-full bg-[#161C25] text-white text-xs font-mono uppercase tracking-wider hover:bg-white/10 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Pranav Ghosh"
                    className="w-full p-3 bg-[#161C25] border border-white/[0.08] focus:border-[#2DD4A0] rounded-xl text-xs font-medium text-white placeholder:text-white/30 focus:outline-hidden transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full p-3 bg-[#161C25] border border-white/[0.08] focus:border-[#2DD4A0] rounded-xl text-xs font-medium text-white placeholder:text-white/30 focus:outline-hidden transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block mb-1.5">
                      Society Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Green Valley Residency"
                      className="w-full p-3 bg-[#161C25] border border-white/[0.08] focus:border-[#2DD4A0] rounded-xl text-xs font-medium text-white placeholder:text-white/30 focus:outline-hidden transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-white/50 uppercase tracking-wider block mb-1.5">
                    How can we help you?
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your vehicle query, society requirement, or subscription feedback..."
                    className="w-full p-3 bg-[#161C25] border border-white/[0.08] focus:border-[#2DD4A0] rounded-xl text-xs font-medium text-white placeholder:text-white/30 focus:outline-hidden transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-full bg-[#2DD4A0] hover:bg-[#25B88A] text-[#0A0D12] font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Dispatch Request</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
