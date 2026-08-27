"use client";

/**
 * Reports page body: period + granularity controls, revenue chart, payment
 * method donut, top services, bookings-by-status chart, staff performance and exports.
 */
import { CalendarCheck, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Money } from "@/components/common/money";
import {
  PeriodSelector,
  periodForPreset,
  type PeriodPreset,
} from "@/components/common/period-selector";
import { StatCard } from "@/components/common/stat-card";
import { BookingsStatusChart } from "@/components/reports/bookings-status-chart";
import { ExportButtons } from "@/components/reports/export-buttons";
import { PaymentMethodDonut } from "@/components/reports/payment-method-donut";
import { RevenueChart } from "@/components/reports/revenue-chart";
import { StaffPerformanceTable } from "@/components/reports/staff-performance-table";
import { TopServicesTable } from "@/components/reports/top-services-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBookingsReport,
  useRevenueReport,
  useStaffPerformance,
  type ReportGranularity,
  type ReportPeriod,
} from "@/hooks/use-reports";
import { useCurrentSalon } from "@/hooks/use-salons";

const DEFAULT_PRESET: PeriodPreset = "last30";
const DEFAULT_GRANULARITY: ReportGranularity = "DAY";

export function ReportsView({ salonId }: { salonId: number }) {
  const t = useTranslations("reports");
  const { timezone, currency } = useCurrentSalon();
  const [preset, setPreset] = useState<PeriodPreset>(DEFAULT_PRESET);
  const [period, setPeriod] = useState<ReportPeriod>(() =>
    periodForPreset(DEFAULT_PRESET, timezone, { from: "", to: "" })
  );
  const [granularity, setGranularity] = useState<ReportGranularity>(DEFAULT_GRANULARITY);

  const revenue = useRevenueReport(salonId, period, granularity);
  const bookings = useBookingsReport(salonId, period, granularity);
  const staff = useStaffPerformance(salonId, period);

  const completedBookings = bookings.data?.totals.COMPLETED ?? 0;
  const totalBookings = Object.values(bookings.data?.totals ?? {}).reduce((sum, n) => sum + n, 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PeriodSelector
          period={period}
          preset={preset}
          timeZone={timezone}
          onChange={(next, nextPreset) => {
            setPeriod(next);
            setPreset(nextPreset);
          }}
          granularity={granularity}
          onGranularityChange={setGranularity}
        />
        <ExportButtons salonId={salonId} period={period} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label={t("revenue.total")}
          value={
            revenue.data ? (
              <Money minor={revenue.data.totalRevenueMinor} currency={revenue.data.currency} />
            ) : (
              <Skeleton className="h-7 w-24" />
            )
          }
          icon={<Wallet className="size-4" />}
        />
        <StatCard
          label={t("revenue.bookings")}
          value={bookings.data ? completedBookings : <Skeleton className="h-7 w-12" />}
          icon={<CalendarCheck className="size-4" />}
        />
        <StatCard
          label={t("bookingsChart.total")}
          value={bookings.data ? totalBookings : <Skeleton className="h-7 w-12" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {revenue.data ? <RevenueChart report={revenue.data} /> : <Skeleton className="h-80" />}
        </div>
        {revenue.data ? (
          <PaymentMethodDonut report={revenue.data} />
        ) : (
          <Skeleton className="h-80" />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {bookings.data ? (
            <BookingsStatusChart report={bookings.data} />
          ) : (
            <Skeleton className="h-80" />
          )}
        </div>
        {revenue.data ? <TopServicesTable report={revenue.data} /> : <Skeleton className="h-80" />}
      </div>

      <StaffPerformanceTable
        rows={staff.data?.staff}
        currency={staff.data?.currency ?? currency}
        isLoading={staff.isLoading}
      />
    </div>
  );
}
