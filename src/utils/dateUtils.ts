import { ISODateString } from '../types';

/**
 * Regex for standard ISO 8601 validation (full datetime with optional timezone or date-only).
 * Matches formats:
 * - 2026-03-15T14:30:00Z
 * - 2026-03-15T14:30:00.000Z
 * - 2026-03-15T07:30:00+07:00
 * - 2026-03-15
 */
const ISO_8601_REGEX =
  /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Validates if a given value is a syntactically valid and real ISO 8601 date string.
 */
export function isISODateString(value: unknown): value is ISODateString {
  if (typeof value !== 'string') return false;
  if (!ISO_8601_REGEX.test(value)) return false;

  const parsed = new Date(value);
  return !isNaN(parsed.getTime());
}

/**
 * Converts a Date, timestamp number, or date string into a verified ISODateString.
 * If input is invalid or missing, defaults to current ISO timestamp or fallback.
 */
export function toISODateString(
  input?: Date | string | number | null,
  fallbackToNow = true
): ISODateString {
  if (!input) {
    return (fallbackToNow ? new Date().toISOString() : '') as ISODateString;
  }

  if (input instanceof Date) {
    return (isNaN(input.getTime()) ? (fallbackToNow ? new Date().toISOString() : '') : input.toISOString()) as ISODateString;
  }

  const parsed = new Date(input);
  if (isNaN(parsed.getTime())) {
    return (fallbackToNow ? new Date().toISOString() : '') as ISODateString;
  }

  return parsed.toISOString() as ISODateString;
}

/**
 * Formats an ISO 8601 date string into a human-readable display string for frontend presentation.
 * Supports patterns such as:
 * - "DD MMM YYYY, HH:mm" (e.g., "15 Mar 2026, 14:30")
 * - "DD MMMM YYYY" (e.g., "15 Maret 2026")
 * - "YYYY-MM-DD"
 * - "HH:mm:ss"
 */
export function formatISODate(
  isoString?: ISODateString | string | null,
  formatPattern = 'DD MMM YYYY, HH:mm',
  locale = 'id-ID'
): string {
  if (!isoString) return '-';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return String(isoString);

  const pad = (n: number) => String(n).padStart(2, '0');

  const year = date.getFullYear();
  const monthIndex = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Month names based on locale
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short' }).format(date);
  const monthFull = new Intl.DateTimeFormat(locale, { month: 'long' }).format(date);

  const replacements: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MMMM: monthFull,
    MMM: monthShort,
    MM: pad(monthIndex + 1),
    M: String(monthIndex + 1),
    DD: pad(day),
    D: String(day),
    HH: pad(hours),
    H: String(hours),
    mm: pad(minutes),
    m: String(minutes),
    ss: pad(seconds),
    s: String(seconds),
  };

  // Replace tokens in pattern
  return formatPattern.replace(
    /\b(YYYY|YY|MMMM|MMM|MM|M|DD|D|HH|H|mm|m|ss|s)\b/g,
    (match) => replacements[match] ?? match
  );
}

/**
 * Formats an ISO date into relative time (e.g., "2 jam yang lalu", "Kemarin", "5 menit lagi").
 */
export function formatRelativeTime(
  isoString?: ISODateString | string | null,
  locale = 'id'
): string {
  if (!isoString) return '-';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);

  const isIndonesian = locale.startsWith('id');

  if (Math.abs(diffSec) < 60) {
    return isIndonesian ? 'Baru saja' : 'Just now';
  }
  if (Math.abs(diffMin) < 60) {
    return isIndonesian
      ? `${diffMin} menit ${diffMin > 0 ? 'yang lalu' : 'lagi'}`
      : `${Math.abs(diffMin)}m ${diffMin > 0 ? 'ago' : 'from now'}`;
  }
  if (Math.abs(diffHours) < 24) {
    return isIndonesian
      ? `${diffHours} jam ${diffHours > 0 ? 'yang lalu' : 'lagi'}`
      : `${Math.abs(diffHours)}h ${diffHours > 0 ? 'ago' : 'from now'}`;
  }
  if (Math.abs(diffDays) <= 30) {
    return isIndonesian
      ? `${diffDays} hari ${diffDays > 0 ? 'yang lalu' : 'lagi'}`
      : `${Math.abs(diffDays)}d ${diffDays > 0 ? 'ago' : 'from now'}`;
  }

  return formatISODate(isoString, 'DD MMM YYYY', isIndonesian ? 'id-ID' : 'en-US');
}
