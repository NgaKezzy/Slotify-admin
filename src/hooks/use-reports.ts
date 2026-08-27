/**
 * Report queries used by the dashboard: KPI summary versus the previous period
 * and the revenue time series. Keyed under `reports` so dashboard WebSocket
 * events (`/topic/salon/{id}/dashboard`) refresh them.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type DashboardReport = components["schemas"]["DashboardResponse"];
export type DashboardKpis = components["schemas"]["Kpis"];
export type TodayBooking = components["schemas"]["TodayBooking"];
export type RevenueReport = components["schemas"]["RevenueReportResponse"];
export type RevenueGranularity = RevenueReport["granularity"];

/** Date range in `YYYY-MM-DD` (salon timezone), both ends inclusive. */
export interface ReportPeriod {
  from: string;
  to: string;
}

export const reportKeys = {
  all: (salonId: number) => ["reports", salonId] as const,
  dashboard: (salonId: number, period: ReportPeriod) =>
    [...reportKeys.all(salonId), "dashboard", period] as const,
  revenue: (salonId: number, period: ReportPeriod, granularity: RevenueGranularity) =>
    [...reportKeys.all(salonId), "revenue", period, granularity] as const,
};

/**
 * Loads dashboard KPIs (current vs previous period), today's agenda and the upcoming count.
 * @param salonId Salon to report on.
 * @param period Current period; the API derives the previous one of equal length.
 */
export function useDashboardReport(salonId: number, period: ReportPeriod) {
  return useQuery({
    queryKey: reportKeys.dashboard(salonId, period),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/reports/dashboard", {
          params: { path: { salonId }, query: period },
        })
      ),
    placeholderData: (previous) => previous,
  });
}

/**
 * Loads the revenue series for a period.
 * @param salonId Salon to report on.
 * @param period Date range.
 * @param granularity Bucket size of the series.
 */
export function useRevenueReport(
  salonId: number,
  period: ReportPeriod,
  granularity: RevenueGranularity = "DAY"
) {
  return useQuery({
    queryKey: reportKeys.revenue(salonId, period, granularity),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/reports/revenue", {
          params: { path: { salonId }, query: { ...period, granularity } },
        })
      ),
    placeholderData: (previous) => previous,
  });
}
