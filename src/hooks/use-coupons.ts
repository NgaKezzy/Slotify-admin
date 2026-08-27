/**
 * TanStack Query hooks for the promotions module (coupons of the selected salon).
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Coupon = components["schemas"]["CouponResponse"];
export type CouponInput = components["schemas"]["CouponRequest"];
export type CouponType = CouponInput["type"];

/** Query keys for coupons. */
export const couponKeys = {
  all: (salonId: number) => ["coupons", salonId] as const,
  list: (salonId: number) => [...couponKeys.all(salonId), "list"] as const,
};

/** Loads every coupon of the salon. */
export function useCoupons(salonId: number) {
  return useQuery({
    queryKey: couponKeys.list(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/coupons", { params: { path: { salonId } } })
      ),
  });
}

function useInvalidateCoupons(salonId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: couponKeys.all(salonId) });
}

/** Creates a coupon (`POST .../coupons`). */
export function useCreateCoupon(salonId: number) {
  const invalidate = useInvalidateCoupons(salonId);
  return useMutation({
    mutationFn: async (body: CouponInput) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/coupons", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Updates a coupon (`PUT .../coupons/{couponId}`). */
export function useUpdateCoupon(salonId: number) {
  const invalidate = useInvalidateCoupons(salonId);
  return useMutation({
    mutationFn: async ({ couponId, body }: { couponId: number; body: CouponInput }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/coupons/{couponId}", {
          params: { path: { salonId, couponId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Deletes a coupon (`DELETE .../coupons/{couponId}`). */
export function useDeleteCoupon(salonId: number) {
  const invalidate = useInvalidateCoupons(salonId);
  return useMutation({
    mutationFn: async (couponId: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/coupons/{couponId}", {
          params: { path: { salonId, couponId } },
        })
      ),
    onSuccess: invalidate,
  });
}
