/**
 * Staff queries shared by bookings, calendar and (later) the staff module.
 */
import { useQuery } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Staff = components["schemas"]["StaffResponse"];

export const staffKeys = {
  all: (salonId: number) => ["staff", salonId] as const,
  list: (salonId: number) => [...staffKeys.all(salonId), "list"] as const,
};

/**
 * Loads every staff member of a salon (`GET /admin/salons/{id}/staff`).
 * @param salonId Salon whose staff to load.
 */
export function useStaff(salonId: number) {
  return useQuery({
    queryKey: staffKeys.list(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/staff", {
          params: { path: { salonId } },
        })
      ),
    staleTime: 5 * 60_000,
  });
}
