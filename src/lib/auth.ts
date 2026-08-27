/**
 * Auth.js (NextAuth v5) configuration.
 *
 * The admin panel never validates passwords itself: the Credentials provider forwards
 * email/password to the Spring API (`POST /api/v1/auth/login`) and stores the returned
 * JWT access/refresh tokens in the encrypted Auth.js session cookie. Access tokens
 * expire after 15 minutes; the `jwt` callback refreshes them transparently through
 * `POST /api/v1/auth/refresh` (single-use refresh tokens, rotated on every call).
 *
 * Route protection lives in `src/proxy.ts`; only SUPER_ADMIN and SALON_OWNER may sign in.
 */
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { env } from "@/lib/env";
import type { components } from "@/types/api";

type AuthPayload = components["schemas"]["AuthResponse"];
type Envelope<T> = { success: boolean; code: number; message?: string; data?: T };

/** Roles allowed to sign in to the admin panel. */
const ADMIN_ROLES: ReadonlyArray<AuthPayload["user"]["role"]> = ["SUPER_ADMIN", "SALON_OWNER"];

/** Refresh this many milliseconds before the access token actually expires. */
const REFRESH_LEEWAY_MS = 30_000;

/** Validation schema for the login form and the Credentials provider. */
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Thrown when the API rejects the credentials or the user has no admin role. */
class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

async function postAuth<T>(path: string, body: unknown): Promise<T | null> {
  const response = await fetch(`${env.apiUrl}/api/v1/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (response.status === 401 || response.status === 400 || response.status === 403) return null;
  if (!response.ok) throw new Error(`Auth request ${path} failed with status ${response.status}`);
  const envelope = (await response.json()) as Envelope<T>;
  return envelope.data ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  // The admin is self-hosted behind Docker/reverse proxies; AUTH_URL defines the public origin.
  trustHost: true,
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentialsError();

        const result = await postAuth<AuthPayload>("login", parsed.data);
        if (!result || !ADMIN_ROLES.includes(result.user.role)) {
          throw new InvalidCredentialsError();
        }

        return {
          id: String(result.user.id),
          email: result.user.email,
          name: result.user.fullName,
          image: result.user.avatarUrl,
          role: result.user.role,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          accessTokenExpires: Date.now() + result.expiresIn * 1000,
        };
      },
    }),
  ],
  callbacks: {
    /** Stores the API tokens on first sign-in and refreshes them when the access token expires. */
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpires = user.accessTokenExpires;
        token.error = undefined;
        return token;
      }
      if (Date.now() < token.accessTokenExpires - REFRESH_LEEWAY_MS) return token;

      try {
        const refreshed = await postAuth<AuthPayload>("refresh", {
          refreshToken: token.refreshToken,
        });
        if (!refreshed) return { ...token, error: "RefreshFailed" as const };
        return {
          ...token,
          role: refreshed.user.role,
          name: refreshed.user.fullName,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpires: Date.now() + refreshed.expiresIn * 1000,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshFailed" as const };
      }
    },
    /** Exposes what client code needs; the refresh token stays server-side only. */
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      session.user.id = token.sub ?? "";
      session.user.role = token.role;
      return session;
    },
  },
});
