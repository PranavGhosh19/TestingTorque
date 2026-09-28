'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Car,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Camera,
  Wallet,
  WifiOff,
  Building2,
  ChevronDown,
  X,
  ShieldCheck,
  Check,
  Phone,
  User,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import WasherBottomNav from '@/components/WasherBottomNav';
import WasherWashWorkflowModal from '@/components/modals/WasherWashWorkflowModal';
import CustomerUnavailableModal from '@/components/modals/CustomerUnavailableModal';
import { RouteStop } from '@/lib/types';

export default function WasherDashboardPage() {
  const {
    routeStops,
    washerEarnings,
    isOffline,
  } = useStore();

  // Modals state
  const [activeStop, setActiveStop] = useState<RouteStop | null>(null);
  const [showWashModal, setShowWashModal] = useState(false);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const [viewingProofStop, setViewingProofStop] = useState<RouteStop | null>(null);

  // Society-wise dropdown state
  const [selectedSociety, setSelectedSociety] = useState<string>('all');

  // Present Date (Current Local Date)
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const formattedPresentDate = today.toLocaleDateString('en-US', options); // e.g. "Mon, Sep 28, 2026"

  // Unique societies from route stops
  const societies = Array.from(
    new Set(routeStops.map((s) => s.society_name || 'Green Valley Residency'))
  );

  // Filter cars based on selected society
  const filteredStops = routeStops.filter((stop) => {
    if (selectedSociety === 'all') return true;
    return (stop.society_name || 'Green Valley Residency') === selectedSociety;
  });

  // Target metrics calculation
  const totalTargetCount = routeStops.length;
  const completedStops = routeStops.filter((s) => s.status === 'completed');
  const completedCount = completedStops.length;
  const pendingCount = routeStops.filter(
    (s) => s.status === 'current' || s.status === 'pending'
  ).length;
  const unavailableCount = routeStops.filter(
    (s) => s.status === 'vehicle_unavailable'
  ).length;
  const progressPercent = Math.round((completedCount / totalTargetCount) * 100);

  // Today's total expected earnings calculation
  const totalExpectedPayout = routeStops.reduce((sum, s) => sum + s.payout_amount, 0);
  const earnedSoFar = completedStops.reduce((sum, s) => sum + s.payout_amount, 0);

  const handleOpenUploadProof = (stop: RouteStop) => {
    setActiveStop(stop);
    setShowWashModal(true);
  };

  const handleOpenUnavailable = (stop: RouteStop) => {
    setActiveStop(stop);
    setShowUnavailableModal(true);
  };

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-28 md:pb-16 selection:bg-emerald-500 selection:text-white">
      {/* LUXURY AMBIENT GLOWS */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* ============================================================ */}
      {/* 1. TOP OPERATIONAL HEADER: GREETING & RIGHT-ALIGNED DATE     */}
      {/* ============================================================ */}
      <header className="bg-[#0B132B]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Washer Avatar & Good Morning Name */}
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400 shrink-0 shadow-lg">
              <Image
                src="/images/washer_amit.jpg"
                alt="Amit Kumar"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Operations Console
                </span>
                {isOffline && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Good Morning, Amit 👋
              </h1>
            </div>
          </div>

          {/* Right: Present Date Aligned to Good Morning, Name */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-lg shrink-0 self-start sm:self-auto">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-right sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block font-bold">
                Present Date
              </span>
              <span className="text-xs sm:text-sm font-black text-white font-mono tracking-tight">
                {formattedPresentDate}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7">
        {/* ============================================================ */}
        {/* 2. TOTAL TARGET OVERVIEW CARD                                */}
        {/* ============================================================ */}
        <section className="p-6 sm:p-7 rounded-3xl bg-linear-to-r from-[#0B132B] via-[#0D183A] to-[#0B132B] border border-white/15 shadow-2xl relative overflow-hidden luxury-sheen">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Shift Milestones
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Total Target: {totalTargetCount} Vehicles
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Society basement cluster route • Zero travel lag • Guaranteed payout
              </p>
            </div>

            <div className="text-left sm:text-right bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/10 sm:border-0">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                Shift Earnings
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                ₹{earnedSoFar} <span className="text-xs font-bold text-slate-400 font-sans">/ ₹{totalExpectedPayout}</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-400/20 mt-1 inline-block">
                Instant Transfer Protected ✓
              </span>
            </div>
          </div>

          {/* Progress Bar & Breakdown */}
          <div className="pt-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300 font-medium">Shift Progress</span>
              <span className="text-emerald-400 font-extrabold">{progressPercent}% Completed</span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/15">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
                <span className="text-xl font-black text-emerald-300 font-mono block">
                  {completedCount}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  Proof Uploaded
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-400/30">
                <span className="text-xl font-black text-blue-300 font-mono block">
                  {pendingCount}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  Pending Washes
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                <span className="text-xl font-black text-amber-300 font-mono block">
                  {unavailableCount}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                  Protected Bays
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 3. SOCIETY WISE DROPDOWN & VEHICLE LIST                       */}
        {/* ============================================================ */}
        <section className="space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Society Selection
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Filter by Residential Society
              </h3>
              <p className="text-xs text-slate-400">
                Select your society to view assigned parking bays and upload morning proof photos.
              </p>
            </div>

            {/* SOCIETY WISE DROPDOWN */}
            <div className="relative min-w-[260px] sm:min-w-[300px]">
              <select
                value={selectedSociety}
                onChange={(e) => setSelectedSociety(e.target.value)}
                className="w-full appearance-none px-4 py-3.5 pr-10 rounded-2xl bg-[#0B132B] border border-emerald-400/40 text-xs font-black text-white focus:outline-hidden focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 shadow-xl cursor-pointer"
              >
                <option value="all">
                  🏢 All Assigned Societies ({routeStops.length} Cars)
                </option>
                {societies.map((soc) => {
                  const count = routeStops.filter(
                    (s) => (s.society_name || 'Green Valley Residency') === soc
                  ).length;
                  return (
                    <option key={soc} value={soc}>
                      📍 {soc} ({count} Cars)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* ============================================================ */}
          {/* 4. CAR ROWS: CAR NUMBER & UPLOAD PROOF BUTTON ON THE RIGHT   */}
          {/* ============================================================ */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>
                {selectedSociety === 'all'
                  ? 'All Scheduled Vehicles'
                  : selectedSociety}{' '}
                ({filteredStops.length})
              </span>
              <span>Morning Route Schedule</span>
            </div>

            {filteredStops.map((stop) => {
              const isCompleted = stop.status === 'completed';
              const isCurrent = stop.status === 'current';
              const isUnavailable = stop.status === 'vehicle_unavailable';

              return (
                <div
                  key={stop.stop_number}
                  className={`p-4 sm:p-5 rounded-3xl border backdrop-blur-xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all ${
                    isCurrent
                      ? 'bg-linear-to-r from-blue-900/40 via-white/5 to-white/5 border-blue-400/50 shadow-blue-500/10'
                      : isCompleted
                      ? 'bg-white/5 border-white/10 hover:border-white/20'
                      : isUnavailable
                      ? 'bg-amber-500/10 border-amber-400/30'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* LEFT SIDE: GREEN TICK, NUMBER PLATE, CAR BRAND (COMPLETED) OR ACTIVE STOP DETAILS */}
                  {isCompleted ? (
                    <div className="flex items-center gap-3.5">
                      {/* Green Tick */}
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.5)]">
                        ✓
                      </div>

                      {/* Number Plate & Brand */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-white font-mono tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                          {stop.registration_number}
                        </span>
                        <span className="text-sm font-bold text-slate-300">
                          {stop.vehicle_name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start sm:items-center gap-3.5">
                      {/* Stop Number Badge */}
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.6)] animate-pulse'
                            : isUnavailable
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/10 text-white border border-white/15'
                        }`}
                      >
                        {`#${stop.stop_number}`}
                      </div>

                      <div className="space-y-1">
                        {/* Top Badges & Time */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base sm:text-lg font-black text-white font-mono tracking-wider bg-white/10 px-2.5 py-0.5 rounded-lg border border-white/15">
                            {stop.registration_number}
                          </span>

                          <span className="text-xs font-bold text-slate-300">
                            {stop.vehicle_name}
                          </span>

                          {isCurrent && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500 text-white animate-pulse">
                              Active Next
                            </span>
                          )}

                          {isUnavailable && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Vehicle Unavailable (Protected)
                            </span>
                          )}
                        </div>

                        {/* Location & Time details */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            {stop.parking_location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono text-slate-300">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {stop.scheduled_time}
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            Owner: <span className="text-white">{stop.owner_name}</span>
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold font-mono">
                            +₹{stop.payout_amount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* RIGHT SIDE: VIEW PROOF OR UPLOAD ACTIONS */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {/* If proof is already completed */}
                    {isCompleted ? (
                      <button
                        type="button"
                        onClick={() => setViewingProofStop(stop)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>View Proof Photo</span>
                      </button>
                    ) : isUnavailable ? (
                      <button
                        type="button"
                        onClick={() => handleOpenUnavailable(stop)}
                        className="px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Bay Empty Proof</span>
                      </button>
                    ) : (
                      /* PENDING OR CURRENT: BUTTON TO UPLOAD WASH PROOF PHOTO */
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUnavailable(stop)}
                          className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-slate-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                          title="If vehicle is not parked at assigned bay"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">No Car?</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenUploadProof(stop)}
                          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Upload Wash Proof</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* 5. EARNINGS WALLET SHORTCUT                                  */}
        {/* ============================================================ */}
        <div className="pt-2">
          <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-r from-emerald-950/40 via-[#0B132B] to-[#0B132B] border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                  Available For Withdrawal
                </span>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  ₹{washerEarnings.available}
                  <span className="text-xs text-slate-400 font-sans font-normal ml-2">
                    (Weekly Total: ₹{washerEarnings.this_week})
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/washer/earnings"
              className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95 text-center shrink-0"
            >
              Withdraw Now →
            </Link>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* MODAL 1: VIEW PROOF PHOTO MODAL                              */}
      {/* ============================================================ */}
      {viewingProofStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0B132B] border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative text-white">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs">
                  ✓
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Verified Wash Proof: {viewingProofStop.registration_number}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {viewingProofStop.vehicle_name} • {viewingProofStop.parking_location}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProofStop(null)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-black">
                <Image
                  src={viewingProofStop.proof_photo || '/images/honda_city_after.jpg'}
                  alt="Verified Wash Proof"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-slate-200 flex items-center justify-between">
                  <span>GPS Bay Verified: {viewingProofStop.parking_location}</span>
                  <span className="text-emerald-400 font-bold">Passed ✓</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Car Owner:</span>
                  <span className="text-white font-bold">{viewingProofStop.owner_name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Bay Location:</span>
                  <span className="text-emerald-300 font-bold">{viewingProofStop.parking_location}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Completed Time:</span>
                  <span className="text-slate-200 font-mono">{viewingProofStop.scheduled_time}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Payout Protected:</span>
                  <span className="text-emerald-400 font-bold font-mono">+₹{viewingProofStop.payout_amount}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingProofStop(null)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: UPLOAD WASH PROOF WORKFLOW MODAL                    */}
      {/* ============================================================ */}
      <WasherWashWorkflowModal
        stop={activeStop}
        isOpen={showWashModal}
        onClose={() => {
          setShowWashModal(false);
          setActiveStop(null);
        }}
      />

      {/* ============================================================ */}
      {/* MODAL 3: CUSTOMER / VEHICLE UNAVAILABLE MODAL                */}
      {/* ============================================================ */}
      <CustomerUnavailableModal
        stop={activeStop}
        isOpen={showUnavailableModal}
        onClose={() => {
          setShowUnavailableModal(false);
          setActiveStop(null);
        }}
      />

      {/* WASHER BOTTOM NAVIGATION */}
      <WasherBottomNav />
    </div>
  );
}
