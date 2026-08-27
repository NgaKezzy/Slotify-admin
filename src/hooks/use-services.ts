/**
 * Service catalogue queries shared by bookings (walk-in dialog) and the services module.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Service = components["schemas"]["ServiceResponse"];

export const serviceKeys = {
  all: (salonId: number) => ["services", salonId] as const,
  list: (salonId: number) => [...serviceKeys.all(salonId), "list"] as const,
};

/**
 * Loads every service of a salon (`GET /admin/salons/{id}/services`).
 * @param salonId Salon whose services to load.
 */
export function useServices(salonId: number) {
  return useQuery({
    queryKey: serviceKeys.list(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/services", {
          params: { path: { salonId } },
        })
      ),
    staleTime: 5 * 60_000,
  });
}
