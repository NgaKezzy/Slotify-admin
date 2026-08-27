/**
 * TanStack Query hooks for the bookings module: paginated list plus every
 * admin action of the booking state machine (confirm, reject, cancel, start,
 * complete, no-show, mark paid, reschedule) and walk-in creation.
 *
 * Every mutation invalidates `bookings`, `calendar` and `reports` so the list,
 * the calendar and the dashboard refresh together.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Booking = components["schemas"]["BookingResponse"];
export type BookingStatus = Booking["status"];
export type PaymentMethod = NonNullable<Booking["paymentMethod"]>;
export type WalkInBookingRequest = components["schemas"]["WalkInBookingRequest"];
export type RescheduleBookingRequest = components["schemas"]["RescheduleBookingRequest"];

/** Query parameters accepted by the bookings list endpoint. */
export interface BookingsListParams {
  page?: number;
  size?: number;
  status?: BookingStatus;
  staffId?: number;
  from?: string;
  to?: string;
  q?: string;
}

/** Query keys for bookings; use these when invalidating after mutations or WebSocket events. */
export const bookingKeys = {
  all: (salonId: number) => ["bookings", salonId] as const,
  list: (salonId: number, params: BookingsListParams) =>
    [...bookingKeys.all(salonId), "list", params] as const,
};

/** Query-key prefixes refreshed after any booking mutation. */
const AFFECTED_KEY_PREFIXES = ["bookings", "calendar", "reports"] as const;

/**
 * Loads a paginated list of bookings for a salon.
 * @param salonId Salon whose bookings to load.
 * @param params Pagination and filter parameters.
 * @returns TanStack Query result with the page of bookings.
 */
export function useBookings(salonId: number, params: BookingsListParams = {}) {
  return useQuery({
    queryKey: bookingKeys.list(salonId, params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/bookings", {
          params: { path: { salonId }, query: params },
        })
      ),
    placeholderData: (previous) => previous,
  });
}

/** Simple state transitions (no request body except an optional reason). */
export type BookingAction =
  "confirm" | "reject" | "cancel" | "start" | "complete" | "noShow" | "markPaid";

export interface BookingActionInput {
  bookingId: number;
  action: BookingAction;
  /** Required by `reject` and `cancel`. */
  reason?: string;
}

/** Runs one booking action against the API and returns the updated booking (or payment). */
async function runBookingAction(salonId: number, input: BookingActionInput) {
  const path = { salonId, bookingId: input.bookingId };
  const reasonBody = { body: { reason: input.reason ?? "" } };
  switch (input.action) {
    case "confirm":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/confirm", {
          params: { path },
        })
      );
    case "reject":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/reject", {
          params: { path },
          ...reasonBody,
        })
      );
    case "cancel":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/cancel", {
          params: { path },
          ...reasonBody,
        })
      );
    case "start":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/start", {
          params: { path },
        })
      );
    case "complete":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/complete", {
          params: { path },
        })
      );
    case "noShow":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/no-show", {
          params: { path },
        })
      );
    case "markPaid":
      return unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/mark-paid", {
          params: { path },
        })
      );
  }
}

/** Invalidates every cache a booking change can affect. */
function useInvalidateBookingCaches() {
  const queryClient = useQueryClient();
  return () => {
    for (const prefix of AFFECTED_KEY_PREFIXES) {
      void queryClient.invalidateQueries({ queryKey: [prefix] });
    }
  };
}

/**
 * Mutation for the simple booking actions (confirm, reject, cancel, ...).
 * @param salonId Salon owning the booking.
 */
export function useBookingActionMutation(salonId: number) {
  const invalidate = useInvalidateBookingCaches();
  return useMutation({
    mutationFn: (input: BookingActionInput) => runBookingAction(salonId, input),
    onSuccess: invalidate,
  });
}

/**
 * Mutation moving a booking to another slot and/or staff member.
 * Fails with `ErrorCodes.SLOT_UNAVAILABLE` (4003) when the target slot is taken.
 * @param salonId Salon owning the booking.
 */
export function useRescheduleBookingMutation(salonId: number) {
  const invalidate = useInvalidateBookingCaches();
  return useMutation({
    mutationFn: async (input: { bookingId: number } & RescheduleBookingRequest) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings/{bookingId}/reschedule", {
          params: { path: { salonId, bookingId: input.bookingId } },
          body: { startAt: input.startAt, staffId: input.staffId },
        })
      ),
    onSuccess: invalidate,
  });
}

/**
 * Mutation creating a walk-in / phone booking on behalf of a customer.
 * @param salonId Salon receiving the booking.
 */
export function useCreateWalkInMutation(salonId: number) {
  const invalidate = useInvalidateBookingCaches();
  return useMutation({
    mutationFn: async (body: WalkInBookingRequest) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/bookings", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}
