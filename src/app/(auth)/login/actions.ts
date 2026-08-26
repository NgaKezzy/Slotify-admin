"use server";

/**
 * Server actions for authentication, used by the login form and the user menu.
 * Delegates to Auth.js (`src/lib/auth.ts`), which calls the Spring API.
 */
import { AuthError } from "next-auth";

import { loginSchema, signIn, signOut } from "@/lib/auth";

/** Result returned to the login form; `error` is a translation key under `auth.login.errors`. */
export interface LoginActionResult {
  error?: "invalidCredentials" | "unavailable";
}

/** Route users land on after a successful sign-in. */
const AFTER_LOGIN_PATH = "/";

/**
 * Signs the user in with email/password.
 * @param input Raw form values (validated again here; never trust the client).
 * @returns An error key when sign-in fails; redirects on success.
 */
export async function loginAction(input: unknown): Promise<LoginActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: "invalidCredentials" };

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: AFTER_LOGIN_PATH });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.type === "CredentialsSignin" ? "invalidCredentials" : "unavailable" };
    }
    // Auth.js implements redirects by throwing; let Next.js handle it.
    throw error;
  }
}

/** Signs the current user out and redirects to the login page. */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
