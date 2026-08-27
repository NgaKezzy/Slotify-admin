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
