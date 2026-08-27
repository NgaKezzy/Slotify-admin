/**
 * Next.js configuration for the Slotify admin panel.
 * - `output: "standalone"` produces a self-contained server bundle used by the Dockerfile.
 * - The next-intl plugin wires up `src/i18n/request.ts` for server-side translations.
 */
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // output: "standalone" is only needed for Docker; Vercel handles deployment natively.
  typedRoutes: true,
  // Do not generate AGENTS.md / CLAUDE.md files in the repo.
  agentRules: false,
};

export default withNextIntl(nextConfig);
