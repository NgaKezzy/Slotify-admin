/**
 * TanStack Query hooks for the platform catalogue managed by SUPER_ADMIN:
 * salon categories and amenities. Lists come from the public endpoints
 * (`GET /categories`, `GET /amenities`); writes go to `/admin/platform/...`.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Category = components["schemas"]["CategoryResponse"];
export type CategoryInput = components["schemas"]["CategoryRequest"];
export type Amenity = components["schemas"]["AmenityResponse"];
export type AmenityInput = components["schemas"]["AmenityRequest"];

/** Query keys for the catalogue. */
export const catalogKeys = {
  categories: ["platform", "categories"] as const,
  amenities: ["platform", "amenities"] as const,
};

/** Salon categories ordered by `sortOrder`. */
export function useCategories() {
  return useQuery({
    queryKey: catalogKeys.categories,
    queryFn: async () => unwrap(await api.GET("/api/v1/categories", {})),
  });
}

/** Create / update / delete mutations for categories. */
export function useCategoryMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.categories });

  const create = useMutation({
    mutationFn: async (body: CategoryInput) =>
      unwrap(await api.POST("/api/v1/admin/platform/categories", { body })),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...body }: CategoryInput & { id: number }) =>
      unwrap(
        await api.PUT("/api/v1/admin/platform/categories/{id}", { params: { path: { id } }, body })
      ),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/platform/categories/{id}", { params: { path: { id } } })
      ),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

/** Amenities (Wi-Fi, parking, ...) salons can advertise. */
export function useAmenities() {
  return useQuery({
    queryKey: catalogKeys.amenities,
    queryFn: async () => unwrap(await api.GET("/api/v1/amenities", {})),
  });
}

/** Create / update / delete mutations for amenities. */
export function useAmenityMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: catalogKeys.amenities });

  const create = useMutation({
    mutationFn: async (body: AmenityInput) =>
      unwrap(await api.POST("/api/v1/admin/platform/amenities", { body })),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...body }: AmenityInput & { id: number }) =>
      unwrap(
        await api.PUT("/api/v1/admin/platform/amenities/{id}", { params: { path: { id } }, body })
      ),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/platform/amenities/{id}", { params: { path: { id } } })
      ),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
