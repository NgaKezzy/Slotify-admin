/**
 * TanStack Query hooks for the payments module: paginated transactions and
 * the refund mutation. Refunds also invalidate bookings and reports because
 * they change the booking's payment status and the revenue figures.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Payment = components["schemas"]["PaymentResponse"];
export type PaymentProvider = Payment["provider"];
export type PaymentTransactionStatus = Payment["status"];
export type RefundInput = components["schemas"]["RefundRequest"];

/** Query parameters accepted by the payments list endpoint. */
export interface PaymentsListParams {
  page?: number;
  size?: number;
}

/** Query keys for payments. */
export const paymentKeys = {
  all: (salonId: number) => ["payments", salonId] as const,
  list: (salonId: number, params: PaymentsListParams) =>
    [...paymentKeys.all(salonId), "list", params] as const,
};

/** Loads a page of payment transactions for the salon (newest first). */
export function usePayments(salonId: number, params: PaymentsListParams = {}) {
  return useQuery({
    queryKey: paymentKeys.list(salonId, params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/payments", {
          params: { path: { salonId }, query: params },
        })
      ),
  });
}

/**
 * Refunds (part of) an online payment. Cash payments cannot be refunded through
 * the API; the UI disables the action for them.
 */
export function useRefundMutation(salonId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ paymentId, ...body }: RefundInput & { paymentId: number }) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/payments/{paymentId}/refund", {
          params: { path: { salonId, paymentId } },
          body,
        })
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all(salonId) });
      void queryClient.invalidateQueries({ queryKey: ["bookings", salonId] });
      void queryClient.invalidateQueries({ queryKey: ["reports", salonId] });
    },
  });
}

/** Amount (minor units) that can still be refunded on a payment. */
export function refundableMinor(payment: Payment): number {
  return Math.max(0, payment.amountMinor - payment.refundedMinor);
}

/** True when the payment went through an online provider and still has a refundable balance. */
export function canRefund(payment: Payment): boolean {
  return (
    payment.provider !== "CASH" &&
    (payment.status === "SUCCEEDED" || payment.status === "PARTIAL_REFUND") &&
    refundableMinor(payment) > 0
  );
}
