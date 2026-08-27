/**
 * Route protection (Next.js 16 "proxy", formerly middleware).
 *
 * - Anonymous users are redirected to `/login` (with `callbackUrl`).
 * - Signed-in users hitting `/login` go to the dashboard.
 * - `/platform/**` is reserved for SUPER_ADMIN; owners are sent back to `/`.
 * Static assets and the Auth.js API routes are excluded by the matcher.
 */
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

const LOGIN_PATH = "/login";
const PLATFORM_PREFIX = "/platform";

export const proxy = auth((request) => {
  const { nextUrl } = request;
  const session = request.auth;
  const isLoginPage = nextUrl.pathname === LOGIN_PATH;

  if (!session || session.error) {
    if (isLoginPage) return NextResponse.next();
    const loginUrl = new URL(LOGIN_PATH, nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage) return NextResponse.redirect(new URL("/", nextUrl));

  if (nextUrl.pathname.startsWith(PLATFORM_PREFIX) && session.user.role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico)).*)"],
};
