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
  X,
  Car,
  MapPin,
  User,
  Info,
  ShieldCheck,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { WashRecord } from '@/lib/types';
import {
  fetchDailyWashFeedbackFromFirestore,
  saveDailyWashFeedbackToFirestore,
  subscribeToDailyWashFeedbackFromFirestore,
  resolveEffectiveOwnerId,
} from '@/lib/firebaseService';
import { getTodayISTDate, getNextDayIso } from '@/lib/washUtils';

interface DayStatus {
  date: number; // Day of month: 1-31
  isoDate: string; // 'YYYY-MM-DD'
  fullDate: Date;
  dateString: string; // e.g. '01 Oct'
  dayOfWeek: string; // 'Mon', 'Tue', etc.
  hasProofUploaded: boolean; // Real wash completed with photo
  isMissingProof: boolean; // Wash flagged/missed
  isVehicleUnavailable: boolean; // Car was not in bay
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isSunday: boolean; // Sunday
  isRestDay: boolean; // Rest day for washer schedule
  isPriorToStart: boolean; // Strictly before serviceStartDate
  isSignupDate: boolean; // Day user registered
  isAutoConfirmedYes?: boolean; // True when past day ended without owner input and defaulted to Washed (Yes)
  feedback?: 'yes' | 'no';
  wash?: WashRecord;
}

interface OwnerProofCalendarProps {
  assignedWasherName?: string;
  assignedWasherAvatar?: string;
  parkingLocation?: string;
  washes?: WashRecord[];
  todayWash?: WashRecord | null;
  selectedVehicleId?: string;
  todayFeedbackStatus?: 'yes' | 'no' | null;
  feedbacks?: Record<string, 'yes' | 'no'>;
  signupDate?: string;
  serviceStartDate?: string;
  onFeedbackChange?: (dateIso: string, answer: 'yes' | 'no') => void;
  onStatsChange?: (stats: { verifiedCount: number; missingCount: number; isCurrentMonth: boolean }) => void;
}

export default function OwnerProofCalendar({
  assignedWasherName: propWasherName,
  assignedWasherAvatar: propWasherAvatar,
  parkingLocation: propParkingLocation,
  washes: propWashes,
  todayWash: propTodayWash,
  selectedVehicleId: propSelectedVehicleId,
  todayFeedbackStatus,
  feedbacks: propFeedbacks,
  signupDate: propSignupDate,
  serviceStartDate: propServiceStartDate,
  onFeedbackChange,
  onStatsChange,
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

  // Current real date (start of day)
  const realNow = useMemo(() => new Date(), []);

  // Month navigation offset: 0 = current active month, -1 = previous, +1 = next
  const [monthOffset, setMonthOffset] = useState<number>(0);

  // Modal inspection state
  const [selectedDay, setSelectedDay] = useState<DayStatus | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  const [dailyFeedbacks, setDailyFeedbacks] = useState<Record<string, 'yes' | 'no'>>({});
  const [savingDate, setSavingDate] = useState<string | null>(null);
  const [savedDate, setSavedDate] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Clean up legacy local storage cache
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('torque_daily_wash_feedbacks');
      } catch (e) {}
    }

    if (propFeedbacks && Object.keys(propFeedbacks).length > 0) {
      setDailyFeedbacks((prev) => ({ ...prev, ...propFeedbacks }));
    }

    // Always fetch directly and subscribe to Firestore
    const resolvedOwnerId = resolveEffectiveOwnerId(user?.id) || undefined;

    fetchDailyWashFeedbackFromFirestore(resolvedOwnerId).then((fb) => {
      if (fb && Object.keys(fb).length > 0) {
        setDailyFeedbacks((prev) => ({ ...prev, ...fb }));
      }
    });

    const unsub = subscribeToDailyWashFeedbackFromFirestore(resolvedOwnerId, (fb) => {
      if (fb && Object.keys(fb).length > 0) {
        setDailyFeedbacks((prev) => ({ ...prev, ...fb }));
      }
    });

    return () => {
      unsub();
    };
  }, [user?.id]);

  useEffect(() => {
    if (propFeedbacks && Object.keys(propFeedbacks).length > 0) {
      setDailyFeedbacks((prev) => ({ ...prev, ...propFeedbacks }));
    }
  }, [propFeedbacks]);

  useEffect(() => {
    if (todayFeedbackStatus) {
      const todayIst = getTodayISTDate();
      setDailyFeedbacks((prev) => ({
        ...prev,
        [todayIst.dateIso]: todayFeedbackStatus,
      }));
    }
  }, [todayFeedbackStatus]);

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

  // Real date & IST tracking
  const todayIst = useMemo(() => getTodayISTDate(), []);
  const todayIso = todayIst.dateIso;

  // Compute effective signup date (date of registration)
  const effectiveSignupDate = useMemo(() => {
    if (propSignupDate) return propSignupDate;
    if (currentVehicle?.signupDate) return currentVehicle.signupDate;
    if (user?.signupDate) return user.signupDate;
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('torque_signup_date');
      if (local) return local;
    }
    if (user?.created_at && user.created_at.includes('T')) {
      return user.created_at.split('T')[0];
    }
    return todayIso;
  }, [propSignupDate, currentVehicle?.signupDate, user?.signupDate, user?.created_at, todayIso]);

  // Care starts on the exact day owner signs up (NOT next day)
  const effectiveServiceStartDate = useMemo(() => {
    if (effectiveSignupDate) {
      return effectiveSignupDate;
    }
    if (propServiceStartDate) return propServiceStartDate;
    if (currentVehicle?.serviceStartDate) return currentVehicle.serviceStartDate;
    if (user?.serviceStartDate) return user.serviceStartDate;
    if (typeof window !== 'undefined') {
      const local = localStorage.getItem('torque_service_start_date');
      if (local) return local;
    }
    return todayIso;
  }, [effectiveSignupDate, propServiceStartDate, currentVehicle?.serviceStartDate, user?.serviceStartDate, todayIso]);

  const handleCalendarDayFeedback = async (answer: 'yes' | 'no') => {
    if (!selectedDay) return;
    const dateIso = selectedDay.isoDate;

    // Update local state immediately so calendar cell turns green/orange instantly
    setDailyFeedbacks((prev) => ({
      ...prev,
      [dateIso]: answer,
    }));

    setSelectedDay((prev) =>
      prev
        ? {
            ...prev,
            feedback: answer,
            hasProofUploaded: answer === 'yes',
            isMissingProof: answer === 'no',
          }
        : null
    );

    if (selectedDay.isToday && typeof window !== 'undefined') {
      localStorage.setItem(`torque_daily_feedback_answered_${dateIso}`, answer);
    }

    if (onFeedbackChange) {
      onFeedbackChange(dateIso, answer);
    }

    const targetOwnerId = resolveEffectiveOwnerId(user?.id) || undefined;

    setSavingDate(dateIso);
    setSavedDate(null);

    try {
      await saveDailyWashFeedbackToFirestore(
        targetOwnerId,
        currentVehicle?.id,
        dateIso,
        answer
      );
      setSavingDate(null);
      setSavedDate(dateIso);
      setTimeout(() => {
        setSavedDate((curr) => (curr === dateIso ? null : curr));
      }, 2500);
    } catch (err) {
      setSavingDate(null);
      console.warn('Failed to save calendar day feedback to firestore:', err);
    }
  };

  // Washer weekly leave day resolution
  const washerLeaveDay = useMemo(() => {
    const day =
      currentVehicle?.washerLeaveDay ||
      (currentVehicle as any)?.washerWeeklyLeaveDay ||
      user?.washerLeaveDay ||
      '';
    return day.trim();
  }, [currentVehicle?.washerLeaveDay, (currentVehicle as any)?.washerWeeklyLeaveDay, user?.washerLeaveDay]);

  const hasNoWeeklyLeave = useMemo(() => {
    const lower = washerLeaveDay.toLowerCase();
    return lower.includes("doesn't") || lower.includes('no leave') || lower.includes('none');
  }, [washerLeaveDay]);

  const targetRestAbbr = useMemo(() => {
    if (hasNoWeeklyLeave) return null;
    const weekdayAbbrMap: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    const lower = washerLeaveDay.toLowerCase();
    for (const [name, abbr] of Object.entries(weekdayAbbrMap)) {
      if (lower.includes(name)) return abbr;
    }
    return 'Sun'; // default is Sunday
  }, [hasNoWeeklyLeave, washerLeaveDay]);

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
      const isRestDay = targetRestAbbr ? dayOfWeek === targetRestAbbr : false;
      const monthShort = fullDate.toLocaleDateString('en-US', { month: 'short' });
      const dateString = `${d < 10 ? '0' : ''}${d} ${monthShort}`;

      const isToday = isSameDay(fullDate, todayMidnight);
      const isPast = fullDate < todayMidnight;
      const isFuture = fullDate > todayMidnight;

      const dPadded = d < 10 ? `0${d}` : `${d}`;
      const isoDate = `${monthData.year}-${String(monthData.month + 1).padStart(2, '0')}-${dPadded}`;

      // Date enrollment status: Care starts from signup date onwards.
      // Neither today nor signup date is EVER prior to start!
      const isSignupDate = isoDate === effectiveSignupDate;
      const isPriorToStart =
        isToday || isSignupDate
          ? false
          : effectiveServiceStartDate
          ? isoDate < effectiveServiceStartDate
          : false;

      // Match REAL wash record from store/Firestore for this vehicle
      let matchingWash: WashRecord | undefined;

      // 1. If today and activeTodayWash is present
      if (isToday && activeTodayWash) {
        if (!activeTodayWash.vehicle_id || !currentVehicle || activeTodayWash.vehicle_id === currentVehicle.id) {
          matchingWash = activeTodayWash;
        }
      }

      // 2. Search in allWashes (only if on/after service start date!)
      if (!isPriorToStart && !matchingWash && allWashes && allWashes.length > 0) {
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

      // User requirement: from the firestore, if ownerFeedback is "no", flag that in orange in the calendar.
      // Also: If the user doesn't answer the question by the end of the day of that day,
      // assume that the car was washed successfully, consider that "Yes".
      // Example: On 18th October 2026, the user never opened the app, by the end of the day consider that the car was washed.
      const directFeedback = dailyFeedbacks[isoDate];
      const washOwnerFeedback: 'yes' | 'no' | undefined = (
        matchingWash?.ownerFeedback === 'no' ||
        (matchingWash as any)?.flaggedNotCleaned ||
        (matchingWash as any)?.flaggedOrange ||
        matchingWash?.status === 'missed'
      )
        ? 'no'
        : (matchingWash?.ownerFeedback === 'yes' || (matchingWash as any)?.isCleaned)
        ? 'yes'
        : undefined;

      // If either Firestore feedback or wash document feedback has 'no', then 'no' takes absolute precedence!
      const resolvedFeedback: 'yes' | 'no' | undefined =
        directFeedback === 'no' || washOwnerFeedback === 'no'
          ? 'no'
          : directFeedback === 'yes' || washOwnerFeedback === 'yes'
          ? 'yes'
          : undefined;

      const isAutoYes = isPast && !isPriorToStart && !isRestDay && !resolvedFeedback;
      const effectiveFeedback: 'yes' | 'no' | undefined = resolvedFeedback || (isAutoYes ? 'yes' : undefined);

      let hasProofUploaded = false;
      let isMissingProof = false;
      let isVehicleUnavailable = false;

      // STRICT RULES:
      // 1. If owner answered 'no' / ownerFeedback === 'no' -> Flag it Orange (Missed wash)
      // 2. If prior to serviceStartDate -> Pre-enrollment day (NO washes, NO alerts, NO proofs)
      // 3. If washer rest day (e.g. Sunday or weekly leave) -> Rest day (no wash)
      // 4. On active service days:
      //    - If owner answered 'yes' -> Cleaned ✓ (Green)
      //    - If past day without an answer -> Auto-confirmed "Yes" (Cleaned ✓) by end of day
      //    - Today without completed wash remains scheduled/in progress until answered or end of day
      if (effectiveFeedback === 'no') {
        isMissingProof = true;
        hasProofUploaded = false;
        isVehicleUnavailable = false;
      } else if (isPriorToStart) {
        hasProofUploaded = false;
        isMissingProof = false;
        isVehicleUnavailable = false;
      } else if (isRestDay) {
        hasProofUploaded = false;
        isMissingProof = false;
        isVehicleUnavailable = false;
      } else {
        if (effectiveFeedback === 'yes' || isPast) {
          hasProofUploaded = true;
          isMissingProof = false;
        } else if (matchingWash) {
          if (matchingWash.status === 'completed') {
            hasProofUploaded = true;
          } else if (matchingWash.status === 'vehicle_unavailable') {
            isVehicleUnavailable = true;
          } else if (matchingWash.status === 'missed' || matchingWash.status === 'attempted') {
            isMissingProof = true;
          }
        }
      }

      list.push({
        date: d,
        isoDate,
        fullDate,
        dateString,
        dayOfWeek,
        hasProofUploaded,
        isMissingProof,
        isVehicleUnavailable,
        isToday,
        isPast,
        isFuture,
        isSunday,
        isRestDay,
        isPriorToStart,
        isSignupDate,
        isAutoConfirmedYes: isAutoYes,
        feedback: effectiveFeedback,
        wash: matchingWash,
      });
    }

    return list;
  }, [
    monthData,
    todayMidnight,
    activeTodayWash,
    allWashes,
    currentVehicle,
    dailyFeedbacks,
    effectiveSignupDate,
    effectiveServiceStartDate,
    targetRestAbbr,
  ]);

  // Summary counts for current month view (strictly excluding pre-start days)
  const verifiedCount = days.filter((d) => !d.isPriorToStart && d.hasProofUploaded && d.feedback !== 'no').length;
  const missingOrAlertCount = days.filter(
    (d) => !d.isPriorToStart && (d.isMissingProof || d.isVehicleUnavailable || d.feedback === 'no' || d.wash?.ownerFeedback === 'no')
  ).length;
  const scheduledCount = days.filter(
    (d) => !d.isPriorToStart && (d.isFuture || d.isToday) && !d.isRestDay && !d.hasProofUploaded && !d.isMissingProof && d.feedback !== 'no'
  ).length;

  // Sundays calculation for the viewed month
  const sundaysList = useMemo(() => days.filter((d) => d.isSunday), [days]);
  const sundaysCount = sundaysList.length;
  const sundaysDatesFormatted = useMemo(
    () => sundaysList.map((d) => (d.date < 10 ? `0${d.date}` : `${d.date}`)).join(', '),
    [sundaysList]
  );

  useEffect(() => {
    if (onStatsChange) {
      onStatsChange({
        verifiedCount,
        missingCount: missingOrAlertCount,
        isCurrentMonth: monthOffset === 0,
      });
    }
  }, [verifiedCount, missingOrAlertCount, monthOffset, onStatsChange]);

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
              DAILY WASH AUDIT LOG
            </span>
            <span className="text-[10px] font-mono text-white/50 bg-[#161C25] px-2.5 py-0.5 rounded-full border border-white/[0.08]">
              {hasNoWeeklyLeave
                ? '7-Day Daily Morning Care • No Leaves'
                : washerLeaveDay && washerLeaveDay !== 'Sunday'
                ? `Daily Morning Care • ${washerLeaveDay}s Rest`
                : 'Mon–Sat Morning Care • Sundays Rest'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Wash Proof Calendar
          </h2>
        </div>

        {/* Car Switcher + Month Navigator */}
        <div className="w-full sm:w-auto flex items-center gap-2.5">
          {vehicles.length > 1 && (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="px-3 py-1.5 rounded-full bg-[#161C25] border border-white/[0.08] text-xs font-semibold text-white focus:outline-hidden focus:border-[#2DD4A0] shrink-0"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#11161D] text-white">
                  {v.make} {v.model} ({v.registration_number})
                </option>
              ))}
            </select>
          )}

          <div className="w-full sm:w-auto flex-1 sm:flex-initial flex items-center justify-between gap-1 bg-[#161C25] border border-white/[0.08] rounded-full p-1 shadow-sm">
            <button
              onClick={() => setMonthOffset((prev) => prev - 1)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold text-white px-3 font-mono text-center flex-1 sm:flex-initial">
              {monthData.name}
            </span>

            <button
              onClick={() => setMonthOffset((prev) => prev + 1)}
              className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {monthOffset !== 0 && (
            <button
              onClick={() => setMonthOffset(0)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white border border-white/[0.08] transition-all cursor-pointer shrink-0"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* MONTHLY WASH AUDIT METRICS TABLE */}
      <div className="w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#161C25]/50 backdrop-blur-sm shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[580px]" aria-label="Monthly Wash Audit Statistics">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] font-mono uppercase tracking-wider text-white/50">
                <th scope="col" className="py-3 px-4 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0] shadow-[0_0_8px_rgba(45,212,160,0.8)]" />
                    Verified Proofs
                  </span>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    Flagged / Away
                  </span>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4A0]/50" />
                    Scheduled Route Washes
                  </span>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                    Sundays ({monthData.name.split(' ')[0]})
                  </span>
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    Care Schedule
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              <tr className="hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-[#2DD4A0]">{verifiedCount}</span>
                    <span className="text-[11px] text-[#2DD4A0]/70 font-mono">Cleaned ✓</span>
                  </div>
                  <span className="text-[10px] text-white/40 block mt-0.5">Verified washes</span>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-amber-300">{missingOrAlertCount}</span>
                    <span className="text-[11px] text-amber-400/70 font-mono">Missed</span>
                  </div>
                  <span className="text-[10px] text-white/40 block mt-0.5">Flagged not cleaned</span>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-white">{scheduledCount}</span>
                    <span className="text-[11px] text-white/50 font-mono">Upcoming</span>
                  </div>
                  <span className="text-[10px] text-white/40 block mt-0.5">Remaining in month</span>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-bold font-mono text-blue-300">{sundaysCount}</span>
                    <span className="text-[11px] text-blue-400/70 font-mono">Sundays</span>
                  </div>
                  <span className="text-[10px] text-white/40 block mt-0.5 font-mono">
                    {sundaysDatesFormatted ? `${sundaysDatesFormatted} ${monthData.name.split(' ')[0]}` : 'Sundays off'}
                  </span>
                </td>
                <td className="py-3.5 px-4 align-top">
                  <span className="text-xs font-semibold text-white/90 block">
                    {hasNoWeeklyLeave
                      ? '7-Day Care (No Weekly Off)'
                      : washerLeaveDay && washerLeaveDay !== 'Sunday'
                      ? `Daily Care (${washerLeaveDay}s Off)`
                      : 'Mon–Sat Care (Sundays Off)'}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono block mt-0.5">
                    {monthData.daysCount} total days in {monthData.name}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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

            const isFlaggedOrange = day.isMissingProof || day.feedback === 'no' || day.wash?.ownerFeedback === 'no';
            const isCleanedGreen = !isFlaggedOrange && (day.hasProofUploaded || day.feedback === 'yes' || day.wash?.ownerFeedback === 'yes');

            if (isFlaggedOrange) {
              // Flagged Orange in the calendar (ownerFeedback is "no")
              cellClasses =
                'bg-amber-500/15 text-amber-300 border border-amber-400/50 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(251,191,36,0.25)]';
              dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]';
              titleText = `Day ${day.date}: Flagged Orange • Car not cleaned by washer`;
            } else if (day.isPriorToStart) {
              // Past day before user registered
              cellClasses =
                'bg-white/[0.01] text-white/20 border border-white/[0.03] opacity-35 hover:opacity-60 cursor-pointer';
              dotColor = 'bg-transparent';
              titleText = `Day ${day.date}: Prior to Torque Care registration (Started ${effectiveServiceStartDate})`;
            } else if (isCleanedGreen) {
              // Cleaned Green in the calendar (ownerFeedback is "yes" or wash verified)
              cellClasses =
                'bg-[#2DD4A0]/10 text-white border border-[#2DD4A0]/30 hover:bg-[#2DD4A0]/20';
              dotColor = 'bg-[#2DD4A0] shadow-[0_0_8px_rgba(45,212,160,0.8)]';
              titleText = `Day ${day.date}: Cleaned ✓`;
            } else if (day.isVehicleUnavailable) {
              cellClasses =
                'bg-amber-500/10 text-amber-200 border border-amber-400/30 hover:bg-amber-500/20';
              dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]';
              titleText = `Day ${day.date}: Vehicle unavailable`;
            } else if (day.isRestDay) {
              cellClasses =
                'bg-white/[0.01] text-white/30 border border-white/[0.04]';
              dotColor = 'bg-white/20';
              titleText = `Day ${day.date}: Rest day (${washerLeaveDay || 'Sunday'})`;
            } else if (day.isFuture) {
              cellClasses =
                'bg-[#161C25]/40 text-white/80 border border-white/[0.06] hover:border-[#2DD4A0]/30';
              dotColor = 'bg-[#2DD4A0]/30';
              titleText = `Day ${day.date}: Scheduled care (07:30 AM window)`;
            }

            // Highlighting TODAY when today is ON or AFTER service start date
            if (day.isToday && !day.isPriorToStart) {
              if (isFlaggedOrange) {
                cellClasses =
                  'bg-amber-500/20 text-amber-300 font-black border-2 border-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.6)] scale-[1.02]';
                dotColor = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]';
                titleText = `Day ${day.date}: Today • Flagged Orange: Car not cleaned by washer`;
              } else if (isCleanedGreen) {
                cellClasses =
                  'bg-[#2DD4A0] text-[#0A0D12] font-black shadow-[0_0_15px_rgba(45,212,160,0.4)] border-[#2DD4A0] scale-[1.02]';
                dotColor = 'bg-[#0A0D12]';
                titleText = `Day ${day.date}: Today • Cleaned ✓`;
              } else {
                cellClasses =
                  'bg-[#2DD4A0]/20 text-[#2DD4A0] font-bold border-2 border-[#2DD4A0] shadow-[0_0_15px_rgba(45,212,160,0.3)] scale-[1.02]';
                dotColor = 'bg-[#2DD4A0] shadow-[0_0_8px_rgba(45,212,160,0.8)]';
                titleText = `Day ${day.date}: Today • Scheduled morning route`;
              }
            }

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => {
                  setSelectedDay(day);
                }}
                className={`aspect-square w-full rounded-xl sm:rounded-[14px] p-1 flex flex-col items-center justify-center relative transition-all active:scale-95 cursor-pointer overflow-hidden ${cellClasses}`}
                title={titleText}
              >
                <span
                  className={`text-xs sm:text-sm font-bold ${
                    isFlaggedOrange
                      ? 'text-amber-300 font-black'
                      : day.isToday
                      ? day.isPriorToStart
                        ? 'text-[#2DD4A0] font-black'
                        : isCleanedGreen
                        ? 'text-[#0A0D12] font-black'
                        : 'text-[#2DD4A0] font-black'
                      : day.isSignupDate
                      ? 'text-[#2DD4A0] font-bold'
                      : ''
                  }`}
                >
                  {day.date}
                </span>

                {/* Indicator dot or tag */}
                {day.isSignupDate ? (
                  <span className="text-[8px] font-mono uppercase font-bold text-[#2DD4A0] tracking-tight leading-none mt-0.5 scale-90 sm:scale-100">
                    {day.isToday ? 'Start' : 'Joined'}
                  </span>
                ) : dotColor !== 'bg-transparent' ? (
                  <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${dotColor}`} />
                ) : null}
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
            Cleaned ({verifiedCount})
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
          <span className="text-[11px] font-medium text-white/70">
            Flagged Orange: Not Cleaned ({missingOrAlertCount})
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
            {hasNoWeeklyLeave ? 'All Days Covered' : `${washerLeaveDay || 'Sunday'} Rest`}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL: PROOF INSPECTION ON DATE CLICK                        */}
      {/* ============================================================ */}
      {selectedDay && (() => {
        const rawSelectedFeedback =
          selectedDay.feedback ||
          dailyFeedbacks[selectedDay.isoDate] ||
          (selectedDay.wash?.ownerFeedback as 'yes' | 'no') ||
          ((selectedDay.wash as any)?.flaggedNotCleaned || (selectedDay.wash as any)?.flaggedOrange || selectedDay.wash?.status === 'missed' ? 'no' : undefined);
        const isAutoConfirmedPast =
          selectedDay.isPast &&
          !selectedDay.isPriorToStart &&
          !selectedDay.isRestDay &&
          !rawSelectedFeedback &&
          !selectedDay.isMissingProof;
        const selectedFeedback = rawSelectedFeedback || (isAutoConfirmedPast ? 'yes' : undefined);

        const isCurrentlyMissed = selectedFeedback === 'no' || selectedDay.isMissingProof || selectedDay.wash?.ownerFeedback === 'no';
        const isCurrentlyCleaned =
          !isCurrentlyMissed &&
          (selectedFeedback === 'yes' ||
          (selectedDay.isPast && !selectedDay.isPriorToStart && !selectedDay.isRestDay));
        const isCurrentlyVehicleUnavailable = !isCurrentlyCleaned && !isCurrentlyMissed && selectedDay.isVehicleUnavailable;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#11161D] border border-white/[0.08] rounded-[20px] shadow-2xl overflow-hidden relative text-white flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 border-b border-white/[0.08] flex items-center justify-between bg-[#161C25]/50">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${
                      selectedDay.isPriorToStart
                        ? selectedDay.isSignupDate
                          ? 'bg-[#2DD4A0] text-[#0A0D12] font-black'
                          : 'border border-white/10 bg-[#161C25] text-white/40'
                        : isCurrentlyMissed || isCurrentlyVehicleUnavailable
                        ? 'bg-amber-400 text-[#0A0D12]'
                        : isCurrentlyCleaned
                        ? 'bg-[#2DD4A0] text-[#0A0D12]'
                        : selectedDay.isToday
                        ? 'bg-[#2DD4A0] text-[#0A0D12] font-black'
                        : selectedDay.isRestDay
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
                      {selectedDay.isPriorToStart ? (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-bold">
                          {selectedDay.isSignupDate ? (selectedDay.isToday ? 'Signed Up Today' : 'Registration Day') : 'Prior to Enrollment'}
                        </span>
                      ) : selectedDay.isToday && !selectedFeedback ? (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2DD4A0] text-[#0A0D12] font-bold">
                          Today • In Progress
                        </span>
                      ) : null}
                      {isCurrentlyCleaned && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2DD4A0] text-[#0A0D12] font-bold">
                          {isAutoConfirmedPast ? 'Washed by Default ✓' : 'Cleaned ✓'}
                        </span>
                      )}
                      {(isCurrentlyMissed || isCurrentlyVehicleUnavailable) && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-400 text-[#0A0D12] font-bold">
                          {isCurrentlyVehicleUnavailable
                            ? 'Vehicle Unavailable'
                            : 'Flagged Orange • Not Cleaned'}
                        </span>
                      )}
                      {!selectedDay.isPriorToStart && !isCurrentlyCleaned && !isCurrentlyMissed && !isCurrentlyVehicleUnavailable && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#2DD4A0]/15 text-[#2DD4A0] border border-[#2DD4A0]/30 font-bold">
                          {selectedDay.isRestDay ? `${washerLeaveDay || 'Sunday'} Rest` : 'Scheduled Care'}
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
                {/* CASE 0: PRIOR TO SERVICE START (Strictly for days before registration) */}
                {selectedDay.isPriorToStart && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white/70 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-white/60">
                        <span>Prior to Torque Care Registration</span>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed">
                        This date was before your vehicle registration. Daily Torque Care morning wash recording began on {effectiveServiceStartDate}.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-3 text-xs">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                        Registration Details
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-white/50 block text-[11px]">Enrolled On:</span>
                          <span className="text-white font-bold">{effectiveSignupDate}</span>
                        </div>
                        <div>
                          <span className="text-white/50 block text-[11px]">Care Started:</span>
                          <span className="text-[#2DD4A0] font-bold">{effectiveServiceStartDate}</span>
                        </div>
                        <div>
                          <span className="text-white/50 block text-[11px]">Assigned Specialist:</span>
                          <span className="text-white font-bold">{assignedWasherName}</span>
                        </div>
                        <div>
                          <span className="text-white/50 block text-[11px]">Assigned Bay:</span>
                          <span className="text-white font-bold">{parkingLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* QUESTION: Was your car washed today (Date)? Yes / No */}
                {!selectedDay.isPriorToStart && !selectedDay.isRestDay && (
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-[#161C25] to-[#11161D] border border-white/[0.12] space-y-4 shadow-xl">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#2DD4A0]/15 border border-[#2DD4A0]/30 flex items-center justify-center text-[#2DD4A0] shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white leading-snug">
                          {selectedDay.isToday
                            ? `Was your car washed today (${selectedDay.dateString})?`
                            : `Was your car washed on ${selectedDay.dateString}?`}
                        </h4>
                        <p className="text-xs text-white/60 mt-0.5">
                          {selectedDay.isToday
                            ? 'Confirm your daily wash. If unconfirmed by the end of today, it automatically defaults to Washed (Yes).'
                            : 'Select Yes or No to record your feedback. Unanswered past days default to Washed (Yes).'}
                        </p>
                      </div>
                    </div>

                    {/* Status / Saved Answer Badge & Firebase Sync Indicator */}
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      {selectedFeedback ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white/60">Status:</span>
                          <span
                            className={`font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                              selectedFeedback === 'yes'
                                ? 'bg-[#2DD4A0]/20 text-[#2DD4A0] border border-[#2DD4A0]/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {selectedFeedback === 'yes' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#2DD4A0]" />
                                <span>
                                  {isAutoConfirmedPast
                                    ? 'Yes (Auto-confirmed: Washed by default at end of day)'
                                    : 'Yes (Cleaned ✓)'}
                                </span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-amber-400" />
                                <span>No (Flagged Orange • Missed)</span>
                              </>
                            )}
                          </span>
                        </div>
                      ) : selectedDay.isToday ? (
                        <div className="p-2.5 rounded-xl bg-[#2DD4A0]/5 border border-[#2DD4A0]/15 text-[11px] text-[#2DD4A0]/80">
                          Awaiting confirmation • If unanswered by end of day, car will automatically be considered washed.
                        </div>
                      ) : null}

                      {/* Firebase Sync Feedback */}
                      {savingDate === selectedDay.isoDate ? (
                        <span className="text-[11px] font-mono text-blue-400 animate-pulse flex items-center gap-1.5 ml-auto">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Saving to Firebase...
                        </span>
                      ) : savedDate === selectedDay.isoDate ? (
                        <span className="text-[11px] font-mono text-[#2DD4A0] flex items-center gap-1.5 ml-auto">
                          <CheckCircle2 className="w-3 h-3 text-[#2DD4A0]" /> Saved to Firebase ✓
                        </span>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCalendarDayFeedback('yes')}
                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          selectedFeedback === 'yes'
                            ? 'bg-[#2DD4A0] text-black shadow-[#2DD4A0]/25 ring-2 ring-[#2DD4A0]'
                            : 'bg-[#2DD4A0]/20 hover:bg-[#2DD4A0]/30 text-[#2DD4A0] border border-[#2DD4A0]/40'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Yes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCalendarDayFeedback('no')}
                        className={`py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                          selectedFeedback === 'no'
                            ? 'bg-amber-500 text-black shadow-amber-500/25 ring-2 ring-amber-500'
                            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>No</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE: VERIFIED / WASHED DETAILS */}
                {!selectedDay.isPriorToStart && isCurrentlyCleaned && !isCurrentlyMissed && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 text-white space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#2DD4A0]">
                        <CheckCircle2 className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                        <span>
                          {isAutoConfirmedPast
                            ? 'Morning Wash Completed (Auto-Confirmed at End of Day)'
                            : 'Morning Wash Cleaned'}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {isAutoConfirmedPast
                          ? `As per Torque Care protocol, since no missed wash was flagged by the end of ${selectedDay.dateString}, this service was logged as successfully washed.`
                          : `Service partner ${assignedWasherName} attended to ${currentVehicle?.registration_number || 'your vehicle'} during the morning route.`}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-3 text-xs">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                        Service Log Details
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-white/50 block text-[11px]">Specialist:</span>
                          <span className="text-white font-bold">{assignedWasherName}</span>
                        </div>
                        <div>
                          <span className="text-white/50 block text-[11px]">Assigned Bay:</span>
                          <span className="text-white font-bold">{parkingLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CASE 2: SCHEDULED / TODAY / REST / FUTURE CARE */}
                {!selectedDay.isPriorToStart && !isCurrentlyCleaned && !isCurrentlyMissed && !isCurrentlyVehicleUnavailable && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-[#2DD4A0]/10 border border-[#2DD4A0]/25 text-white space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-[#2DD4A0]">
                        <Sparkles className="w-4 h-4 text-[#2DD4A0] shrink-0" />
                        <span>
                          {selectedDay.isToday
                            ? "Today's Scheduled Care Window"
                            : selectedDay.isRestDay
                            ? `${washerLeaveDay || 'Sunday'} Rest Day`
                            : 'Upcoming Scheduled Care'}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {selectedDay.isToday
                          ? `Specialist ${assignedWasherName} is assigned to wash your vehicle at ${parkingLocation} during the 06:30 AM – 09:30 AM route window. If not answered by the end of today, it will automatically be logged as washed.`
                          : selectedDay.isRestDay
                          ? `${washerLeaveDay || 'Sunday'} is a scheduled rest day for your assigned specialist. Morning wash tracking resumes on the next scheduled workday.`
                          : `This date is scheduled for morning care. Service partner ${assignedWasherName} will attend to ${currentVehicle?.registration_number || 'your vehicle'} during the morning route.`}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-[#161C25] border border-white/[0.08] space-y-3 text-xs">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
                        Route Details
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-white/50 block text-[11px]">Need Before:</span>
                          <span className="text-white font-bold">
                            Before {currentVehicle?.needWashBefore || (currentVehicle?.preferred_wash_time?.startsWith('Before') ? currentVehicle.preferred_wash_time.replace(/^Before\s+/i, '') : (currentVehicle?.preferred_wash_time || '8:00 AM'))}
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
                {(isCurrentlyMissed || isCurrentlyVehicleUnavailable) && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-200 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          {isCurrentlyVehicleUnavailable
                            ? 'Vehicle Unavailable Protocol'
                            : 'Flagged: Car Not Cleaned by Washer (Orange)'}
                        </span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed">
                        {isCurrentlyVehicleUnavailable
                          ? `The service partner arrived at ${parkingLocation}, but the vehicle was not parked in its assigned bay.`
                          : 'Owner flagged that the vehicle was not cleaned today. Under Torque Care protection, priority re-wash protocol is activated.'}
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
        );
      })()}
    </div>
  );
}
