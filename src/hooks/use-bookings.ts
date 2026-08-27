/**
 * TanStack Query hooks for the bookings module.
 * Example of the per-module hook pattern: every module exposes a `xxxKeys`
 * object for cache keys plus `useXxx` hooks wrapping `api` from `src/lib/api-client.ts`.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

/** Query parameters accepted by the bookings list endpoint. */
export interface BookingsListParams {
  page?: number;
  size?: number;
  status?: components["schemas"]["BookingResponse"]["status"];
  staffId?: number;
  from?: string;
  to?: string;
  q?: string;
}

/** Query keys for bookings; use these when invalidating after mutations or WebSocket events. */
export const bookingKeys = {
  all: (salonId: number) => ["bookings", salonId] as const,
  list: (salonId: number, params: BookingsListParams) =>
    [...bookingKeys.all(salonId), "list", params] as const,
};

/**
 * Loads a paginated list of bookings for a salon.
 * @param salonId Salon whose bookings to load.
 * @param params Pagination and filter parameters.
 * @returns TanStack Query result with the page of bookings.
 */
export function useBookings(salonId: number, params: BookingsListParams = {}) {
  return useQuery({
    queryKey: bookingKeys.list(salonId, params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/bookings", {
          params: { path: { salonId }, query: params },
        })
      ),
  });
}
