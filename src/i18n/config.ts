/**
 * Locale configuration shared by server and client code.
 * The admin panel does not use URL locale prefixes; the active locale is stored
 * in a cookie (see `src/i18n/request.ts`).
 */
export const LOCALES = ["en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/**
 * Time zone used for date/time formatting until the salon's own time zone is
 * loaded from its settings (Phase 3). Keeping it explicit avoids server/client
 * hydration mismatches.
 */
export const DEFAULT_TIME_ZONE = "UTC";

/** Name of the cookie that stores the user's preferred locale. */
export const LOCALE_COOKIE = "slotify-locale";

/**
 * Narrows an arbitrary string to a supported locale.
 * @param value Candidate locale (e.g. from a cookie).
 * @returns The value if supported, otherwise the default locale.
 */
export function toLocale(value: string | undefined): Locale {
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}
