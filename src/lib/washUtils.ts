import { WashRecord } from './types';

export interface ProofVerificationResult {
  isWashedToday: boolean;
  isToday: boolean;
  isCompleted: boolean;
  hasProof: boolean;
  isBefore10AM: boolean;
  submissionTimeStr: string | null;
}

/**
 * Checks whether a wash record has its proof submitted for the present date (today)
 * before 10:00 AM IST.
 */
export function isPresentDateProofBefore10AM(wash?: WashRecord | null): ProofVerificationResult {
  if (!wash) {
    return {
      isWashedToday: false,
      isToday: false,
      isCompleted: false,
      hasProof: false,
      isBefore10AM: false,
      submissionTimeStr: null,
    };
  }

  // 1. Proof check and status check
  const hasProof = Boolean(wash.after_photo && wash.after_photo.trim().length > 0);
  const isCompleted = wash.status === 'completed';

  // 2. Present Date check (Indian Standard Time Asia/Kolkata)
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  
  // Format now as e.g. "1 Oct 2026"
  const nowParts = istFormatter.formatToParts(now);
  const currentDay = Number(nowParts.find((p) => p.type === 'day')?.value || now.getDate());
  const currentMonthShort = (nowParts.find((p) => p.type === 'month')?.value || '').toLowerCase();
  const currentYear = Number(nowParts.find((p) => p.type === 'year')?.value || now.getFullYear());

  let isToday = false;
  const sched = (wash.scheduled_date || '').toLowerCase().trim();

  if (sched === 'today' || sched === 'current') {
    isToday = true;
  } else if (sched) {
    // Check "01 Oct", "1 Oct", "1 Oct 2026", etc.
    const dayPadded = String(currentDay).padStart(2, '0');
    if (
      (sched.includes(`${dayPadded} ${currentMonthShort}`) ||
        sched.includes(`${currentDay} ${currentMonthShort}`) ||
        sched.includes(currentMonthShort)) &&
      (sched.includes(String(currentDay)) || sched.includes(dayPadded))
    ) {
      isToday = true;
    } else {
      // Try parsing date string
      const parsedDate = new Date(wash.scheduled_date);
      if (!isNaN(parsedDate.getTime())) {
        const pParts = istFormatter.formatToParts(parsedDate);
        const pDay = Number(pParts.find((p) => p.type === 'day')?.value);
        const pMonth = (pParts.find((p) => p.type === 'month')?.value || '').toLowerCase();
        const pYear = Number(pParts.find((p) => p.type === 'year')?.value);
        if (pDay === currentDay && pMonth === currentMonthShort && pYear === currentYear) {
          isToday = true;
        }
      }
    }
  }

  // Also verify against completed_at date if it's an ISO timestamp
  if (!isToday && wash.completed_at) {
    const parsedComp = new Date(wash.completed_at);
    if (!isNaN(parsedComp.getTime())) {
      const cParts = istFormatter.formatToParts(parsedComp);
      const cDay = Number(cParts.find((p) => p.type === 'day')?.value);
      const cMonth = (cParts.find((p) => p.type === 'month')?.value || '').toLowerCase();
      const cYear = Number(cParts.find((p) => p.type === 'year')?.value);
      if (cDay === currentDay && cMonth === currentMonthShort && cYear === currentYear) {
        isToday = true;
      }
    }
  }

  // 3. Submitted Before 10:00 AM Check
  let isBefore10AM = false;
  const submissionTimeStr = wash.completed_at || null;

  if (submissionTimeStr) {
    // Matches e.g. "07:42 AM", "7:42 AM", "09:30 AM", "10:00 AM", "10:15 AM", "07:42"
    const match = submissionTimeStr.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridian = match[3]?.toUpperCase();

      if (meridian === 'PM') {
        if (hours < 12) hours += 12;
      } else if (meridian === 'AM') {
        if (hours === 12) hours = 0;
      }

      // Check strictly before or at 10:00 AM
      if (hours < 10 || (hours === 10 && minutes === 0)) {
        isBefore10AM = true;
      } else {
        isBefore10AM = false;
      }
    } else {
      // Try parsing as ISO timestamp and convert to IST hours
      const parsedIso = new Date(submissionTimeStr);
      if (!isNaN(parsedIso.getTime())) {
        const istHourFormatter = new Intl.DateTimeFormat('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false,
        });
        const parts = istHourFormatter.formatToParts(parsedIso);
        const h = Number(parts.find((p) => p.type === 'hour')?.value);
        const m = Number(parts.find((p) => p.type === 'minute')?.value);

        if (h < 10 || (h === 10 && m === 0)) {
          isBefore10AM = true;
        } else {
          isBefore10AM = false;
        }
      }
    }
  }

  const isWashedToday = isToday && isCompleted && hasProof && isBefore10AM;

  return {
    isWashedToday,
    isToday,
    isCompleted,
    hasProof,
    isBefore10AM,
    submissionTimeStr,
  };
}
