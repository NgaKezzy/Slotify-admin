"use client";

/**
 * Revenue split by payment method (donut chart with a legend list).
 */
import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { EmptyState } from "@/components/common/empty-state";
import { ChartTooltip } from "@/components/reports/chart-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueReport } from "@/hooks/use-reports";
import { formatMoney } from "@/lib/format";

const CHART_HEIGHT = 200;
/** One CSS variable per slice; cycles when there are more methods than colours. */
const SLICE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function PaymentMethodDonut({ report }: { report: RevenueReport }) {
  const t = useTranslations("reports.revenue");
  const tPayments = useTranslations("payments.provider");
  const locale = useLocale();
  const money = (minor: number) => formatMoney(minor, report.currency, locale);
  const rows = report.byPaymentMethod.filter((row) => row.revenueMinor > 0);
  const methodLabel = (method: string) =>
    method === "STRIPE" || method === "PAYPAL" || method === "CASH" ? tPayments(method) : method;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("byMethod")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {rows.length === 0 ? (
          <EmptyState title={t("empty")} compact />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="revenueMinor"
                  nameKey="paymentMethod"
                  innerRadius="60%"
                  outerRadius="90%"
                  paddingAngle={2}
                  stroke="var(--card)"
                >
                  {rows.map((row, index) => (
                    <Cell
                      key={row.paymentMethod}
                      fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip formatValue={(value) => money(value)} formatName={methodLabel} />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <ul className="grid gap-1.5 text-sm">
              {rows.map((row, index) => (
                <li key={row.paymentMethod} className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: SLICE_COLORS[index % SLICE_COLORS.length] }}
                      aria-hidden
                    />
                    {methodLabel(row.paymentMethod)}
                  </span>
                  <span className="tabular-nums">{money(row.revenueMinor)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
