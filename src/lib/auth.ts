/**
 * Auth.js (NextAuth v5) configuration.
 *
 * The admin panel never validates passwords itself: the Credentials provider
 * forwards email/password to the Spring API (`POST /api/v1/auth/login`) and, on
 * success, stores the returned JWT access/refresh tokens in the encrypted
 * Auth.js session cookie. Route protection by role and automatic token refresh
 * are added in Phase 3.
 *
 * Exports are consumed by `src/app/api/auth/[...nextauth]/route.ts` and the
 * login/logout server actions in `src/app/(auth)/login/actions.ts`.
 */
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { env } from "@/lib/env";
import type { components } from "@/types/api";

type AuthResponse = components["schemas"]["ApiResponseAuthResponse"];

/** Roles allowed to sign in to the admin panel. */
const ADMIN_ROLES: ReadonlyArray<AuthResponse["data"]["user"]["role"]> = [
  "SUPER_ADMIN",
  "SALON_OWNER",
];

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

/**
 * Calls the Spring API login endpoint.
 * @param input Validated email and password.
 * @returns The auth payload, or `null` when the API rejects the credentials.
 * @throws Error when the API is unreachable or returns an unexpected status.
 */
async function loginWithApi(input: LoginInput): Promise<AuthResponse["data"] | null> {
  const response = await fetch(`${env.apiUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 400) return null;
  if (!response.ok) {
    throw new Error(`Login request failed with status ${response.status}`);
  }

  const body = (await response.json()) as AuthResponse;
  return body.data;
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

        const result = await loginWithApi(parsed.data);
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
        };
      },
    }),
  ],
  callbacks: {
    // Persist API tokens and role in the session JWT on first sign-in.
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    // Expose what client code needs; the refresh token stays server-side only.
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.sub ?? "";
      session.user.role = token.role;
      return session;
    },
  },
});
