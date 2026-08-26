/**
 * Module augmentation for Auth.js (next-auth + @auth/core): adds the Spring JWT tokens and user role to
 * the session and JWT types. Consumed by `src/lib/auth.ts` and any code reading `auth()`.
 */
import type { DefaultSession } from "next-auth";

import type { components } from "./api";

type UserRole = components["schemas"]["UserSummary"]["role"];

declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: DefaultSession["user"] & { id: string; role: UserRole };
  }

  interface User {
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role: UserRole;
    accessToken: string;
    refreshToken: string;
  }
}
