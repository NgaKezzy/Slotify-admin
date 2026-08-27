/**
 * Module augmentation for Auth.js (next-auth + @auth/core): adds the Spring JWT tokens,
 * their expiry and the user role to the session and JWT types.
 * Consumed by `src/lib/auth.ts`, `src/proxy.ts` and any code reading `auth()` / `useSession()`.
 */
import type { DefaultSession } from "next-auth";

import type { components } from "./api";

type UserRole = components["schemas"]["UserResponse"]["role"];

/** Set on the session when the silent token refresh failed; the client must sign out. */
type SessionError = "RefreshFailed" | undefined;

declare module "next-auth" {
  interface Session {
    accessToken: string;
    error?: SessionError;
    user: DefaultSession["user"] & { id: string; role: UserRole };
  }

  interface User {
    role: UserRole;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: number;
    error?: SessionError;
  }
}
