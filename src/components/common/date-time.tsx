"use client";

/**
 * Renders an ISO instant in the selected salon's timezone (date, time or both).
 */
import { useLocale } from "next-intl";

import { useCurrentSalon } from "@/hooks/use-salons";
import { formatDate, formatDateTime, formatTime } from "@/lib/format";

interface DateTimeProps {
  iso: string;
  mode?: "date" | "time" | "datetime";
  className?: string;
}

export function DateTime({ iso, mode = "datetime", className }: DateTimeProps) {
  const locale = useLocale();
  const { timezone } = useCurrentSalon();
  const text =
    mode === "date"
      ? formatDate(iso, timezone, locale)
      : mode === "time"
        ? formatTime(iso, timezone, locale)
        : formatDateTime(iso, timezone, locale);
  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}
