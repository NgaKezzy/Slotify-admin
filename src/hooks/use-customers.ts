/**
 * TanStack Query hooks for the customers (CRM) module: paginated list, detail,
 * tags (assign + manage) and notes. Every mutation invalidates the affected
 * customer caches so the list and detail pages refresh automatically.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type CustomerSummary = components["schemas"]["CustomerSummaryResponse"];
export type CustomerDetail = components["schemas"]["CustomerDetailResponse"];
export type CustomerTag = components["schemas"]["CustomerTagResponse"];
export type CustomerTagInput = components["schemas"]["CustomerTagRequest"];
export type CustomerNote = components["schemas"]["CustomerNoteResponse"];

/** Query parameters accepted by the customers list endpoint. */
export interface CustomersListParams {
  q?: string;
  page?: number;
  size?: number;
}

/** Query keys for customers; invalidate `all(salonId)` after any mutation. */
export const customerKeys = {
  all: (salonId: number) => ["customers", salonId] as const,
  list: (salonId: number, params: CustomersListParams) =>
    [...customerKeys.all(salonId), "list", params] as const,
  detail: (salonId: number, customerId: number) =>
    [...customerKeys.all(salonId), "detail", customerId] as const,
  tags: (salonId: number) => [...customerKeys.all(salonId), "tags"] as const,
};

/**
 * Loads a page of customers with their booking statistics and tags.
 * @param salonId Salon whose customers to load.
 * @param params Search (`q`) and pagination.
 */
export function useCustomers(salonId: number, params: CustomersListParams = {}) {
  return useQuery({
    queryKey: customerKeys.list(salonId, params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/customers", {
          params: { path: { salonId }, query: params },
        })
      ),
  });
}

/** Loads one customer with notes and recent bookings. */
export function useCustomer(salonId: number, customerId: number) {
  return useQuery({
    queryKey: customerKeys.detail(salonId, customerId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/customers/{customerId}", {
          params: { path: { salonId, customerId } },
        })
      ),
  });
}

/** Loads the salon's customer tags (shared by the tag editor and manage dialog). */
export function useCustomerTags(salonId: number) {
  return useQuery({
    queryKey: customerKeys.tags(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/customer-tags", {
          params: { path: { salonId } },
        })
      ),
    staleTime: 5 * 60_000,
  });
}

/** Replaces the set of tags assigned to a customer (`PUT .../customers/{id}/tags`). */
export function useAssignTagsMutation(salonId: number, customerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tagIds: number[]) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/customers/{customerId}/tags", {
          params: { path: { salonId, customerId } },
          body: { tagIds },
        })
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all(salonId) }),
  });
}

/** Create / update / delete mutations for the salon's tag catalogue. */
export function useCustomerTagMutations(salonId: number) {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: customerKeys.all(salonId) });

  const create = useMutation({
    mutationFn: async (body: CustomerTagInput) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/customer-tags", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ tagId, ...body }: CustomerTagInput & { tagId: number }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/customer-tags/{tagId}", {
          params: { path: { salonId, tagId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (tagId: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/customer-tags/{tagId}", {
          params: { path: { salonId, tagId } },
        })
      ),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}

/** Add / delete mutations for a customer's private notes. */
export function useCustomerNoteMutations(salonId: number, customerId: number) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: customerKeys.detail(salonId, customerId) });

  const add = useMutation({
    mutationFn: async (note: string) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/customers/{customerId}/notes", {
          params: { path: { salonId, customerId } },
          body: { note },
        })
      ),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (noteId: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/customers/{customerId}/notes/{noteId}", {
          params: { path: { salonId, customerId, noteId } },
        })
      ),
    onSuccess: invalidate,
  });
  return { add, remove };
}
