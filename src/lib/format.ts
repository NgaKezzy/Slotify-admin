/**
 * Formatting helpers shared by every module. All money comes from the API in
 * minor units (cents) with an ISO currency; all timestamps are UTC ISO strings
 * rendered in the salon's timezone.
 */

/**
 * Formats a minor-unit amount as localised currency ("45,00 €").
 * @param minor Amount in minor units.
 * @param currency ISO-4217 code.
 * @param locale BCP-47 locale (defaults to the browser locale).
 */
export function formatMoney(minor: number, currency: string, locale?: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(minor / 100);
}

/** Formats an ISO instant as date + time in the given timezone. */
export function formatDateTime(iso: string, timeZone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(iso));
}

/** Formats an ISO instant as a short date in the given timezone. */
export function formatDate(iso: string, timeZone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone }).format(new Date(iso));
}

/** Formats an ISO instant as time only ("14:30") in the given timezone. */
export function formatTime(iso: string, timeZone: string, locale?: string): string {
  return new Intl.DateTimeFormat(locale, { timeStyle: "short", timeZone }).format(new Date(iso));
}

/** Formats minutes as "1h 30m" / "45m". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Converts a Date to the `YYYY-MM-DD` string the API expects for date query params. */
export function toIsoDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Percentage with one decimal ("12.5%"). */
export function formatPercent(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }).format(
    value / 100
  );
}

/** Milliseconds in one day, used for date arithmetic on period selectors. */
export const DAY_MS = 86_400_000;

/**
 * Builds an inclusive `YYYY-MM-DD` range ending today (salon timezone) and
 * spanning `days` days, e.g. `{ from: "2026-08-21", to: "2026-08-27" }` for 7 days.
 * @param days Number of days including today.
 * @param timeZone Salon timezone.
 */
export function lastDaysRange(days: number, timeZone: string): { from: string; to: string } {
  const now = new Date();
  return {
    from: toIsoDate(new Date(now.getTime() - (days - 1) * DAY_MS), timeZone),
    to: toIsoDate(now, timeZone),
  };
}

/**
 * Relative change between two values in percent, or `null` when the previous
 * value is zero (no meaningful comparison).
 * @param current Current period value.
 * @param previous Previous period value.
 */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** Offset of `timeZone` from UTC at the given instant, in minutes. */
function timeZoneOffsetMinutes(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(at);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const wallClockAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );
  return (wallClockAsUtc - at.getTime()) / 60_000;
}

/**
 * ISO instant of local midnight on a `YYYY-MM-DD` date in the given timezone.
 * Used to turn date filters into the date-time range the API expects.
 * @param date Calendar date in the salon timezone.
 * @param timeZone IANA timezone.
 */
export function startOfDayInZone(date: string, timeZone: string): string {
  const guess = new Date(`${date}T00:00:00Z`);
  return new Date(guess.getTime() - timeZoneOffsetMinutes(guess, timeZone) * 60_000).toISOString();
}

/** ISO instant of the last millisecond of a `YYYY-MM-DD` date in the given timezone. */
export function endOfDayInZone(date: string, timeZone: string): string {
  const start = new Date(startOfDayInZone(date, timeZone)).getTime();
  return new Date(start + DAY_MS - 1).toISOString();
}
