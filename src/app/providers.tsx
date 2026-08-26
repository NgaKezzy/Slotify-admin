"use client";

/**
 * Client-side providers shared by every page: next-themes (dark/light),
 * next-intl (translations), TanStack Query (server state) and Sonner toasts.
 * Rendered once from `src/app/layout.tsx`.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";

/** How long query data is considered fresh before a background refetch (ms). */
const DEFAULT_STALE_TIME_MS = 30_000;

interface ProvidersProps {
  locale: string;
  messages: AbstractIntlMessages;
  timeZone: string;
  children: ReactNode;
}

export function Providers({ locale, messages, timeZone, children }: ProvidersProps) {
  // Create the client once per browser session (useState keeps it stable across renders).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: DEFAULT_STALE_TIME_MS, retry: 1 } },
      })
  );

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
