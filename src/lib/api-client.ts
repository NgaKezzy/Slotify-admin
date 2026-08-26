/**
 * Typed HTTP client for the Spring Boot REST API, built on openapi-fetch and the
 * generated `paths` from `src/types/api.d.ts` (run `pnpm gen:api`).
 *
 * Used by the query hooks in `src/hooks/*`. A middleware attaches the bearer
 * token to every request; the token source is stubbed until Auth.js sessions are
 * wired into the client in Phase 3.
 */
import createClient, { type Middleware } from "openapi-fetch";

import { env } from "@/lib/env";
import type { paths } from "@/types/api";

/**
 * Returns the current access token for outgoing API requests.
 * Phase 0 stub: no session is available yet, so requests go out unauthenticated.
 * Phase 3 will read the token from the Auth.js session (`useSession` / `auth()`).
 * @returns The bearer token, or `null` when the user is not authenticated.
 */
export async function getAccessToken(): Promise<string | null> {
  return null;
}

/** Adds `Authorization: Bearer <token>` when a token is available. */
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
};

/** Shared, fully typed API client. Example: `api.GET("/api/v1/admin/salons/{salonId}/bookings", {...})`. */
export const api = createClient<paths>({ baseUrl: env.publicApiUrl });

api.use(authMiddleware);
