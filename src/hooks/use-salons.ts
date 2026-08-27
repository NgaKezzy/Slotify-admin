/**
 * Salon queries: the owner's salons, the selected salon's details and the salon
 * context every module hook depends on.
 */
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { api, unwrap } from "@/lib/api-client";
import { useSalonStore } from "@/stores/salon-store";
import type { components } from "@/types/api";

export type SalonSummary = components["schemas"]["SalonSummaryResponse"];
export type SalonDetail = components["schemas"]["SalonDetailResponse"];

export const salonKeys = {
  all: ["salons"] as const,
  mine: () => [...salonKeys.all, "mine"] as const,
  detail: (salonId: number) => [...salonKeys.all, "detail", salonId] as const,
};

/** Loads the salons the signed-in user may manage (`GET /admin/salons`). */
export function useMySalons() {
  return useQuery({
    queryKey: salonKeys.mine(),
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/salons", {})),
    staleTime: 5 * 60_000,
  });
}

/** Loads the full detail (timezone, currency, settings, ...) of a salon. */
export function useSalonDetail(salonId: number | null) {
  return useQuery({
    queryKey: salonKeys.detail(salonId ?? 0),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}", {
          params: { path: { salonId: salonId as number } },
        })
      ),
    enabled: salonId !== null,
    staleTime: 5 * 60_000,
  });
}

/**
 * The selected salon: id (from the store, auto-selected to the first salon when empty),
 * summary and detail. Module pages render a skeleton while `salonId` is null.
 */
export function useCurrentSalon() {
  const salonId = useSalonStore((s) => s.salonId);
  const setSalonId = useSalonStore((s) => s.setSalonId);
  const salons = useMySalons();
  const detail = useSalonDetail(salonId);

  // Auto-select the first salon, or drop a stale selection the user no longer owns.
  useEffect(() => {
    const list = salons.data;
    if (!list) return;
    const stillOwned = list.some((s) => s.id === salonId);
    if (!stillOwned) setSalonId(list[0]?.id ?? null);
  }, [salons.data, salonId, setSalonId]);

  const summary = salons.data?.find((s) => s.id === salonId) ?? null;
  return {
    salonId,
    setSalonId,
    salons: salons.data ?? [],
    summary,
    detail: detail.data ?? null,
    timezone: detail.data?.timezone ?? "UTC",
    currency: detail.data?.currency ?? summary?.currency ?? "EUR",
    isLoading: salons.isLoading || (salonId !== null && detail.isLoading),
    hasSalons: (salons.data?.length ?? 0) > 0,
  };
}
