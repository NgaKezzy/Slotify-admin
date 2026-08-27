"use client";

/**
 * Revenue area chart for the dashboard (Recharts). Single series, so no legend;
 * a crosshair tooltip shows revenue and bookings per day. Colours come from the
 * `--chart-1` / semantic CSS variables so the chart follows the theme.
 */
import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { RevenueReport } from "@/hooks/use-reports";
import { formatMoney } from "@/lib/format";

interface RevenueChartProps {
  report: RevenueReport | undefined;
  currency: string;
  isLoading: boolean;
}

interface ChartPoint {
  date: string;
  revenue: number;
  bookings: number;
}

/** Chart height in pixels. */
const CHART_HEIGHT = 260;

export function RevenueChart({ report, currency, isLoading }: RevenueChartProps) {
  const t = useTranslations("dashboard.revenueChart");
  const locale = useLocale();

  const data: ChartPoint[] =
    report?.series.map((point) => ({
      date: point.periodStart,
      revenue: point.revenueMinor / 100,
      bookings: point.bookings,
    })) ?? [];
  const hasRevenue = data.some((point) => point.revenue > 0);

  const dayLabel = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(new Date(iso));
  const moneyLabel = (value: number) => formatMoney(Math.round(value * 100), currency, locale);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("description")}
          {report ? (
            <span className="ml-2 font-medium text-foreground">
              {t("total")}: {formatMoney(report.totalRevenueMinor, currency, locale)}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton style={{ height: CHART_HEIGHT }} className="w-full" />
        ) : !hasRevenue ? (
          <EmptyState title={t("empty")} compact />
        ) : (
          <div style={{ height: CHART_HEIGHT }} role="img" aria-label={t("title")}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={dayLabel}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={24}
                />
                <YAxis
                  tickFormatter={(value: number) => moneyLabel(value)}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={72}
                />
                <Tooltip
                  cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                  labelFormatter={(label) => dayLabel(String(label))}
                  formatter={(value, name) =>
                    name === "revenue"
                      ? [moneyLabel(Number(value)), t("revenue")]
                      : [String(value), t("bookings")]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  fill="url(#revenue-fill)"
                  activeDot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--card)" }}
                />
                <Area dataKey="bookings" stroke="none" fill="none" activeDot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
