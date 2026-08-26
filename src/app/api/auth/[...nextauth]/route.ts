/**
 * Auth.js route handler (sign-in, sign-out, session, CSRF endpoints).
 * All configuration lives in `src/lib/auth.ts`.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
