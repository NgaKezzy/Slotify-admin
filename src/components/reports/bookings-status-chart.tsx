"use client";

/**
 * Bookings per period as stacked bars, one segment per booking status, using
 * the shared `--status-*` colour tokens (same palette as the status badges).
 */
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { ChartTooltip } from "@/components/reports/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BookingStatusKey, BookingsReport } from "@/hooks/use-reports";

const CHART_HEIGHT = 260;

/** Display order of the stacked segments and their colour token. */
const STATUS_SERIES: { status: BookingStatusKey; color: string }[] = [
  { status: "COMPLETED", color: "var(--status-completed)" },
  { status: "CONFIRMED", color: "var(--status-confirmed)" },
  { status: "IN_PROGRESS", color: "var(--status-confirmed)" },
  { status: "PENDING", color: "var(--status-pending)" },
  { status: "NO_SHOW", color: "var(--status-no-show)" },
  { status: "CANCELLED", color: "var(--status-cancelled)" },
  { status: "REJECTED", color: "var(--status-rejected)" },
];

export function BookingsStatusChart({ report }: { report: BookingsReport }) {
  const t = useTranslations("reports.bookingsChart");
  const tStatus = useTranslations("status.booking");
  const locale = useLocale();
  const hasData = report.series.some((point) => point.total > 0);
  const dateLabel = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
  const rows = report.series.map((point) => ({ periodStart: point.periodStart, ...point.counts }));
  const statusLabel = (key: string) => tStatus(key as BookingStatusKey);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={rows} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="periodStart"
                tickFormatter={dateLabel}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                width={32}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                content={<ChartTooltip formatName={statusLabel} />}
                labelFormatter={(label) => dateLabel(String(label))}
              />
              <Legend formatter={statusLabel} wrapperStyle={{ fontSize: 12 }} />
              {STATUS_SERIES.map(({ status, color }) => (
                <Bar key={status} dataKey={status} name={status} stackId="bookings" fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title={t("empty")} compact />
        )}
      </CardContent>
    </Card>
  );
}
