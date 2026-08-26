"use server";

/**
 * Server actions related to localisation.
 * Used by the language switcher in the header.
 */
import { cookies } from "next/headers";

import { LOCALE_COOKIE, toLocale } from "./config";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Persists the user's preferred locale in a cookie.
 * next-intl re-renders server components with the new locale automatically.
 * @param locale Locale code selected by the user.
 */
export async function setLocale(locale: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, toLocale(locale), {
    path: "/",
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: "lax",
  });
}
