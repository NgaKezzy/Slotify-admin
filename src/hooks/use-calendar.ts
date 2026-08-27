/**
 * Calendar feed query: every booking starting inside a date range, used by the
 * FullCalendar view. Keyed under `calendar` so booking mutations and WebSocket
 * events can invalidate it independently from the paginated list.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";

export const calendarKeys = {
  all: (salonId: number) => ["calendar", salonId] as const,
  range: (salonId: number, from: string, to: string) =>
    [...calendarKeys.all(salonId), from, to] as const,
};

/**
 * Loads bookings starting between `from` and `to` (ISO instants).
 * @param salonId Salon whose calendar to load.
 * @param from Range start (inclusive, ISO date-time).
 * @param to Range end (exclusive, ISO date-time).
 */
export function useCalendarBookings(salonId: number, from: string, to: string) {
  return useQuery({
    queryKey: calendarKeys.range(salonId, from, to),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/bookings/calendar", {
          params: { path: { salonId }, query: { from, to } },
        })
      ),
    enabled: Boolean(from && to),
    placeholderData: (previous) => previous,
  });
}
