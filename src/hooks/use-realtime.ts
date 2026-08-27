"use client";

/**
 * Real-time updates over STOMP for the selected salon.
 *
 * Subscribes to `/topic/salon/{id}/bookings` and `/topic/salon/{id}/dashboard`
 * and invalidates the matching TanStack Query caches, so lists, calendar and
 * dashboard refresh within a second of any change made in the apps or by staff.
 * Mount once in the dashboard shell (`RealtimeBridge`).
 */
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { getAccessToken } from "@/lib/api-client";
import { createStompClient, salonBookingsTopic, salonDashboardTopic } from "@/lib/ws";

/** Query key prefixes refreshed when a booking event arrives. */
const BOOKING_RELATED_KEYS = ["bookings", "calendar", "reports", "customers", "payments"];

export interface RealtimeEvent<T = unknown> {
  type: string;
  payload: T;
  sentAt: string;
}

/**
 * Keeps a STOMP connection open for the salon and invalidates caches on events.
 * @param salonId Selected salon, or null to stay disconnected.
 * @param onBookingEvent Optional callback for toasts / live feeds.
 */
export function useSalonRealtime(
  salonId: number | null,
  onBookingEvent?: (event: RealtimeEvent) => void
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (salonId === null) return;
    let cancelled = false;
    let client: ReturnType<typeof createStompClient> | null = null;

    void getAccessToken().then((token) => {
      if (!token || cancelled) return;
      client = createStompClient(token, {
        onConnect: () => {
          client?.subscribe(salonBookingsTopic(salonId), (message) => {
            const event = JSON.parse(message.body) as RealtimeEvent;
            for (const key of BOOKING_RELATED_KEYS) {
              void queryClient.invalidateQueries({ queryKey: [key] });
            }
            onBookingEvent?.(event);
          });
          client?.subscribe(salonDashboardTopic(salonId), () => {
            void queryClient.invalidateQueries({ queryKey: ["reports"] });
          });
        },
      });
      client.activate();
    });

    return () => {
      cancelled = true;
      void client?.deactivate();
    };
    // onBookingEvent intentionally excluded: callers pass stable callbacks or accept re-subscribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salonId, queryClient]);
}
