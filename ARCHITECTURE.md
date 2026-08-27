# Architecture — Slotify Admin Panel

## Stack

Next.js 16 (App Router, React 19, Turbopack) · TypeScript strict · Tailwind CSS 4 +
shadcn/ui (Base UI) · TanStack Query + TanStack Table · Auth.js v5 · react-hook-form +
zod · next-intl · Recharts · @stomp/stompjs · openapi-typescript + openapi-fetch · Zustand.

## Folder layout

```
src/app            routes only (thin: fetch translations, compose components)
  (auth)           unauthenticated pages (login)
  (dashboard)      salon-owner area, shares layout.tsx (sidebar + header)
  (platform)       super-admin area, same chrome, role-guarded in Phase 3
  api/auth         Auth.js route handler
src/components/ui  shadcn primitives — regenerate with `pnpm dlx shadcn@latest add <name>`
src/components/*   app components (layout/, later charts/, forms/, data-table/)
src/hooks          one file per module exposing query keys + hooks (`use-bookings.ts`)
src/lib            infrastructure: API client, Auth.js config, WebSocket, env, utils
src/i18n           locale config, next-intl request config, locale cookie action
src/messages       translation bundles; every UI string lives here
src/types          generated OpenAPI types + Auth.js type augmentation
```

## Request flow

```
Browser ──(form)──▶ loginAction (server action)
                        │  signIn("credentials")
                        ▼
                   Auth.js (src/lib/auth.ts)
                        │  POST ${API_URL}/api/v1/auth/login
                        ▼
                   Spring Boot API ── returns { accessToken, refreshToken, user }
                        │
                        ▼
        Encrypted session cookie (JWT strategy) holds tokens + role

Browser ──▶ TanStack Query hook ──▶ `api` (openapi-fetch, src/lib/api-client.ts)
                                         │  Authorization: Bearer <accessToken>
                                         ▼
                                    Spring Boot API /api/v1/...
```

- Auth.js never validates passwords; the Spring API is the source of truth.
- `getAccessToken()` in `api-client.ts` is stubbed in Phase 0 and will read the
  session in Phase 3 (plus refresh-token rotation in the `jwt` callback).
- Real-time: `createStompClient()` (`src/lib/ws.ts`) subscribes to
  `/topic/salon/{id}/dashboard` and invalidates query keys on events.
- Locale: no URL prefix; `src/i18n/request.ts` reads the `slotify-locale` cookie.
- Theme: `next-themes` toggles the `.dark` class; tokens in `globals.css`.

## Theming

- **Three states**: the header toggle (`src/components/layout/theme-toggle.tsx`) offers
  Light / Dark / System via `next-themes`, which stores the choice in `localStorage`
  and sets the `.dark` class on `<html>` before hydration (`suppressHydrationWarning`
  in `src/app/layout.tsx`), so there is no flash on load.
- **Tokens** live in `src/app/globals.css`. The "Brand tokens" block defines the
  primary/secondary colours, radius and the booking-status palette; the `.dark`
  block right below overrides them. Semantic shadcn tokens (`--background`,
  `--card`, `--chart-1..5`, ...) are derived from the brand tokens, so a rebrand
  only touches that first block.
- **Status colours** are used as badge text on a 15% tint of themselves and as
  chart fills. Light values are dark enough for >= 4.5:1 contrast on white; dark
  values are lifted for the same contrast on dark cards. Reuse them through
  `text-status-*` / `bg-status-*` utilities and never hard-code hex values.
- **Charts** (Recharts) read colours as CSS variables — `fill="var(--chart-1)"`,
  `var(--status-completed)`, `var(--border)` for grid lines — and use the custom
  `ChartTooltip` (`src/components/reports/chart-tooltip.tsx`) so tooltips follow
  the theme too.
- **Data-driven colours** (customer tags carry their own hex colour) are applied
  through a CSS custom property (`--tag-color`) as a tint behind the theme
  foreground text, which keeps them readable in both modes.
- **Native controls** (`<input type="date">`, `<input type="color">`) pick up the
  theme through `color-scheme` set on `html` / `html.dark`.

## Adding a new page / module

1. **Route**: create `src/app/(dashboard)/<module>/page.tsx`. Export `generateMetadata`
   (title from messages) and a server component that composes UI components.
2. **Strings**: add `modules.<module>` and any labels to `src/messages/en.json` and
   `de.json` (same keys). Never hard-code text in components.
3. **Navigation**: add an entry to `NAV_GROUPS` in `src/components/layout/nav-config.ts`
   and the label under `nav.<module>` in the messages.
4. **Data**: create `src/hooks/use-<module>.ts` with a `<module>Keys` object and
   query/mutation hooks wrapping `api` from `src/lib/api-client.ts`. Run `pnpm gen:api`
   first so the endpoint types exist.
5. **UI**: put module components in `src/components/<module>/`; reuse the shared
   data-table, forms and dialogs. Show results with `toast` from `sonner`.
6. Run `pnpm lint && pnpm typecheck && pnpm build`.

## Pinned versions

Resolved with `pnpm outdated` on 2026-08-26 (Phase 0). Source of truth: `package.json`.

| Package                             | Version       |
| ----------------------------------- | ------------- |
| `@auth/core`                        | 0.41.3        |
| `@base-ui/react`                    | ^1.7.0        |
| `@hookform/resolvers`               | ^5.9.1        |
| `@stomp/stompjs`                    | ^7.3.0        |
| `@tailwindcss/postcss (dev)`        | ^4            |
| `@tanstack/react-query`             | 5.102.4       |
| `@tanstack/react-table`             | ^9.1.2        |
| `@types/node (dev)`                 | ^26.3.0       |
| `@types/react (dev)`                | ^19           |
| `@types/react-dom (dev)`            | ^19           |
| `class-variance-authority`          | ^0.7.1        |
| `clsx`                              | ^2.1.1        |
| `eslint (dev)`                      | ^9            |
| `eslint-config-next (dev)`          | 16.3.3        |
| `eslint-config-prettier (dev)`      | ^10.1.8       |
| `lucide-react`                      | ^1.34.0       |
| `next`                              | 16.3.3        |
| `next-auth`                         | 5.0.0-beta.32 |
| `next-intl`                         | ^4.13.7       |
| `next-themes`                       | ^0.4.6        |
| `openapi-fetch`                     | ^0.17.0       |
| `openapi-typescript (dev)`          | ^7.13.0       |
| `prettier (dev)`                    | ^3.9.6        |
| `prettier-plugin-tailwindcss (dev)` | ^0.8.1        |
| `react`                             | 19.2.8        |
| `react-dom`                         | 19.2.8        |
| `react-hook-form`                   | ^7.86.0       |
| `recharts`                          | ^3.10.1       |
| `shadcn`                            | ^4.19.0       |
| `sonner`                            | ^2.0.8        |
| `tailwind-merge`                    | ^3.6.0        |
| `tailwindcss (dev)`                 | ^4            |
| `tw-animate-css`                    | ^1.4.0        |
| `typescript (dev)`                  | ^5            |
| `zod`                               | ^4.4.3        |
| `zustand`                           | ^5.0.15       |

Notes:

- `@tanstack/react-query` is pinned to 5.102.4 because 5.102.5 referenced an
  unpublished `@tanstack/query-core` on the registry at scaffold time.
- `eslint` stays on 9.x (required by `eslint-config-next`) and `typescript` on 5.x
  (Next.js 16 does not support TypeScript 7 yet).
- `@auth/core` is listed explicitly so the JWT type augmentation in
  `src/types/next-auth.d.ts` resolves.
