/**
 * TanStack Query hooks for the services module: service categories and
 * services of the selected salon, with create/update/delete mutations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Service = components["schemas"]["ServiceResponse"];
export type ServiceInput = components["schemas"]["ServiceRequest"];
export type ServiceCategory = components["schemas"]["ServiceCategoryResponse"];
export type ServiceCategoryInput = components["schemas"]["ServiceCategoryRequest"];

/** Query keys for services and categories. */
export const serviceKeys = {
  all: (salonId: number) => ["services", salonId] as const,
  list: (salonId: number) => [...serviceKeys.all(salonId), "list"] as const,
  categories: (salonId: number) => [...serviceKeys.all(salonId), "categories"] as const,
};

/** Loads every service of the salon (active and inactive). */
export function useServices(salonId: number) {
  return useQuery({
    queryKey: serviceKeys.list(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/services", {
          params: { path: { salonId } },
        })
      ),
  });
}

/** Loads the service categories of the salon, ordered by `sortOrder`. */
export function useServiceCategories(salonId: number) {
  return useQuery({
    queryKey: serviceKeys.categories(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/service-categories", {
          params: { path: { salonId } },
        })
      ),
  });
}

function useInvalidateServices(salonId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: serviceKeys.all(salonId) });
}

/** Creates a service (`POST .../services`). */
export function useCreateService(salonId: number) {
  const invalidate = useInvalidateServices(salonId);
  return useMutation({
    mutationFn: async (body: ServiceInput) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/services", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Updates a service (`PUT .../services/{serviceId}`). */
export function useUpdateService(salonId: number) {
  const invalidate = useInvalidateServices(salonId);
  return useMutation({
    mutationFn: async ({ serviceId, body }: { serviceId: number; body: ServiceInput }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/services/{serviceId}", {
          params: { path: { salonId, serviceId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Soft-deletes a service (`DELETE .../services/{serviceId}`). */
export function useDeleteService(salonId: number) {
  const invalidate = useInvalidateServices(salonId);
  return useMutation({
    mutationFn: async (serviceId: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/services/{serviceId}", {
          params: { path: { salonId, serviceId } },
        })
      ),
    onSuccess: invalidate,
  });
}

/** Creates a service category (`POST .../service-categories`). */
export function useCreateServiceCategory(salonId: number) {
  const invalidate = useInvalidateServices(salonId);
  return useMutation({
    mutationFn: async (body: ServiceCategoryInput) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/service-categories", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Updates a service category (`PUT .../service-categories/{categoryId}`). */
export function useUpdateServiceCategory(salonId: number) {
  const invalidate = useInvalidateServices(salonId);
  return useMutation({
    mutationFn: async ({ categoryId, body }: { categoryId: number; body: ServiceCategoryInput }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/service-categories/{categoryId}", {
          params: { path: { salonId, categoryId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Deletes a service category (`DELETE .../service-categories/{categoryId}`). */
export function useDeleteServiceCategory(salonId: number) {
  const invalidate = useInvalidateServices(salonId);
  return useMutation({
    mutationFn: async (categoryId: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/service-categories/{categoryId}", {
          params: { path: { salonId, categoryId } },
        })
      ),
    onSuccess: invalidate,
  });
}
