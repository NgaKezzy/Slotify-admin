/**
 * Typed access to environment variables (see `.env.example`).
 * Public variables are inlined at build time; server-only ones are read at runtime.
 */

/** Default API base URL used when no environment variable is set (local dev). */
const DEFAULT_API_URL = "http://localhost:8080";
const DEFAULT_WS_URL = "ws://localhost:8080/ws";

export const env = {
  /** API base URL for browser requests. */
  publicApiUrl: process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  /** API base URL for server-side requests (Auth.js, server actions). */
  apiUrl: process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL,
  /** STOMP WebSocket endpoint. */
  publicWsUrl: process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS_URL,
} as const;
