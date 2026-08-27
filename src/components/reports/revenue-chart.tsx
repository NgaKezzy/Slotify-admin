"use client";

/**
 * Revenue over time (bar chart). Colours come from the `--chart-*` CSS
 * variables so the chart follows the active theme automatically.
 */
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { ChartTooltip } from "@/components/reports/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueReport } from "@/hooks/use-reports";
import { formatMoney } from "@/lib/format";

const CHART_HEIGHT = 260;

export function RevenueChart({ report }: { report: RevenueReport }) {
  const t = useTranslations("reports.revenue");
  const locale = useLocale();
  const money = (minor: number) => formatMoney(minor, report.currency, locale);
  const hasData = report.series.some((point) => point.revenueMinor > 0);
  const dateLabel = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart data={report.series} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" />
              <XAxis
                dataKey="periodStart"
                tickFormatter={dateLabel}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value: number) => money(value)}
                tickLine={false}
                axisLine={false}
                width={80}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)" }}
                content={
                  <ChartTooltip
                    formatValue={(value) => money(value)}
                    formatName={() => t("revenue")}
                  />
                }
                labelFormatter={(label) => dateLabel(String(label))}
              />
              <Bar
                dataKey="revenueMinor"
                name="revenue"
                fill="var(--chart-1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState title={t("empty")} compact />
        )}
      </CardContent>
    </Card>
  );
}
