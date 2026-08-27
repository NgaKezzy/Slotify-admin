/**
 * TanStack Query hooks for the reviews module: admin list (with visibility
 * filter), public rating summary, owner reply and hide/show toggle.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Review = components["schemas"]["ReviewResponse"];
export type ReviewSummary = components["schemas"]["ReviewSummaryResponse"];

/** Query parameters accepted by the admin reviews list endpoint. */
export interface ReviewsListParams {
  visible?: boolean;
  page?: number;
  size?: number;
}

/** Query keys for reviews; invalidate `all(salonId)` after reply/visibility changes. */
export const reviewKeys = {
  all: (salonId: number) => ["reviews", salonId] as const,
  list: (salonId: number, params: ReviewsListParams) =>
    [...reviewKeys.all(salonId), "list", params] as const,
  summary: (salonId: number) => [...reviewKeys.all(salonId), "summary"] as const,
};

/** Loads a page of reviews (visible and hidden) for the salon. */
export function useReviews(salonId: number, params: ReviewsListParams = {}) {
  return useQuery({
    queryKey: reviewKeys.list(salonId, params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/reviews", {
          params: { path: { salonId }, query: params },
        })
      ),
  });
}

/**
 * Loads the public rating summary (average, count, 1–5 distribution).
 * Uses the public endpoint with the numeric salon id as `idOrSlug`.
 */
export function useReviewSummary(salonId: number) {
  return useQuery({
    queryKey: reviewKeys.summary(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/salons/{idOrSlug}/reviews/summary", {
          params: { path: { idOrSlug: String(salonId) } },
        })
      ),
  });
}

/** Posts (or replaces) the owner's reply to a review. */
export function useReplyReviewMutation(salonId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, reply }: { reviewId: number; reply: string }) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/reviews/{reviewId}/reply", {
          params: { path: { salonId, reviewId } },
          body: { reply },
        })
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.all(salonId) }),
  });
}

/** Hides or shows a review on the public salon page. */
export function useReviewVisibilityMutation(salonId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ reviewId, visible }: { reviewId: number; visible: boolean }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/reviews/{reviewId}/visibility", {
          params: { path: { salonId, reviewId } },
          body: { visible },
        })
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.all(salonId) }),
  });
}
