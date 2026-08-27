/**
 * TanStack Query hooks for the settings module: salon profile (create/update),
 * opening hours, booking rules & payment settings, gallery images, plus the
 * global category and amenity lists used by the profile form.
 * Mutations invalidate `salonKeys` so the header switcher and every
 * `useCurrentSalon()` consumer pick up the change.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { salonKeys } from "@/hooks/use-salons";
import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type SalonInput = components["schemas"]["SalonRequest"];
export type OpeningHour = components["schemas"]["OpeningHourDto"];
export type SalonSettings = components["schemas"]["SalonSettingsDto"];
export type Category = components["schemas"]["CategoryResponse"];
export type Amenity = components["schemas"]["AmenityResponse"];

/** Query keys for the platform-wide lookup lists. */
export const lookupKeys = {
  categories: ["lookups", "categories"] as const,
  amenities: ["lookups", "amenities"] as const,
};

/** Loads the global salon categories (`GET /categories`). */
export function useGlobalCategories() {
  return useQuery({
    queryKey: lookupKeys.categories,
    queryFn: async () => unwrap(await api.GET("/api/v1/categories", {})),
    staleTime: 10 * 60_000,
  });
}

/** Loads the global amenities (`GET /amenities`). */
export function useAmenities() {
  return useQuery({
    queryKey: lookupKeys.amenities,
    queryFn: async () => unwrap(await api.GET("/api/v1/amenities", {})),
    staleTime: 10 * 60_000,
  });
}

function useInvalidateSalon() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: salonKeys.all });
}

/** Creates a new salon for the signed-in owner (`POST /admin/salons`). */
export function useCreateSalon() {
  const invalidate = useInvalidateSalon();
  return useMutation({
    mutationFn: async (body: SalonInput) =>
      unwrap(await api.POST("/api/v1/admin/salons", { body })),
    onSuccess: invalidate,
  });
}

/** Updates the salon profile (`PUT /admin/salons/{salonId}`). */
export function useUpdateSalon(salonId: number) {
  const invalidate = useInvalidateSalon();
  return useMutation({
    mutationFn: async (body: SalonInput) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}", { params: { path: { salonId } }, body })
      ),
    onSuccess: invalidate,
  });
}

/** Replaces the weekly opening hours (`PUT .../opening-hours`). */
export function useUpdateOpeningHours(salonId: number) {
  const invalidate = useInvalidateSalon();
  return useMutation({
    mutationFn: async (body: OpeningHour[]) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/opening-hours", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Updates booking rules and accepted payment methods (`PUT .../settings`). */
export function useUpdateSalonSettings(salonId: number) {
  const invalidate = useInvalidateSalon();
  return useMutation({
    mutationFn: async (body: SalonSettings) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/settings", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Replaces the ordered gallery image URLs (`PUT .../images`). */
export function useUpdateSalonImages(salonId: number) {
  const invalidate = useInvalidateSalon();
  return useMutation({
    mutationFn: async (body: string[]) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/images", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}
