/**
 * next-intl request configuration (registered in next.config.ts).
 * Resolves the locale from the locale cookie and loads the matching message
 * bundle from `src/messages`. No URL locale prefix is used.
 */
import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_TIME_ZONE, LOCALE_COOKIE, toLocale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = toLocale(cookieStore.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    timeZone: DEFAULT_TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
