/**
 * Typed HTTP client for the Spring Boot REST API, built on openapi-fetch and the
 * generated `paths` from `src/types/api.d.ts` (run `pnpm gen:api`).
 *
 * - Attaches `Authorization: Bearer <token>` from the Auth.js session (client side).
 * - Sends the UI locale as `Accept-Language` so error messages come back localised.
 * - Converts failed responses into `ApiError` (see `src/lib/api-error.ts`) and signs
 *   the user out when the session is no longer valid.
 *
 * Use `unwrap()` inside query/mutation functions:
 * `const page = unwrap(await api.GET("/api/v1/admin/salons/{salonId}/bookings", {...}))`.
 */
import createClient, { type Middleware } from "openapi-fetch";
import { getSession, signOut } from "next-auth/react";

import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";
import type { paths } from "@/types/api";

/** Cookie set by the language switcher; mirrored into Accept-Language. */
const LOCALE_COOKIE = "NEXT_LOCALE";

let cachedToken: string | null = null;
let cachedTokenExpiresAt = 0;
/** How long a fetched session token is reused before asking Auth.js again (ms). */
const TOKEN_CACHE_MS = 60_000;

/**
 * Returns the current access token from the Auth.js session (browser only).
 * Cached for a minute to avoid a `/api/auth/session` round trip per request.
 * @returns The bearer token, or `null` when the user is not signed in.
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiresAt) return cachedToken;
  const session = await getSession();
  if (session?.error) {
    await signOut({ callbackUrl: "/login" });
    return null;
  }
  cachedToken = session?.accessToken ?? null;
  cachedTokenExpiresAt = now + TOKEN_CACHE_MS;
  return cachedToken;
}

/** Forgets the cached token (call after sign-out or a 401). */
export function clearTokenCache(): void {
  cachedToken = null;
  cachedTokenExpiresAt = 0;
}

function currentLocale(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  return match?.[1] ?? "en";
}

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) request.headers.set("Authorization", `Bearer ${token}`);
    request.headers.set("Accept-Language", currentLocale());
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      clearTokenCache();
      // Auth.js refreshes tokens server-side; a 401 here means the refresh failed too.
      await signOut({ callbackUrl: "/login" });
    }
    return response;
  },
};

/** Shared, fully typed API client. Example: `api.GET("/api/v1/admin/salons", {})`. */
export const api = createClient<paths>({ baseUrl: env.publicApiUrl });
api.use(authMiddleware);

/**
 * Extracts the envelope `data` of a successful call or throws an `ApiError`.
 * @param result Result of an `api.GET/POST/...` call.
 */
export function unwrap<T>(result: { data?: { data?: T }; error?: unknown; response: Response }): T {
  const { data, error, response } = result;
  if (error !== undefined || !data) throw ApiError.fromResponse(error, response);
  return data.data as T;
}
