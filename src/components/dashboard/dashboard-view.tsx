"use client";

/**
 * Dashboard home content: period selector, KPI cards, revenue chart, today's
 * bookings and the real-time feed. Wrapped in `RequireSalon` so it only renders
 * for a selected salon.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";

import { RequireSalon } from "@/components/common/no-salon";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { LiveFeed } from "@/components/dashboard/live-feed";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TodayBookings } from "@/components/dashboard/today-bookings";
import { PageHeader } from "@/components/layout/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardReport, useRevenueReport } from "@/hooks/use-reports";
import { useCurrentSalon } from "@/hooks/use-salons";
import { lastDaysRange } from "@/lib/format";

/** Selectable period lengths (days) for the dashboard. */
const PERIOD_OPTIONS = [7, 30, 90] as const;
type PeriodDays = (typeof PERIOD_OPTIONS)[number];
const DEFAULT_PERIOD: PeriodDays = 30;

export function DashboardView() {
  const t = useTranslations("dashboard");
  const [days, setDays] = useState<PeriodDays>(DEFAULT_PERIOD);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v) as PeriodDays)}>
            <SelectTrigger aria-label={t("period.label")} className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {t(`period.days${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <RequireSalon>{(salonId) => <DashboardContent salonId={salonId} days={days} />}</RequireSalon>
    </div>
  );
}

function DashboardContent({ salonId, days }: { salonId: number; days: PeriodDays }) {
  const { timezone, currency } = useCurrentSalon();
  const period = lastDaysRange(days, timezone);
  const dashboard = useDashboardReport(salonId, period);
  const revenue = useRevenueReport(salonId, period, "DAY");

  return (
    <>
      <KpiCards
        current={dashboard.data?.current}
        previous={dashboard.data?.previous}
        currency={dashboard.data?.currency ?? currency}
        isLoading={dashboard.isLoading}
        error={dashboard.error}
      />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart
            report={revenue.data}
            currency={revenue.data?.currency ?? currency}
            isLoading={revenue.isLoading}
          />
        </div>
        <LiveFeed />
      </div>
      <TodayBookings
        bookings={dashboard.data?.todayBookings}
        upcomingCount={dashboard.data?.upcomingCount ?? 0}
        isLoading={dashboard.isLoading}
      />
    </>
  );
}
