/**
 * Availability query (public endpoint `GET /salons/{id}/availability`), reused by
 * the reschedule and walk-in dialogs to offer only bookable slots.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Availability = components["schemas"]["AvailabilityResponse"];
export type AvailabilitySlot = components["schemas"]["Slot"];

export interface AvailabilityParams {
  /** `YYYY-MM-DD` in the salon timezone. */
  date: string;
  serviceIds: number[];
  staffId?: number;
}

export const availabilityKeys = {
  all: (salonId: number) => ["availability", salonId] as const,
  query: (salonId: number, params: AvailabilityParams) =>
    [...availabilityKeys.all(salonId), params] as const,
};

/**
 * Loads the bookable start times for the given services on a date.
 * Disabled until a date and at least one service are chosen.
 * @param salonId Salon to query.
 * @param params Date, services and optional staff filter.
 */
export function useAvailability(salonId: number, params: AvailabilityParams) {
  return useQuery({
    queryKey: availabilityKeys.query(salonId, params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/salons/{idOrSlug}/availability", {
          params: { path: { idOrSlug: String(salonId) }, query: params },
        })
      ),
    enabled: Boolean(params.date) && params.serviceIds.length > 0,
    staleTime: 15_000,
  });
}
