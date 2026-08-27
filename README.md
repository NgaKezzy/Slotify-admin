# Slotify Admin Panel

Web admin panel for **Slotify**, the spa & salon booking SaaS. Salon owners manage
bookings, calendar, staff, services, customers, promotions, reviews, payments, reports
and settings; the super admin manages the platform (salon approval, users, categories).

The admin is a pure client of the Spring Boot REST API (`slotify-backend`). It never
stores business data itself: Auth.js keeps the session, every screen talks to
`/api/v1/...`.

## Requirements

- Node.js **24 LTS** or newer
- pnpm **10** or newer (`corepack enable` installs the pinned version automatically)
- A running `slotify-backend` (default `http://localhost:8080`) for real data

## Setup

```bash
cp .env.example .env.local   # then edit the values
pnpm install
pnpm dev                     # http://localhost:3000
```

Demo login (backend `demo` profile): `owner@demo.com / password`.

## Scripts

| Script           | Purpose                                                       |
| ---------------- | ------------------------------------------------------------- |
| `pnpm dev`       | Start the dev server (Turbopack)                              |
| `pnpm build`     | Production build (standalone output, used by the Dockerfile)  |
| `pnpm start`     | Serve the production build                                    |
| `pnpm lint`      | ESLint (Next.js rules + Prettier compatibility)               |
| `pnpm format`    | Format the codebase with Prettier                             |
| `pnpm typecheck` | Generate route types and run `tsc --noEmit`                   |
| `pnpm gen:api`   | Regenerate `src/types/api.d.ts` from the backend OpenAPI spec |

## Environment variables

See [`.env.example`](.env.example) — every variable is documented there.

| Variable              | Used by                                          |
| --------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_URL` | Browser → API requests (`src/lib/api-client.ts`) |
| `API_URL`             | Server → API requests (Auth.js, server actions)  |
| `AUTH_SECRET`         | Auth.js session encryption                       |
| `AUTH_URL`            | Public URL of this admin (Auth.js callbacks)     |
| `NEXT_PUBLIC_WS_URL`  | STOMP WebSocket endpoint (`src/lib/ws.ts`)       |

## Folder structure

```
src/
├── app/
│   ├── (auth)/login/        login page, form and auth server actions
│   ├── (dashboard)/         salon-owner area: layout (sidebar + header) and one folder per module
│   ├── (platform)/platform/ super-admin area
│   ├── api/auth/            Auth.js route handler
│   ├── layout.tsx           root layout (fonts, locale, providers)
│   └── providers.tsx        theme, i18n, TanStack Query, toasts
├── components/
│   ├── layout/              sidebar, header, theme toggle, salon switcher, user menu, page header
│   └── ui/                  shadcn/ui primitives (generated, do not edit by hand)
├── hooks/                   TanStack Query hooks per module (use-bookings.ts, ...)
├── i18n/                    next-intl config (locale cookie, request config, actions)
├── lib/                     api-client.ts, auth.ts, ws.ts, env.ts, utils.ts
├── messages/                en.json, de.json — all UI strings
└── types/                   api.d.ts (generated from OpenAPI), Auth.js type augmentation
```

## Rebranding

All brand colors, the corner radius and booking-status colors are defined once in
`src/app/globals.css` under **"Brand tokens — CHANGE HERE TO REBRAND"**. Dark mode
overrides live right below them. Fonts are configured in `src/app/layout.tsx`.

## Docker

```bash
docker build -t slotify-admin --build-arg NEXT_PUBLIC_API_URL=https://api.example.com .
docker run -p 3000:3000 --env-file .env.local slotify-admin
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the request flow and how to add a module.

# Slotify-admin
