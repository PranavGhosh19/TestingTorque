'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageSquare, Check, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#4F7CFF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Support & Inquiries
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B132B] tracking-tight">
          We&apos;re Here to Help
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          Need help with your subscription, have a touchup inquiry, or want to bring Torque Care to your apartment society?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-[#0B132B] text-sm">Direct Channels</h3>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Helpline</div>
                <div>+91 1800 420 9000 (6 AM – 9 PM)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">WhatsApp Support</div>
                <div>+91 98111 00000 (Instant Bot & Agent)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-slate-800">Email</div>
                <div>care@torquecare.in</div>
              </div>
            </div>
          </div>

          <div className="p-5 bg-[#0B132B] text-white rounded-2xl text-xs space-y-2">
            <div className="font-bold text-sm">Society Onboarding</div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              We provide free site audits and trial runs for RWA management committees looking to standardize car washing.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0B132B]">Message Received</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you! Our operations support desk will respond within 30 minutes.
              </p>
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
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Pranav Ghosh"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Society Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Green Valley Residency"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  How can we help you?
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tell us about your query, society requirement, or feedback..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B132B] hover:bg-[#162347] text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
