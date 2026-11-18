import { Contribution } from '../types';

const MONTH_NAMES: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

/**
 * Returns local current month formatted as "YYYY-MM" (avoids UTC offset rollover issues).
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Returns an array of the last `count` months formatted as "YYYY-MM", ending with current month.
 */
export function getRecentMonthKeys(count = 6): string[] {
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1; // 1-12
  const keys: string[] = [];

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(endYear, endMonth - 1 - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}`);
  }
  return keys;
}

/**
 * Parses various month formats ("YYYY-MM", "YYYY-M", "YYYY-MM-DD", "Nov 2026", "November 2026", "11/2026")
 * into an integer month index (year * 12 + monthIndex0).
 */
export function parseYearMonthIndex(ym: string): number | null {
  const clean = (ym || '').trim();
  if (!clean) return null;

  // YYYY-MM or YYYY-M or YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(clean);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      return year * 12 + (month - 1);
    }
  }

  // MM/YYYY or MM-YYYY
  const slashMatch = /^(\d{1,2})[/-](\d{4})$/.exec(clean);
  if (slashMatch) {
    const month = parseInt(slashMatch[1], 10);
    const year = parseInt(slashMatch[2], 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      return year * 12 + (month - 1);
    }
  }

  // "November 2026" or "Nov 2026"
  const nameMatch = /^([a-zA-Z]+)[,\s-]+(\d{4})$/.exec(clean);
  if (nameMatch) {
    const month = MONTH_NAMES[nameMatch[1].toLowerCase()];
    const year = parseInt(nameMatch[2], 10);
    if (month && !isNaN(year)) {
      return year * 12 + (month - 1);
    }
  }

  return null;
}

/**
 * Determines how many months a contribution record covers.
 * Handles explicit `monthsCount`, period text notes ("2026-11 to 2027-08" or "10 months"),
 * and infers multi-month coverage when `amount` is an exact multiple of `monthlyRate` (e.g. Rs. 3000 at Rs. 300/mo = 10 months).
 */
export function getContributionMonthsCount(c: Contribution, monthlyRate = 300): number {
  if (typeof c.monthsCount === 'number' && c.monthsCount > 1) {
    return Math.floor(c.monthsCount);
  }

  const fields = [c.advancePeriodNote || '', c.notes || ''];

  for (const field of fields) {
    if (!field) continue;

    // Check explicit YYYY-MM to YYYY-MM range in notes
    const rangeMatch = field.match(/(\d{4}-\d{1,2})\s*(?:to|-|–)\s*(\d{4}-\d{1,2})/i);
    if (rangeMatch) {
      const startIdx = parseYearMonthIndex(rangeMatch[1]);
      const endIdx = parseYearMonthIndex(rangeMatch[2]);
      if (startIdx !== null && endIdx !== null && endIdx >= startIdx) {
        return endIdx - startIdx + 1;
      }
    }

    // Strip YYYY-MM / YYYY-MM-DD dates first so "Month: 2026-11" never false-matches "11 Month"
    const cleanField = field.replace(/\b\d{4}-\d{1,2}(?:-\d{1,2})?\b/g, ' ');
    const match =
      cleanField.match(/\b(?:advance\s*(?:for)?|for|next)\s+(\d+)\s+months?\b/i) ||
      cleanField.match(/\b(\d+)\s+months?\b/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 1 && parsed <= 120) return parsed;
    }
  }

  // Fallback inference: if monthsCount was omitted or left as 1 while amount is a clean multiple of monthlyRate (e.g. 3000 = 10 x 300)
  const rate = monthlyRate > 0 ? monthlyRate : 300;
  if (typeof c.amount === 'number' && c.amount > rate && c.amount % rate === 0) {
    const inferred = Math.round(c.amount / rate);
    if (inferred >= 2 && inferred <= 120) {
      return inferred;
    }
  }

  if (typeof c.monthsCount === 'number' && c.monthsCount >= 1) {
    return Math.floor(c.monthsCount);
  }
  return 1;
}

/**
 * Returns true if the contribution record is paid and covers the given "YYYY-MM" month
 * (either directly via c.month or as part of a multi-month advance contribution).
 */
export function doesContributionCoverMonth(
  c: Contribution,
  targetYearMonth: string,
  monthlyRate = 300
): boolean {
  if (!c) return false;
  const st = (c.status || '').toLowerCase();
  if (st && st !== 'paid' && st !== 'verified' && st !== 'completed') return false;

  const targetIdx = parseYearMonthIndex(targetYearMonth);
  let startIdx = parseYearMonthIndex(c.month);

  // Also check explicit range in advancePeriodNote / notes if c.month wasn't parsed
  const text = `${c.advancePeriodNote || ''} ${c.notes || ''}`;
  const rangeMatch = text.match(/(\d{4}-\d{1,2})\s*(?:to|-|–)\s*(\d{4}-\d{1,2})/i);
  if (rangeMatch && targetIdx !== null) {
    const rStart = parseYearMonthIndex(rangeMatch[1]);
    const rEnd = parseYearMonthIndex(rangeMatch[2]);
    if (rStart !== null && rEnd !== null && rEnd >= rStart) {
      if (targetIdx >= rStart && targetIdx <= rEnd) return true;
    }
  }

  if (startIdx === null || targetIdx === null) {
    return (c.month || '').trim() === targetYearMonth;
  }

  const count = getContributionMonthsCount(c, monthlyRate);
  return targetIdx >= startIdx && targetIdx < startIdx + count;
}

/**
 * Returns the PKR amount allocated to `targetYearMonth` from a contribution record.
 * For single-month contributions matching targetYearMonth, returns full `c.amount`.
 * For multi-month advance contributions covering targetYearMonth, returns monthly portion `c.amount / monthsCount`.
 */
export function getContributionShareForMonth(
  c: Contribution,
  targetYearMonth: string,
  monthlyRate = 300
): number {
  if (!doesContributionCoverMonth(c, targetYearMonth, monthlyRate)) return 0;
  const count = getContributionMonthsCount(c, monthlyRate);
  if (count <= 1) return c.amount || 0;
  return Math.round((c.amount || 0) / count);
}

/**
 * Normalizes a date string ("YYYY-MM-DD", "YYYY-MM-DDTHH...", "DD/MM/YYYY", "17 Nov 2026", "Nov 2026", etc.)
 * into "YYYY-MM". Returns null if it cannot be parsed.
 */
export function getDateYearMonth(dateStr?: string): string | null {
  const clean = (dateStr || '').trim();
  if (!clean) return null;

  // YYYY-MM or YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss...
  const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2}(?:[T\s].*)?)?$/.exec(clean);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    if (!isNaN(year) && !isNaN(month) && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  // DD/MM/YYYY or DD-MM-YYYY (with fallback if MM/DD/YYYY when second part > 12)
  const dmyMatch = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(clean);
  if (dmyMatch) {
    const p1 = parseInt(dmyMatch[1], 10);
    const p2 = parseInt(dmyMatch[2], 10);
    const year = parseInt(dmyMatch[3], 10);
    let month = p2;
    if (p2 > 12 && p1 >= 1 && p1 <= 12) {
      month = p1;
    }
    if (!isNaN(year) && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  // MM/YYYY or MM-YYYY
  const myMatch = /^(\d{1,2})[/-](\d{4})$/.exec(clean);
  if (myMatch) {
    const month = parseInt(myMatch[1], 10);
    const year = parseInt(myMatch[2], 10);
    if (!isNaN(year) && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  // "17 Nov 2026", "Nov 17, 2026", "Nov 2026", "November 2026"
  const textMonthMatch = /\b([a-zA-Z]+)\b.*\b(\d{4})\b/.exec(clean);
  if (textMonthMatch) {
    const month = MONTH_NAMES[textMonthMatch[1].toLowerCase()];
    const year = parseInt(textMonthMatch[2], 10);
    if (month && !isNaN(year)) {
      return `${year}-${String(month).padStart(2, '0')}`;
    }
  }

  return null;
}

/**
 * Returns the full PKR cash amount collected in `targetYearMonth` ("YYYY-MM") for a contribution record.
 * Uses `paidDate` when present (so advance payments collected in the current month for future months
 * are included in full in this month's inflow, while earlier months' multi-month advances are not
 * double-counted in later months). Falls back to `c.month` only if `paidDate` is empty/unparseable.
 */
export function getContributionInflowForMonth(
  c: Contribution,
  targetYearMonth: string
): number {
  if (!c) return 0;
  const st = (c.status || '').toLowerCase();
  if (st && st !== 'paid' && st !== 'verified' && st !== 'completed') return 0;

  const paidYm = getDateYearMonth(c.paidDate);
  if (paidYm !== null) {
    return paidYm === targetYearMonth ? (c.amount || 0) : 0;
  }

  const targetIdx = parseYearMonthIndex(targetYearMonth);
  const monthIdx = parseYearMonthIndex(c.month);
  if (targetIdx !== null && monthIdx !== null) {
    return monthIdx === targetIdx ? (c.amount || 0) : 0;
  }

  return (c.month || '').trim() === targetYearMonth ? (c.amount || 0) : 0;
}

/**
 * Returns true if a contribution collected in `targetYearMonth` represents an advance payment
 * (either multi-month e.g. 10 months Rs. 3,000, or paid for a future month such as Dec-2026 during Nov-2026).
 */
export function isAdvanceContributionInMonth(
  c: Contribution,
  targetYearMonth: string,
  monthlyRate = 300
): boolean {
  if (getContributionMonthsCount(c, monthlyRate) > 1) return true;
  const targetIdx = parseYearMonthIndex(targetYearMonth);
  const monthIdx = parseYearMonthIndex(c.month);
  if (targetIdx !== null && monthIdx !== null && monthIdx > targetIdx) {
    return true;
  }
  return false;
}

/**
 * Splits a contribution collected in `targetYearMonth` into:
 * - `regular`: amount for `targetYearMonth` (or non-advance current/due months)
 * - `advance`: amount covering future month(s) strictly after `targetYearMonth`
 */
export function getContributionInflowBreakdownForMonth(
  c: Contribution,
  targetYearMonth: string,
  monthlyRate = 300
): { total: number; regular: number; advance: number } {
  const total = getContributionInflowForMonth(c, targetYearMonth);
  if (total <= 0) return { total: 0, regular: 0, advance: 0 };

  const targetIdx = parseYearMonthIndex(targetYearMonth);
  const startIdx = parseYearMonthIndex(c.month);
  const count = getContributionMonthsCount(c, monthlyRate);

  if (targetIdx !== null && startIdx !== null) {
    if (startIdx > targetIdx) {
      return { total, regular: 0, advance: total };
    }
    if (count > 1) {
      const endIdx = startIdx + count - 1;
      if (endIdx > targetIdx) {
        const nonAdvanceMonths = Math.max(0, Math.min(endIdx, targetIdx) - startIdx + 1);
        const regular = Math.round((total * nonAdvanceMonths) / count);
        const advance = Math.max(0, total - regular);
        return { total, regular, advance };
      }
    }
    return { total, regular: total, advance: 0 };
  }

  if (isAdvanceContributionInMonth(c, targetYearMonth, monthlyRate)) {
    return { total, regular: 0, advance: total };
  }
  return { total, regular: total, advance: 0 };
}

