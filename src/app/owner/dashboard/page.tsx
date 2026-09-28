'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Star,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Plus,
  ArrowRight,
  History,
  Home,
  Car,
} from 'lucide-react';
import SignatureProofCard from '@/components/SignatureProofCard';
import OwnerProofCalendar from '@/components/OwnerProofCalendar';
import SundayPriorityModal from '@/components/modals/SundayPriorityModal';
import AddVehicleModal from '@/components/modals/AddVehicleModal';
import OwnerBottomNav from '@/components/OwnerBottomNav';
import { useStore } from '@/lib/store';

export default function OwnerDashboardPage() {
  const { user, vehicles, todayWash, washes } = useStore();
  const [showSundayModal, setShowSundayModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  const primaryVehicle = vehicles[0] || {
    make: 'Honda',
    model: 'City ZX',
    registration_number: 'DL 01 AB 4291',
    parking_location: 'Block B • Bay D-14',
    washes_this_month: 22,
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-28 md:pb-16 selection:bg-blue-500 selection:text-white">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Top Welcome Header */}
      <header className="bg-[#0B132B]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Torque Care Private Dashboard
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Good morning, {user.name.split(' ')[0]} 👋
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowSundayModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-bold transition-all border border-amber-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sunday Priority</span>
            </button>
            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] text-xs font-black transition-all shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Vehicle</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* HERO SIGNATURE PROOF CARD */}
        <SignatureProofCard wash={todayWash} />

        {/* TRAVEL & AWAY MODE PROPOSITION BANNER */}
        <div className="p-7 rounded-3xl bg-linear-to-r from-amber-500/20 via-[#0B132B] to-[#080D1A] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-2xl border border-amber-500/30 specular-border luxury-sheen relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 tracking-wider">
              <span>🚗 Away Mode</span>
              <span className="text-slate-500">•</span>
              <span>Torque Care Away</span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight">
              Going somewhere? Don&apos;t pause your car care.
            </h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              Find nearest verified partner in Jaipur, Bengaluru, Goa & more. Book &ldquo;Until I Return&rdquo; for continuous peace of mind.
            </p>
          </div>
          <Link
            href="/owner/travel"
            className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 flex items-center gap-2 shadow-xl transition-all active:scale-[0.98]"
          >
            <span>Activate Away Mode</span>
            <ArrowRight className="w-4 h-4 text-slate-950" />
          </Link>
        </div>

        {/* SERVICE PILLARS STATUS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Home */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> Torque Home
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Active Plan
              </span>
            </div>
            <div className="text-xl font-black text-white">Starting at ₹599 / month</div>
            <p className="text-xs text-slate-400">
              Recurring society bay care by Amit Kumar at Green Valley.
            </p>
          </div>

          {/* Away */}
          <Link
            href="/owner/travel"
            className="p-5 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-xl space-y-2 transition-all block group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5" /> Torque Away
              </span>
              <span className="text-[10px] font-bold text-amber-300 group-hover:underline">
                Book →
              </span>
            </div>
            <div className="text-xl font-black text-white">Starting at ₹39 / wash or Book Until Return</div>
            <p className="text-xs text-slate-400">
              Nationwide partners whenever you travel to another city.
            </p>
          </Link>
        </div>

        {/* NEXT WASH & WASHER INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Next Wash Schedule */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Next Wash Schedule
              </span>
              <div className="text-lg font-black text-white mt-1">
                Tomorrow • 7:30 AM
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {primaryVehicle.parking_location}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Regular Washer Info */}
          <div className="p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400/40 shrink-0 shadow-md">
                <Image
                  src="/images/washer_amit.jpg"
                  alt="Amit Kumar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Assigned Partner
                </span>
                <div className="text-base font-black text-white">
                  Amit Kumar
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mt-0.5">
                  <span>★ 4.9</span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    (1,240 washes)
                  </span>
                </div>
              </div>
            </div>
            <Link
              href="/owner/washes/history"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* THIS MONTH METRICS */}
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-3 px-1">
            This Month Overview
          </span>
          <div className="grid grid-cols-3 gap-3.5">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white">
                22
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Washes
              </div>
              <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 font-mono">
                ✓ 100% Verified
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                1
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Missed
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                Auto-credited
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 text-center backdrop-blur-xl shadow-xl">
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹599
              </div>
              <div className="text-xs font-bold text-slate-300 mt-1">
                Subscription
              </div>
              <span className="text-[10px] text-blue-400 font-bold block mt-0.5 font-mono">
                Active Plan
              </span>
            </div>
          </div>
        </div>

        {/* MONTHLY PROOF CALENDAR (HIGHLIGHTING ACTIVE SUB, NEON GREEN VERIFIED, ORANGE-YELLOW MISSING) */}
        <OwnerProofCalendar />

        {/* TORQUE CARE VEHICLE HISTORY (Unified across cities) */}
        <section className="p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-400" />
                Torque Care Vehicle History
              </span>
              <p className="text-xs text-slate-400 mt-0.5">
                All services appear in one vehicle history, wherever you travel.
              </p>
            </div>
            <Link
              href="/owner/washes/history"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              <span>Full Audit Trail</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {washes.slice(0, 4).map((wash) => {
              const isAway = wash.service_type === 'away';
              const city = wash.city || 'Delhi';

              return (
                <div
                  key={wash.id}
                  className="p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isAway
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      }`}
                    >
                      {isAway ? (
                        <span className="text-sm">🚗</span>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap font-sans">
                        <span className="text-xs font-black text-white">
                          {wash.scheduled_date} — {city}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isAway
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {wash.service_type || 'home'}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-400">
                          Completed ✓
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {wash.washer_name} • {wash.parking_location}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/owner/washes/${wash.id}`}
                    className="text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3 py-1.5 rounded-xl transition-all shrink-0"
                  >
                    View Proof
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Modals */}
      <SundayPriorityModal
        isOpen={showSundayModal}
        onClose={() => setShowSundayModal(false)}
      />
      <AddVehicleModal
        isOpen={showAddVehicleModal}
        onClose={() => setShowAddVehicleModal(false)}
      />

      {/* Mobile Bottom Navigation */}
      <OwnerBottomNav />
    </div>
  );
}
