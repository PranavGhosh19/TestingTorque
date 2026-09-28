'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  X,
  Camera,
  Car,
  MapPin,
  User,
  Download,
  Share2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WashRecord } from '@/lib/types';

interface DayStatus {
  date: number; // 1-31
  dateString: string; // '2026-09-28' or '28 Sep'
  dayOfWeek: string; // 'Mon', 'Tue', etc.
  hasSubscription: boolean; // Light green ring (full month covered)
  hasProofUploaded: boolean; // Bright neon green
  isMissingProof: boolean; // Orange yellow (absent washer or unverified)
  isVehicleUnavailable: boolean; // Orange yellow (bay empty)
  isToday: boolean;
  isFuture: boolean;
  wash?: WashRecord;
}

export default function OwnerProofCalendar() {
  const { washes, todayWash, vehicles, user } = useStore();

  // Selected vehicle for calendar view
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles[0]?.id || 'veh_honda_city'
  );

  // Month navigation: 0 = September 2026, 1 = October 2026
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Modal inspection state
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'after' | 'before'>('after');

  const currentVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  // Month metadata
  const monthData = monthOffset === 0
    ? {
        name: 'September 2026',
        year: 2026,
        monthIndex: 8, // 0-indexed: 8 = Sep
        daysCount: 30,
        startDayOffset: 1, // Tuesday (0=Mon, 1=Tue, 2=Wed, etc.)
        currentDate: 28, // Today is 28 Sep 2026
      }
    : {
        name: 'October 2026',
        year: 2026,
        monthIndex: 9, // Oct
        daysCount: 31,
        startDayOffset: 3, // Thursday
        currentDate: 0, // In the future
      };

  // Build the 30/31 days with statuses
  const days: DayStatus[] = [];
  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let d = 1; d <= monthData.daysCount; d++) {
    const dayOfWeekIndex = (monthData.startDayOffset + d - 1) % 7;
    const dayOfWeek = weekdays[dayOfWeekIndex];
    const dateFormatted = `${d < 10 ? '0' : ''}${d} ${monthOffset === 0 ? 'Sep' : 'Oct'}`;
    const isToday = monthOffset === 0 && d === monthData.currentDate;
    const isFuture = monthOffset > 0 || (monthOffset === 0 && d > monthData.currentDate);

    // Find if there is a wash record for this date
    let matchingWash: WashRecord | undefined;

    if (monthOffset === 0) {
      if (d === 28) {
        matchingWash = todayWash;
      } else {
        matchingWash = washes.find(
          (w) =>
            w.scheduled_date.startsWith(`${d} Sep`) ||
            w.scheduled_date.startsWith(`${d < 10 ? '0' : ''}${d} Sep`) ||
            w.id.includes(`sep_${d}`)
        );
      }
    }

    // Determine status according to user specification:
    // 1. Monthly sub is active -> highlights light green / invisible light circle green on each date for full month
    // 2. When proof is uploaded -> turns BRIGHT NEON GREEN
    // 3. If proof doesn't upload (missed, absent washer, or vehicle unavailable) -> turns ORANGE YELLOW

    const hasSubscription = true; // Owner pays monthly sub
    let hasProofUploaded = false;
    let isMissingProof = false;
    let isVehicleUnavailable = false;

    if (matchingWash) {
      if (matchingWash.status === 'completed' && matchingWash.after_photo) {
        hasProofUploaded = true;
      } else if (matchingWash.status === 'vehicle_unavailable') {
        isVehicleUnavailable = true;
      } else if (matchingWash.status === 'missed' || matchingWash.status === 'attempted') {
        isMissingProof = true;
      }
    } else if (!isFuture && d !== 28) {
      // Past day without a completed wash:
      if (d === 14) {
        // Specific user scenario: absent washer, proof not uploaded, auto-credited
        isMissingProof = true;
        matchingWash = {
          id: 'wash_sep_14_missed',
          vehicle_id: currentVehicle?.id || 'veh_honda_city',
          vehicle_name: `${currentVehicle?.make} ${currentVehicle?.model}`,
          registration_number: currentVehicle?.registration_number || 'DL 01 AB 4291',
          parking_location: currentVehicle?.parking_location || 'Bay D-14',
          washer_id: 'wsh_amit_1',
          washer_name: 'Amit Kumar',
          washer_avatar: '/images/washer_amit.jpg',
          washer_rating: 4.9,
          status: 'missed',
          scheduled_date: '14 Sep',
          scheduled_time: '7:30 AM',
          location_verified: false,
          notes: 'Washer absent on morning route. Proof not uploaded. Missed-wash protection activated: ₹25 auto-credit added to billing cycle.',
          service_type: 'home',
          city: 'Delhi',
          is_sunday_priority: false,
          is_backup_covered: false,
        };
      } else {
        // Normal verified day with proof uploaded
        hasProofUploaded = true;
        matchingWash = {
          id: `wash_sep_${d}`,
          vehicle_id: currentVehicle?.id || 'veh_honda_city',
          vehicle_name: `${currentVehicle?.make} ${currentVehicle?.model}`,
          registration_number: currentVehicle?.registration_number || 'DL 01 AB 4291',
          parking_location: currentVehicle?.parking_location || 'Bay D-14',
          washer_id: 'wsh_amit_1',
          washer_name: 'Amit Kumar',
          washer_avatar: '/images/washer_amit.jpg',
          washer_rating: 4.9,
          status: 'completed',
          scheduled_date: dateFormatted,
          scheduled_time: '7:30 AM',
          completed_at: '7:41 AM',
          location_verified: true,
          after_photo: '/images/honda_city_after.jpg',
          before_photo: '/images/honda_city_before.jpg',
          service_type: 'home',
          city: 'Delhi',
          is_sunday_priority: false,
          is_backup_covered: false,
          notes: 'Daily verified society wash completed. Microfiber wiped, spotless windshield.',
        };
      }
    }

    days.push({
      date: d,
      dateString: dateFormatted,
      dayOfWeek,
      hasSubscription,
      hasProofUploaded,
      isMissingProof,
      isVehicleUnavailable,
      isToday,
      isFuture,
      wash: matchingWash,
    });
  }

  // Summary counts for the month
  const verifiedCount = days.filter((d) => d.hasProofUploaded).length;
  const missingOrAlertCount = days.filter(
    (d) => d.isMissingProof || d.isVehicleUnavailable
  ).length;
  const scheduledCount = days.filter((d) => d.isFuture).length;

  return (
    <div className="w-full rounded-3xl bg-[#0B132B]/90 border border-white/15 backdrop-blur-2xl shadow-2xl p-6 sm:p-8 space-y-7 relative overflow-hidden luxury-sheen">
      {/* BACKGROUND ACCENT GLOWS */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP CALENDAR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Monthly Subscription Audit
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Wash Proof Calendar
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300">
            Click any date to inspect timestamped camera proof, washer logs, or protected credits.
          </p>
        </div>

        {/* Car Switcher + Month Navigator */}
        <div className="flex items-center gap-3 flex-wrap">
          {vehicles.length > 1 && (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-bold text-white focus:outline-hidden focus:border-emerald-400"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#0B132B] text-white">
                  {v.make} {v.model} ({v.registration_number})
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1">
            <button
              onClick={() => setMonthOffset(0)}
              disabled={monthOffset === 0}
              className={`p-2 rounded-xl transition-all ${
                monthOffset === 0
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-extrabold text-white px-3 font-mono">
              {monthData.name}
            </span>

            <button
              onClick={() => setMonthOffset(1)}
              disabled={monthOffset === 1}
              className={`p-2 rounded-xl transition-all ${
                monthOffset === 1
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUICK STATUS METRIC PILLS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Neon Green Verified */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-[0_0_12px_rgba(52,211,153,0.5)]">
            ✓
          </div>
          <div>
            <div className="text-lg font-black text-emerald-300 font-mono">
              {verifiedCount} Days
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Proof Uploaded
            </div>
          </div>
        </div>

        {/* Orange Yellow Alert */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-[0_0_12px_rgba(251,191,36,0.5)]">
            !
          </div>
          <div>
            <div className="text-lg font-black text-amber-300 font-mono">
              {missingOrAlertCount} Days
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Proof Missing / Saved
            </div>
          </div>
        </div>

        {/* Light Green Upcoming Subscription */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl border-2 border-emerald-400/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="text-lg font-black text-white font-mono">
              {scheduledCount} Days
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Paid Sub Active
            </div>
          </div>
        </div>

        {/* Overall Guarantee */}
        <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/30 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-blue-300 font-mono">
              100%
            </div>
            <div className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">
              Zero-Doubt Protocol
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR VISUAL COLOR LEGEND (Strictly Matching User Rules) */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Color Guide:
        </span>

        <div className="flex items-center gap-5 flex-wrap">
          {/* Bright Neon Green */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.7)]">
              ✓
            </span>
            <span className="text-slate-200 font-bold">
              Bright Neon Green{' '}
              <span className="text-emerald-400 font-medium">(Proof Uploaded)</span>
            </span>
          </div>

          {/* Orange Yellow */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.7)]">
              !
            </span>
            <span className="text-slate-200 font-bold">
              Orange Yellow{' '}
              <span className="text-amber-400 font-medium">
                (Proof Not Uploaded / Absent / Unavailable)
              </span>
            </span>
          </div>

          {/* Light Green / Circle */}
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-lg border-2 border-emerald-400/50 bg-emerald-500/10 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-slate-200 font-bold">
              Light Green Circle{' '}
              <span className="text-emerald-400/90 font-medium">
                (Full Month Paid Subscription)
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div>
        {/* Weekday Labels Mon-Sun */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 text-center">
          {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
            <div
              key={day}
              className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Empty padding slots before startDayOffset */}
          {Array.from({ length: monthData.startDayOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="h-16 sm:h-24 rounded-2xl bg-white/[0.02] border border-white/5 opacity-30"
            />
          ))}

          {/* Actual Month Days */}
          {days.map((day) => {
            // Determine visual styling classes
            let cardClasses = '';
            let badgeContent = null;
            let statusLabel = '';

            if (day.hasProofUploaded) {
              // 1. PROOF UPLOADED: BRIGHT NEON GREEN
              cardClasses =
                'bg-emerald-400 text-slate-950 font-black shadow-[0_0_20px_rgba(52,211,153,0.65)] ring-2 ring-emerald-300 border-emerald-200 hover:scale-[1.04] transition-all cursor-pointer';
              badgeContent = (
                <div className="w-5 h-5 rounded-full bg-slate-950 text-emerald-400 flex items-center justify-center text-[10px] font-black">
                  ✓
                </div>
              );
              statusLabel = 'Proof Verified';
            } else if (day.isMissingProof || day.isVehicleUnavailable) {
              // 2. PROOF NOT UPLOADED / UNAVAILABLE: ORANGE YELLOW
              cardClasses =
                'bg-amber-400 text-slate-950 font-black shadow-[0_0_20px_rgba(251,191,36,0.65)] ring-2 ring-amber-300 border-amber-200 hover:scale-[1.04] transition-all cursor-pointer';
              badgeContent = (
                <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center text-[10px] font-black">
                  !
                </div>
              );
              statusLabel = day.isVehicleUnavailable
                ? 'Bay Empty'
                : 'Auto-Credited';
            } else {
              // 3. UPCOMING / ACTIVE MONTHLY SUB: LIGHT GREEN / SUBTLE CIRCLE GREEN
              cardClasses =
                'bg-emerald-500/5 text-emerald-300 border-2 border-emerald-500/30 hover:border-emerald-400/60 hover:bg-emerald-500/10 transition-all cursor-pointer group';
              badgeContent = (
                <div className="w-5 h-5 rounded-full border border-emerald-400/40 bg-emerald-500/10 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              );
              statusLabel = 'Covered';
            }

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setActivePhotoTab('after');
                }}
                className={`h-18 sm:h-24 p-2 sm:p-2.5 rounded-2xl flex flex-col justify-between text-left relative overflow-hidden active:scale-95 ${cardClasses}`}
              >
                {/* Date header + Status Badge */}
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-sm sm:text-base font-black ${
                      day.hasProofUploaded || day.isMissingProof || day.isVehicleUnavailable
                        ? 'text-slate-950'
                        : 'text-white'
                    }`}
                  >
                    {day.date}
                  </span>

                  {badgeContent}
                </div>

                {/* Sub-label & Today tag */}
                <div className="w-full">
                  {day.isToday && (
                    <span className="inline-block text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-slate-950 text-white mb-0.5">
                      Today
                    </span>
                  )}
                  <div
                    className={`text-[9px] sm:text-[10px] font-bold truncate ${
                      day.hasProofUploaded || day.isMissingProof || day.isVehicleUnavailable
                        ? 'text-slate-900 font-extrabold'
                        : 'text-emerald-400/90'
                    }`}
                  >
                    {statusLabel}
                  </div>
                </div>

                {/* Bottom subtle camera icon when proof exists */}
                {day.hasProofUploaded && (
                  <div className="absolute -bottom-1 -right-1 text-slate-950/20">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* FOOTER NOTE: ASSIGNMENT & PROTECTION GUARANTEE */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            Every verified date is cryptographically signed with GPS bay stamp & time verification.
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Assigned Washer: <span className="text-white font-bold">Amit Kumar</span> • Bay D-14
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: PROOF INSPECTION ON DATE CLICK                        */}
      {/* ============================================================ */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#0B132B] border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                    selectedDay.hasProofUploaded
                      ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                      : selectedDay.isMissingProof || selectedDay.isVehicleUnavailable
                      ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                      : 'border-2 border-emerald-400/40 bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {selectedDay.date}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      {selectedDay.dateString} 2026
                    </h3>
                    {selectedDay.hasProofUploaded && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                        Verified Proof ✓
                      </span>
                    )}
                    {(selectedDay.isMissingProof || selectedDay.isVehicleUnavailable) && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        {selectedDay.isVehicleUnavailable
                          ? 'Vehicle Unavailable'
                          : 'Proof Missing • Credited'}
                      </span>
                    )}
                    {selectedDay.isFuture && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Scheduled Care
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    {currentVehicle?.make} {currentVehicle?.model} • {currentVehicle?.registration_number}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* CASE 1: PROOF UPLOADED (BRIGHT NEON GREEN) */}
              {selectedDay.hasProofUploaded && (
                <div className="space-y-6">
                  {/* Photo Switcher / Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> High-Resolution Proof
                      </span>

                      {/* Before / After Switcher */}
                      <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                        <button
                          onClick={() => setActivePhotoTab('after')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            activePhotoTab === 'after'
                              ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          After Wash
                        </button>
                        <button
                          onClick={() => setActivePhotoTab('before')}
                          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            activePhotoTab === 'before'
                              ? 'bg-emerald-400 text-slate-950 font-black shadow-xs'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Before Wash
                        </button>
                      </div>
                    </div>

                    {/* Image Container with Watermark */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-2xl">
                      <Image
                        src={
                          activePhotoTab === 'after'
                            ? selectedDay.wash?.after_photo || '/images/honda_city_after.jpg'
                            : selectedDay.wash?.before_photo || '/images/honda_city_before.jpg'
                        }
                        alt="Wash Proof"
                        fill
                        className="object-cover"
                        priority
                      />

                      {/* Official Proof Timestamp Watermark */}
                      <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-slate-200 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-white font-bold">
                            {selectedDay.dateString} 2026 • 07:42 AM
                          </span>
                          <span className="text-slate-400">|</span>
                          <span className="text-emerald-300">Bay D-14 Verified (GPS)</span>
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          Cryptographic SHA-256 Logged
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Washer & Quality Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Technician Info
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl relative overflow-hidden border border-white/15">
                          <Image
                            src="/images/washer_amit.jpg"
                            alt="Amit Kumar"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">Amit Kumar</div>
                          <div className="text-xs text-emerald-400 font-medium">
                            ★ 4.9 • Society Verified Specialist
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        Care Checklist
                      </span>
                      <ul className="text-xs space-y-1 text-slate-300">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dual-bucket microfiber scratchless wipe</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>pH-neutral cleanser & windshield clarity</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Satin matte tire dressing applied</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 2: ORANGE YELLOW (PROOF NOT UPLOADED / MISSING / UNAVAILABLE) */}
              {(selectedDay.isMissingProof || selectedDay.isVehicleUnavailable) && (
                <div className="space-y-6">
                  {/* Alert Banner */}
                  <div className="p-5 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm text-amber-300">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>
                        {selectedDay.isVehicleUnavailable
                          ? 'Customer / Vehicle Unavailable Protocol'
                          : 'Proof Not Uploaded • Absent Washer Protected'}
                      </span>
                    </div>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {selectedDay.isVehicleUnavailable
                        ? 'The washer arrived at assigned Bay D-14 at 07:31 AM, but your vehicle was not parked there. Live camera proof of the empty bay was captured.'
                        : 'The service partner did not upload proof during the morning service window. Under our Missed-Wash Protection, a ₹25 credit was automatically refunded to your next billing cycle.'}
                    </p>
                  </div>

                  {/* Empty Bay Photo if Vehicle was Unavailable */}
                  {selectedDay.isVehicleUnavailable && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                        Live Parking Bay Evidence (Camera Verified)
                      </span>
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-amber-400/30 bg-black">
                        <Image
                          src="/images/empty_parking_bay.jpg"
                          alt="Empty Bay Evidence"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-3 left-3 p-2.5 rounded-xl bg-black/80 backdrop-blur-md text-xs font-mono text-amber-300 border border-amber-400/30">
                          Bay D-14 Empty at 07:34 AM • Washer: Present ✓
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Protection Breakdown */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Audit Trail Guarantee
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-slate-400">Washer Presence</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">
                          {selectedDay.isVehicleUnavailable ? 'Present ✓' : 'Absent'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-slate-400">Owner Charged</div>
                        <div className="text-xs font-bold text-white mt-0.5">
                          {selectedDay.isVehicleUnavailable ? 'Standard Bay' : 'Auto-Credited (₹25)'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                        <div className="text-[10px] text-slate-400">Zero Dispute</div>
                        <div className="text-xs font-bold text-blue-400 mt-0.5">
                          Protected ✓
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 3: LIGHT GREEN CIRCLE (UPCOMING SCHEDULED COVERAGE) */}
              {selectedDay.isFuture && (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 space-y-2">
                    <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
                      <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>Scheduled Care • Full Month Active Subscription</span>
                    </div>
                    <p className="text-xs text-emerald-100/90 leading-relaxed">
                      This date is reserved and covered under your ₹599 monthly subscription. Technician Amit Kumar will reach Bay D-14 during the 07:30 AM window.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Planned Schedule
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Time Window:</span>
                        <span className="text-white font-bold">07:30 AM – 08:00 AM</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Location:</span>
                        <span className="text-white font-bold">Basement 1 • Bay D-14</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 border-t border-white/10 bg-white/5 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 font-mono">
                Torque Care Proof ID #{selectedDay.wash?.id || `TC-${selectedDay.date}`}
              </span>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#080D1A] font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
