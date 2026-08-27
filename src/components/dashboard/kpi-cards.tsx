"use client";

/**
 * KPI stat tiles for the dashboard: each shows the current-period value and the
 * change versus the previous period. Money KPIs are formatted in the salon currency.
 */
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardKpis } from "@/hooks/use-reports";
import { toApiError } from "@/lib/api-error";
import { formatMoney, formatPercent, percentChange } from "@/lib/format";
import { cn } from "@/lib/utils";

type KpiKey = keyof DashboardKpis;

interface KpiDefinition {
  key: KpiKey;
  labelKey: string;
  kind: "money" | "count" | "percent";
  /** When true a decrease is good (cancellations, no-shows). */
  lowerIsBetter?: boolean;
}

const KPI_DEFINITIONS: KpiDefinition[] = [
  { key: "revenueMinor", labelKey: "revenue", kind: "money" },
  { key: "bookingsCount", labelKey: "bookings", kind: "count" },
  { key: "completedCount", labelKey: "completed", kind: "count" },
  { key: "cancelledCount", labelKey: "cancelled", kind: "count", lowerIsBetter: true },
  { key: "noShowCount", labelKey: "noShow", kind: "count", lowerIsBetter: true },
  { key: "newCustomers", labelKey: "newCustomers", kind: "count" },
  { key: "averageTicketMinor", labelKey: "averageTicket", kind: "money" },
  { key: "occupancyPercent", labelKey: "occupancy", kind: "percent" },
];

interface KpiCardsProps {
  current?: DashboardKpis;
  previous?: DashboardKpis;
  currency: string;
  isLoading: boolean;
  error: unknown;
}

export function KpiCards({ current, previous, currency, isLoading, error }: KpiCardsProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();

  const formatValue = (definition: KpiDefinition, value: number) => {
    if (definition.kind === "money") return formatMoney(value, currency, locale);
    if (definition.kind === "percent") return formatPercent(value, locale);
    return new Intl.NumberFormat(locale).format(value);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {KPI_DEFINITIONS.map((definition) => {
        const value = current?.[definition.key];
        const delta =
          current && previous
            ? percentChange(current[definition.key], previous[definition.key])
            : null;
        return (
          <Card key={definition.key}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(`kpi.${definition.labelKey}`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-1">
              {isLoading || value === undefined ? (
                <>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold tabular-nums">
                    {formatValue(definition, value)}
                  </p>
                  <DeltaLine delta={delta} lowerIsBetter={definition.lowerIsBetter} />
                </>
              )}
              {error ? (
                <p className="text-xs text-destructive">{toApiError(error).message}</p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function DeltaLine({ delta, lowerIsBetter }: { delta: number | null; lowerIsBetter?: boolean }) {
  const t = useTranslations("dashboard.kpi");
  const locale = useLocale();
  if (delta === null) {
    return <p className="text-xs text-muted-foreground">{t("noPrevious")}</p>;
  }
  const isFlat = Math.abs(delta) < 0.05;
  const isGood = lowerIsBetter ? delta < 0 : delta > 0;
  const Icon = isFlat ? Minus : delta > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <p className="flex items-center gap-1 text-xs text-muted-foreground">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium",
          !isFlat && (isGood ? "text-success" : "text-destructive")
        )}
      >
        <Icon className="size-3.5" aria-hidden />
        {formatPercent(delta, locale)}
      </span>
      {t("vsPrevious")}
    </p>
  );
}
