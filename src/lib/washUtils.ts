import { WashRecord } from './types';

export interface ISTDateInfo {
  year: number;
  monthNum: string; // '01'-'12'
  dayNum: string;   // '01'-'31'
  monthName: string; // 'October'
  monthShort: string; // 'oct'
  monthKey: string;  // 'October_2026'
  dateIso: string;   // '2026-10-02'
  dateDisplay: string; // '02 Oct'
}

/**
 * Returns current date components in Indian Standard Time (Asia/Kolkata).
 */
export function getTodayISTDate(date = new Date()): ISTDateInfo {
  const istFormatter = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = istFormatter.formatToParts(date);
  const dayNum = parts.find((p) => p.type === 'day')?.value || String(date.getDate()).padStart(2, '0');
  const monthNum = parts.find((p) => p.type === 'month')?.value || String(date.getMonth() + 1).padStart(2, '0');
  const year = Number(parts.find((p) => p.type === 'year')?.value || date.getFullYear());

  const monthName = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'long' }).format(date);
  const monthShort = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', month: 'short' }).format(date).toLowerCase();

  const monthKey = `${monthName}_${year}`;
  const dateIso = `${year}-${monthNum}-${dayNum}`;
  const dateDisplay = `${dayNum} ${monthName.slice(0, 3)}`;

  return {
    year,
    monthNum,
    dayNum,
    monthName,
    monthShort,
    monthKey,
    dateIso,
    dateDisplay,
  };
}

/**
 * Checks whether a wash record was ACTUALLY executed/captured TODAY in Indian Standard Time.
 * Prevents yesterday's or past wash proofs from showing as today's wash.
 */
export function isWashFromToday(wash?: WashRecord | null): boolean {
  if (!wash) return false;

  const today = getTodayISTDate();

  // 1. Check captured_at ISO timestamp (most accurate)
  if (wash.captured_at) {
    const capDate = new Date(wash.captured_at);
    if (!isNaN(capDate.getTime())) {
      const capIST = getTodayISTDate(capDate);
      return capIST.dateIso === today.dateIso;
    }
  }

  // 2. Check created_at ISO timestamp or Firestore timestamp string
  if (wash.created_at) {
    const crDate = new Date(wash.created_at);
    if (!isNaN(crDate.getTime())) {
      const crIST = getTodayISTDate(crDate);
      return crIST.dateIso === today.dateIso;
    }
  }

  // 3. Check scheduled_date if in ISO format (e.g. '2026-10-02')
  const sched = (wash.scheduled_date || '').trim();
  if (sched === today.dateIso) {
    return true;
  }

  // 4. If scheduled_date is explicitly 'Today' or 'current',
  // verify it has NOT been saved with an older created_at / completed_at!
  if (sched.toLowerCase() === 'today' || sched.toLowerCase() === 'current') {
    // If completed_at is a full ISO timestamp, verify the day
    if (wash.completed_at && wash.completed_at.includes('-')) {
      const compDate = new Date(wash.completed_at);
      if (!isNaN(compDate.getTime())) {
        const compIST = getTodayISTDate(compDate);
        return compIST.dateIso === today.dateIso;
      }
    }
    // If no older timestamp is recorded and it's marked today, check wash id
    if (wash.id && wash.id.includes('_')) {
      const datePartMatch = wash.id.match(/\d{4}-\d{2}-\d{2}/);
      if (datePartMatch) {
        return datePartMatch[0] === today.dateIso;
      }
    }
    // If purely a volatile in-memory 'Today' without a past timestamp:
    return true;
  }

  // 5. Check if scheduled_date matches '02 Oct' or similar for today
  if (sched.toLowerCase().includes(today.monthShort) && sched.includes(today.dayNum)) {
    return true;
  }

  return false;
}

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

  // 2. Strictly verify whether the wash is from the PRESENT DATE (today) in IST
  const isToday = isWashFromToday(wash);

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

      // Check strictly before or at 10:30 AM (Operational deadline is 10:30 AM everyday)
      if (hours < 10 || (hours === 10 && minutes <= 30)) {
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

        if (h < 10 || (h === 10 && m <= 30)) {
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
