"use client";

/**
 * Renders a minor-unit amount in the current salon currency and UI locale.
 * Prefer this over calling `formatMoney` in JSX so currency handling stays in one place.
 */
import { useLocale } from "next-intl";

import { useCurrentSalon } from "@/hooks/use-salons";
import { formatMoney } from "@/lib/format";

interface MoneyProps {
  minor: number;
  /** Override when the row carries its own currency (e.g. platform payouts). */
  currency?: string;
  className?: string;
}

export function Money({ minor, currency, className }: MoneyProps) {
  const locale = useLocale();
  const salon = useCurrentSalon();
  return (
    <span className={className}>{formatMoney(minor, currency ?? salon.currency, locale)}</span>
  );
}
