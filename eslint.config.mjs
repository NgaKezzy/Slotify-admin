/**
 * ESLint configuration for the Slotify admin panel.
 * Uses the official Next.js rule sets and disables formatting rules that
 * conflict with Prettier (see .prettierrc).
 */
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/types/api.d.ts"]),
]);

export default eslintConfig;
