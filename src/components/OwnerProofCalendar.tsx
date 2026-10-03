'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  Info,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WashRecord } from '@/lib/types';

interface DayStatus {
  date: number; // Day of month: 1-31
  fullDate: Date;
  dateString: string; // e.g. '01 Oct'
  dayOfWeek: string; // 'Mon', 'Tue', etc.
  isBeforeSubscription: boolean; // Before owner subscribed
  hasSubscription: boolean; // Covered by subscription
  hasProofUploaded: boolean; // Real wash completed with photo
  isMissingProof: boolean; // Wash flagged/missed
  isVehicleUnavailable: boolean; // Car was not in bay
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isSunday: boolean; // Rest day for 6-day Mon-Sat plan
  wash?: WashRecord;
}

interface OwnerProofCalendarProps {
  assignedWasherName?: string;
  assignedWasherAvatar?: string;
  parkingLocation?: string;
  washes?: WashRecord[];
  todayWash?: WashRecord | null;
  selectedVehicleId?: string;
}

export default function OwnerProofCalendar({
  assignedWasherName: propWasherName,
  assignedWasherAvatar: propWasherAvatar,
  parkingLocation: propParkingLocation,
  washes: propWashes,
  todayWash: propTodayWash,
  selectedVehicleId: propSelectedVehicleId,
}: OwnerProofCalendarProps = {}) {
  const { washes: storeWashes, todayWash: storeTodayWash, vehicles, user } = useStore();

  const allWashes = useMemo(() => {
    if (propWashes && propWashes.length > 0) return propWashes;
    return storeWashes;
  }, [propWashes, storeWashes]);

  const activeTodayWash = propTodayWash !== undefined ? propTodayWash : storeTodayWash;

  // Selected vehicle for calendar view
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    propSelectedVehicleId || vehicles[0]?.id || ''
  );

  useEffect(() => {
    if (propSelectedVehicleId) {
      setSelectedVehicleId(propSelectedVehicleId);
    } else if (vehicles[0]?.id && !selectedVehicleId) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [propSelectedVehicleId, vehicles]);

  const currentVehicle = useMemo(() => {
    if (selectedVehicleId) {
      const found = vehicles.find((v) => v.id === selectedVehicleId);
      if (found) return found;
    }
    return vehicles[0] || null;
  }, [vehicles, selectedVehicleId]);

  // Determine owner's subscription start date
  const subscriptionStartDate = useMemo(() => {
    // 1. Check user registration / creation date
    if (user?.created_at) {
      const d = new Date(user.created_at);
      if (!isNaN(d.getTime())) return d;
    }
    // 2. Check current vehicle subscription start date
    if ((currentVehicle as any)?.subscription?.startDate) {
      const d = new Date((currentVehicle as any).subscription.startDate);
      if (!isNaN(d.getTime())) return d;
    }
    // 3. Check localStorage fallback
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('torque_user');
        if (storedUser) {
          const u = JSON.parse(storedUser);
          if (u.created_at) {
            const d = new Date(u.created_at);
            if (!isNaN(d.getTime())) return d;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    // Default to real current date (e.g. today)
    return new Date();
  }, [user, currentVehicle]);

  // Current real date (start of day)
  const realNow = useMemo(() => new Date(), []);

  // Month navigation offset: 0 = current active month, -1 = previous, +1 = next
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Modal inspection state
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);
  const [activePhotoTab, setActivePhotoTab] = useState<'after' | 'before'>('after');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const assignedWasherName =
    propWasherName ||
    (mounted
      ? currentVehicle?.assigned_washer_name ||
        user?.assigned_washer_name ||
        (typeof window !== 'undefined' ? localStorage.getItem('torque_assigned_washer_name') : null)
      : null) ||
    'Assigned Route Partner';

  const assignedWasherAvatar =
    propWasherAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(assignedWasherName)}&background=0B132B&color=10B981&bold=true`;

  const parkingLocation =
    propParkingLocation ||
    currentVehicle?.parking_location ||
    'Assigned Bay';

  // Compute month view metadata dynamically from real date + offset
  const monthData = useMemo(() => {
    // Start from current month of realNow
    const targetDate = new Date(realNow.getFullYear(), realNow.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const name = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const daysCount = new Date(year, month + 1, 0).getDate();
    // Monday = 0, Tuesday = 1, ..., Sunday = 6
    const startDayOffset = (targetDate.getDay() + 6) % 7;

    return {
      year,
      month,
      name,
      daysCount,
      startDayOffset,
    };
  }, [realNow, monthOffset]);

  // Helper to compare dates at calendar-day granularity
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  // Normalized midnight dates for comparisons
  const subStartMidnight = useMemo(() => {
    return new Date(
      subscriptionStartDate.getFullYear(),
      subscriptionStartDate.getMonth(),
      subscriptionStartDate.getDate()
    );
  }, [subscriptionStartDate]);

  const todayMidnight = useMemo(() => {
    return new Date(realNow.getFullYear(), realNow.getMonth(), realNow.getDate());
  }, [realNow]);

  // Build the days list for the active month view
  const days: DayStatus[] = useMemo(() => {
    const list: DayStatus[] = [];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let d = 1; d <= monthData.daysCount; d++) {
      const fullDate = new Date(monthData.year, monthData.month, d);
      const dayOfWeekIndex = (monthData.startDayOffset + d - 1) % 7;
      const dayOfWeek = weekdays[dayOfWeekIndex];
      const isSunday = dayOfWeek === 'Sun';
      const monthShort = fullDate.toLocaleDateString('en-US', { month: 'short' });
      const dateString = `${d < 10 ? '0' : ''}${d} ${monthShort}`;

      const isToday = isSameDay(fullDate, todayMidnight);
      const isPast = fullDate < todayMidnight;
      const isFuture = fullDate > todayMidnight;

      // Match REAL wash record from store/Firestore for this vehicle
      let matchingWash: WashRecord | undefined;

      // 1. If today and activeTodayWash is present
      if (isToday && activeTodayWash) {
        if (!activeTodayWash.vehicle_id || !currentVehicle || activeTodayWash.vehicle_id === currentVehicle.id) {
          matchingWash = activeTodayWash;
        }
      }

      // 2. Search in allWashes
      if (!matchingWash && allWashes && allWashes.length > 0) {
        const dPadded = d < 10 ? `0${d}` : `${d}`;
        const isoDate = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${dPadded}`;

        matchingWash = allWashes.find((w) => {
          // Check vehicle match if vehicle_id exists
          if (currentVehicle?.id && w.vehicle_id && w.vehicle_id !== currentVehicle.id) {
            return false;
          }

          // 1. If wash has captured_at timestamp, strictly match calendar day!
          if ((w as any).captured_at) {
            const capDate = new Date((w as any).captured_at);
            if (!isNaN(capDate.getTime())) {
              return isSameDay(capDate, fullDate);
            }
          }

          // 2. If wash has created_at timestamp, strictly match calendar day!
          if ((w as any).created_at) {
            const crDate = new Date((w as any).created_at);
            if (!isNaN(crDate.getTime())) {
              return isSameDay(crDate, fullDate);
            }
          }

          // 3. Check scheduled_date with exact ISO date (e.g. 2026-10-02)
          const sDate = (w.scheduled_date || '').trim();
          if (sDate.startsWith(isoDate)) return true;

          // 4. Check date in wash ID (e.g. wash_veh_..._2026-10-02)
          if (w.id && w.id.includes(isoDate)) return true;

          // 5. Check completed_at timestamp
          if (w.completed_at && w.completed_at.includes('-')) {
            const compDate = new Date(w.completed_at);
            if (!isNaN(compDate.getTime())) {
              return isSameDay(compDate, fullDate);
            }
          }

          // 6. Check formatted date strings like "02 Oct" or "2 Oct"
          if (sDate.includes(`${dPadded} ${monthShort.toLowerCase()}`) || sDate.includes(`${d} ${monthShort.toLowerCase()}`)) {
            return true;
          }

          // 7. If scheduled_date is explicitly 'today' without any past timestamp, only match if isToday!
          if (isToday && (sDate.toLowerCase() === 'today' || sDate.toLowerCase() === 'current')) {
            return true;
          }

          return false;
        });
      }

      let hasProofUploaded = false;
      let isMissingProof = false;
      let isVehicleUnavailable = false;

      if (matchingWash) {
        if (matchingWash.status === 'completed' && (matchingWash.after_photo || (matchingWash as any).proof_photo)) {
          hasProofUploaded = true;
        } else if (matchingWash.status === 'vehicle_unavailable') {
          isVehicleUnavailable = true;
        } else if (matchingWash.status === 'missed' || matchingWash.status === 'attempted') {
          isMissingProof = true;
        }
      }

      // If a real verified wash exists, it is NEVER before subscription!
      const isBeforeSubscription = matchingWash ? false : fullDate < subStartMidnight;
      const hasSubscription = !isBeforeSubscription;

      list.push({
        date: d,
        fullDate,
        dateString,
        dayOfWeek,
        isBeforeSubscription,
        hasSubscription,
        hasProofUploaded,
        isMissingProof,
        isVehicleUnavailable,
        isToday,
        isPast,
        isFuture,
        isSunday,
        wash: matchingWash,
      });
    }

    return list;
  }, [
    monthData,
    todayMidnight,
    subStartMidnight,
    activeTodayWash,
    allWashes,
    currentVehicle,
  ]);

  // Summary counts for current month view
  const verifiedCount = days.filter((d) => d.hasProofUploaded).length;
  const missingOrAlertCount = days.filter(
    (d) => d.isMissingProof || d.isVehicleUnavailable
  ).length;
  const scheduledCount = days.filter(
    (d) => d.hasSubscription && (d.isFuture || d.isToday) && !d.isSunday
  ).length;

  // Formatted subscription start label
  const formattedSubStart = useMemo(() => {
    return subscriptionStartDate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [subscriptionStartDate]);

  // Days active into subscription
  const daysActive = useMemo(() => {
    const diffMs = todayMidnight.getTime() - subStartMidnight.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, Math.min(30, days));
  }, [todayMidnight, subStartMidnight]);

  return (
    <div className="w-full rounded-[20px] bg-[#11161D] border border-white/[0.08] shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* BACKGROUND ACCENT GLOWS */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2DD4A0]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* TOP CALENDAR HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#2DD4A0]">
              SUBSCRIPTION AUDIT LOG
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-[#161C25] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
              Subscribed: {formattedSubStart} (Day {daysActive} of 30)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Wash Proof Calendar
          </h2>
        </div>

        {/* Car Switcher + Month Navigator */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {vehicles.length > 1 && (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] text-xs font-semibold text-white focus:outline-hidden focus:border-[#2DD4A0]"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#11161D] text-white">
                  {v.make} {v.model} ({v.registration_number})
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center gap-1 bg-[#161C25] border border-white/[0.08] rounded-full p-1">
            <button
              onClick={() => setMonthOffset((prev) => prev - 1)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white px-2.5 font-mono">
              {monthData.name}
            </span>

            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {monthOffset !== 0 && (
            <button
              onClick={() => setMonthOffset(0)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white border border-white/[0.08] transition-all cursor-pointer"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* COMPACT STATS RIBBON */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2DD4A0]/10 border border-[#2DD4A0]/30 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0]" />
          <span className="text-white/70 text-[11px]">Verified Proofs:</span>
          <span className="text-[#2DD4A0] font-bold font-mono">{verifiedCount}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-400/25 text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-white/70 text-[11px]">Flagged / Away:</span>
          <span className="text-amber-300 font-bold font-mono">{missingOrAlertCount}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0]/50" />
          <span className="text-white/70 text-[11px]">Scheduled Route Washes:</span>
          <span className="text-white font-bold font-mono">{scheduledCount}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.08] text-xs">
          <span className="text-[11px] text-white/50 font-mono">Plan: Mon–Sat Care (Sundays Off)</span>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="space-y-2">
        {/* Weekday Labels Mon-Sun */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div
              key={day}
              className={`text-[10px] font-mono font-bold uppercase tracking-wider py-1 ${
                day === 'Sun' ? 'text-white/30' : 'text-white/50'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {/* Empty padding slots before startDayOffset */}
          {Array.from({ length: monthData.startDayOffset }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="aspect-square w-full rounded-xl bg-transparent"
            />
          ))}

          {/* Actual Month Days */}
          {days.map((day) => {
            let cellClasses =
              'bg-[#161C25]/40 text-white/80 border border-white/[0.06] hover:border-white/20 hover:bg-[#161C25]';
            let dotColor = 'bg-[#2DD4A0]/40';
            let titleText = `Day ${day.date}: Scheduled care`;

            if (day.isBeforeSubscription) {
              cellClasses =
                'bg-transparent text-white/30 border border-white/[0.03] opacity-40';
              dotColor = 'bg-transparent';
              titleText = `Day ${day.date}: Prior to subscription (${formattedSubStart})`;
            } else if (day.hasProofUploaded) {
              cellClasses =
                'bg-[#2DD4A0]/10 text-white border border-[#2DD4A0]/30 hover:bg-[#2DD4A0]/20';
              dotColor = 'bg-[#2DD4A0] shadow-[0_0_8px_rgba(45,212,160,0.8)]';
              titleText = `Day ${day.date}: Verified proof uploaded ✓`;
            } else if (day.isMissingProof || day.isVehicleUnavailable) {
              cellClasses =
                'bg-amber-500/10 text-amber-200 border border-amber-400/30 hover:bg-amber-500/20';
              dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
              titleText = `Day ${day.date}: ${
                day.isVehicleUnavailable ? 'Vehicle unavailable' : 'Proof flagged'
              }`;
            } else if (day.isSunday) {
              cellClasses =
                'bg-white/[0.01] text-white/30 border border-white/[0.04]';
              dotColor = 'bg-white/20';
              titleText = `Day ${day.date}: Sunday rest day (Mon-Sat care plan)`;
            } else if (day.isFuture) {
              cellClasses =
                'bg-[#161C25]/40 text-white/80 border border-white/[0.06] hover:border-[#2DD4A0]/30';
              dotColor = 'bg-[#2DD4A0]/30';
              titleText = `Day ${day.date}: Covered care (07:30 AM window)`;
            }

            // Highlighting TODAY
            if (day.isToday) {
              cellClasses =
                'bg-[#2DD4A0] text-[#0A0D12] font-black shadow-[0_0_15px_rgba(45,212,160,0.4)] border-[#2DD4A0] scale-[1.02]';
              dotColor = 'bg-[#0A0D12]';
              titleText = `Day ${day.date}: Today • ${
                day.hasProofUploaded ? 'Wash completed ✓' : 'Scheduled morning route'
              }`;
            }

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                  setActivePhotoTab('after');
                }}
                className={`aspect-square w-full rounded-xl sm:rounded-[14px] p-1 flex flex-col items-center justify-center relative transition-all active:scale-95 cursor-pointer overflow-hidden ${cellClasses}`}
                title={titleText}
              >
                {day.hasProofUploaded && day.wash?.after_photo ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-xl sm:rounded-[14px] group">
                    <img
                      src={day.wash.after_photo}
                      alt={`Wash Proof ${day.date}`}
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
                    <span className="absolute top-1 left-1.5 text-xs sm:text-sm font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {day.date}
                    </span>
                    <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-[#2DD4A0] text-[#0A0D12] flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-3 h-3 text-[#0A0D12]" />
                    </span>
                  </div>
                ) : (
                  <>
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        day.isToday ? 'text-[#0A0D12] font-black' : ''
                      }`}
                    >
                      {day.date}
                    </span>

                    {/* Minimal indicator dot */}
                    {dotColor !== 'bg-transparent' && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor}`} />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* COLOR GUIDE LEGEND */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap text-xs pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2DD4A0] shadow-[0_0_6px_rgba(45,212,160,0.8)]" />
          <span className="text-[11px] font-medium text-white/70">
            Proof Uploaded ({verifiedCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-[11px] font-medium text-white/70">
            Flagged / Away ({missingOrAlertCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#2DD4A0]/40 border border-[#2DD4A0]/60" />
          <span className="text-[11px] font-medium text-white/70">
            Upcoming Covered ({scheduledCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/20" />
          <span className="text-[11px] font-medium text-white/40">
            Sunday Rest (Mon–Sat)
          </span>
        </div>
      </div>

      {/* FOOTER NOTE: ASSIGNMENT & PROTECTION GUARANTEE */}
      <div className="pt-3 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2DD4A0]" />
          <span>
            Every completed wash is verified with live bay stamp & time verification.
          </span>
        </div>
        <div className="text-[11px] text-white/50 font-mono">
          Assigned Specialist: <span className="text-white font-bold">{assignedWasherName}</span> •{' '}
          {parkingLocation}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: PROOF INSPECTION ON DATE CLICK                        */}
      {/* ============================================================ */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#11161D] border border-white/[0.08] rounded-[20px] shadow-2xl overflow-hidden relative text-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#161C25]/50">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                    selectedDay.isToday
                      ? 'bg-[#2DD4A0] text-[#0A0D12] font-black'
                      : selectedDay.hasProofUploaded
                      ? 'bg-[#2DD4A0] text-[#0A0D12]'
                      : selectedDay.isMissingProof || selectedDay.isVehicleUnavailable
                      ? 'bg-amber-400 text-[#0A0D12]'
                      : selectedDay.isBeforeSubscription
                      ? 'border border-white/10 bg-[#161C25] text-white/40'
                      : 'border border-[#2DD4A0]/40 bg-[#2DD4A0]/10 text-[#2DD4A0]'
                  }`}
                >
                  {selectedDay.date}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {selectedDay.dateString} {selectedDay.fullDate.getFullYear()}
                    </h3>
                    {selectedDay.isToday && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2DD4A0] text-[#0A0D12] font-bold">
                        Today
                      </span>
                    )}
                    {selectedDay.hasProofUploaded && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2DD4A0] text-[#0A0D12] font-bold">
                        Verified Proof ✓
                      </span>
                    )}
                    {(selectedDay.isMissingProof || selectedDay.isVehicleUnavailable) && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400 text-[#0A0D12] font-bold">
                        {selectedDay.isVehicleUnavailable
                          ? 'Vehicle Unavailable'
                          : 'Proof Missing • Credited'}
                      </span>
                    )}
                    {selectedDay.isBeforeSubscription && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10">
                        Prior to Subscription
                      </span>
                    )}
                    {!selectedDay.isBeforeSubscription && !selectedDay.hasProofUploaded && !selectedDay.isMissingProof && !selectedDay.isVehicleUnavailable && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] border border-[#2DD4A0]/30 font-bold">
                        {selectedDay.isSunday ? 'Sunday Rest' : 'Covered Care'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/50 font-mono mt-0.5">
                    {currentVehicle?.make} {currentVehicle?.model} •{' '}
                    {currentVehicle?.registration_number || 'Registered Vehicle'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDay(null)}
                className="p-2 rounded-full bg-[#161C25] hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Scroll */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* CASE 1: PROOF UPLOADED */}
              {selectedDay.hasProofUploaded && selectedDay.wash && (
                <div className="space-y-6">
                  {/* Photo Switcher / Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2DD4A0] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> High-Resolution Proof
                      </span>

                      {selectedDay.wash.before_photo && (
                        <div className="flex items-center gap-1 bg-[#161C25] p-1 rounded-full border border-white/[0.08] text-xs">
                          <button
                            onClick={() => setActivePhotoTab('after')}
                            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                              activePhotoTab === 'after'
                                ? 'bg-white text-[#0A0D12] font-bold shadow-xs'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            After Wash
                          </button>
                          <button
                            onClick={() => setActivePhotoTab('before')}
                            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                              activePhotoTab === 'before'
                                ? 'bg-white text-[#0A0D12] font-bold shadow-xs'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            Before Wash
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image Container with Watermark */}
                    {selectedDay.wash.after_photo && (
                      <div className="relative aspect-video w-full rounded-[16px] overflow-hidden border border-white/[0.08] bg-black shadow-2xl">
                        <img
                          src={
                            activePhotoTab === 'after'
                              ? selectedDay.wash.after_photo
                              : selectedDay.wash.before_photo || selectedDay.wash.after_photo
                          }
                          alt="Wash Proof"
                          className="w-full h-full object-cover"
                        />

                        {/* Official Proof Timestamp Watermark */}
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#0A0D12]/80 backdrop-blur-md border border-white/[0.08] text-[11px] font-mono text-white/90 flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] animate-pulse" />
                            <span className="text-white font-bold">
                              {selectedDay.dateString} •{' '}
                              {selectedDay.wash.completed_at || 'Morning Completed'}
                            </span>
                            <span className="text-white/40">|</span>
                            <span className="text-[#2DD4A0]">
                              {selectedDay.wash.parking_location || parkingLocation}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#2DD4A0] uppercase tracking-wider font-bold">
                            Verified ✓
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specialist & Quality Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-2">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                        Technician Info
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl relative overflow-hidden border border-white/10 bg-neutral-900">
                          <img
                            src={assignedWasherAvatar}
                            alt={assignedWasherName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {selectedDay.wash.washer_name &&
                            selectedDay.wash.washer_name !== 'Unregistered Owner' &&
                            selectedDay.wash.washer_name !== 'Washer Partner'
                              ? selectedDay.wash.washer_name
                              : assignedWasherName}
                          </div>
                          <div className="text-xs text-[#2DD4A0] font-medium">
                            ★ 4.9 • Society Verified Specialist
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-1.5">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                        Care Protocol Checklist
                      </span>
                      <ul className="text-xs space-y-1.5 text-white/80">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4A0]" />
                          <span>Dual-bucket microfiber scratchless wipe</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4A0]" />
                          <span>pH-neutral cleanser & windshield clarity</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4A0]" />
                          <span>Verified photo proof uploaded</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 2: BEFORE SUBSCRIPTION */}
              {selectedDay.isBeforeSubscription && (
                <div className="p-6 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/[0.08] flex items-center justify-center mx-auto text-white/50">
                    <Info className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Prior to Membership</h4>
                  <p className="text-xs text-white/60 max-w-md mx-auto leading-relaxed">
                    Your Torque Care membership commenced on <span className="text-white font-bold">{formattedSubStart}</span>. Wash logs and morning route records are tracked starting from this date.
                  </p>
                </div>
              )}

              {/* CASE 3: SCHEDULED / TODAY / FUTURE CARE */}
              {!selectedDay.isBeforeSubscription && !selectedDay.hasProofUploaded && !selectedDay.isMissingProof && !selectedDay.isVehicleUnavailable && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 text-white space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#2DD4A0]">
                      <Sparkles className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                      <span>
                        {selectedDay.isToday
                          ? "Today's Scheduled Care Window"
                          : selectedDay.isSunday
                          ? 'Sunday Rest Day (6-Day Mon–Sat Plan)'
                          : 'Upcoming Scheduled Care'}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {selectedDay.isToday
                        ? `Specialist ${assignedWasherName} is assigned to wash your vehicle at ${parkingLocation} during the 06:30 AM – 09:30 AM route window. Photo proof will appear here once completed.`
                        : selectedDay.isSunday
                        ? 'Sunday is a rest day under the HOME BASIC 6-day (Mon–Sat) plan. Your service resumes on Monday morning.'
                        : `This date is covered under your active membership. Service partner ${assignedWasherName} will attend to ${currentVehicle?.registration_number || 'your vehicle'} during the morning route.`}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-3 text-xs">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                      Route Details
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-white/50 block text-[11px]">Time Window:</span>
                        <span className="text-white font-bold">
                          {currentVehicle?.preferred_wash_time || '07:30 AM'} (Morning Route)
                        </span>
                      </div>
                      <div>
                        <span className="text-white/50 block text-[11px]">Assigned Bay:</span>
                        <span className="text-white font-bold">{parkingLocation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE 4: FLAGGED / AWAY / MISSED */}
              {(selectedDay.isMissingProof || selectedDay.isVehicleUnavailable) && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        {selectedDay.isVehicleUnavailable
                          ? 'Vehicle Unavailable Protocol'
                          : 'Wash Flagged • Missed-Wash Protection'}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 leading-relaxed">
                      {selectedDay.isVehicleUnavailable
                        ? `The service partner arrived at ${parkingLocation}, but the vehicle was not parked in its assigned bay.`
                        : 'The service was not completed during the designated window. Under Torque Care protection, a credit will be adjusted towards your renewal.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-5 border-t border-white/[0.08] bg-[#161C25]/50 flex items-center justify-between gap-3">
              <span className="text-xs text-white/50 font-mono">
                Torque Care • {selectedDay.dateString}
              </span>

              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="px-6 py-2 rounded-full bg-white hover:bg-neutral-200 text-[#0A0D12] font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
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
