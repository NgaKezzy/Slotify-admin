/**
 * TanStack Query hooks for the reports module (revenue, bookings by status,
 * staff performance). Exports go through `downloadReport` in `src/lib/download.ts`.
 *
 * The OpenAPI generator names nested DTOs by their Java simple name, so the
 * bookings-report `Point` collides with the revenue `Point`. `BookingsPoint`
 * below is the real shape the API returns and the hook casts to it.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type ReportGranularity = "DAY" | "WEEK" | "MONTH";
export type RevenueReport = components["schemas"]["RevenueReportResponse"];
export type StaffPerformanceRow = components["schemas"]["Row"];
export type BookingStatusKey = components["schemas"]["BookingResponse"]["status"];

/** One bucket of the bookings report: total plus a count per booking status. */
export interface BookingsPoint {
  periodStart: string;
  total: number;
  counts: Record<BookingStatusKey, number>;
}

/** Bookings report with the real `series` shape (see file comment). */
export type BookingsReport = Omit<components["schemas"]["BookingsReportResponse"], "series"> & {
  series: BookingsPoint[];
};

/** Common date-range parameters (`YYYY-MM-DD`, salon timezone). */
export interface ReportPeriod {
  from: string;
  to: string;
}

/** Query keys for reports; the realtime bridge invalidates the `"reports"` prefix. */
export const reportKeys = {
  all: (salonId: number) => ["reports", salonId] as const,
  revenue: (salonId: number, period: ReportPeriod, granularity: ReportGranularity) =>
    [...reportKeys.all(salonId), "revenue", period, granularity] as const,
  bookings: (salonId: number, period: ReportPeriod, granularity: ReportGranularity) =>
    [...reportKeys.all(salonId), "bookings", period, granularity] as const,
  staff: (salonId: number, period: ReportPeriod) =>
    [...reportKeys.all(salonId), "staff", period] as const,
};

/** Revenue series, split by payment method and top services for the period. */
export function useRevenueReport(
  salonId: number,
  period: ReportPeriod,
  granularity: ReportGranularity
) {
  return useQuery({
    queryKey: reportKeys.revenue(salonId, period, granularity),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/reports/revenue", {
          params: { path: { salonId }, query: { ...period, granularity } },
        })
      ),
  });
}

/** Bookings per period bucketed by status. */
export function useBookingsReport(
  salonId: number,
  period: ReportPeriod,
  granularity: ReportGranularity
) {
  return useQuery({
    queryKey: reportKeys.bookings(salonId, period, granularity),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/reports/bookings", {
          params: { path: { salonId }, query: { ...period, granularity } },
        })
      ) as unknown as BookingsReport,
  });
}

/** Per-staff bookings, revenue, rating and utilisation for the period. */
export function useStaffPerformance(salonId: number, period: ReportPeriod) {
  return useQuery({
    queryKey: reportKeys.staff(salonId, period),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/reports/staff-performance", {
          params: { path: { salonId }, query: period },
        })
      ),
  });
}
