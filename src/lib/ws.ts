/**
 * STOMP WebSocket client factory for real-time dashboard updates.
 *
 * The API publishes booking events on `/topic/salon/{salonId}/bookings` and
 * dashboard events on `/topic/salon/{salonId}/dashboard`. Consumers subscribe,
 * then invalidate the matching TanStack Query keys (wired up in Phase 3).
 */
import { Client, type StompConfig } from "@stomp/stompjs";

import { env } from "@/lib/env";

/** Reconnect delay in milliseconds after a dropped connection. */
const RECONNECT_DELAY_MS = 5_000;

/**
 * Builds the STOMP topic for a salon's booking events.
 * @param salonId Salon identifier.
 */
export function salonBookingsTopic(salonId: number): string {
  return `/topic/salon/${salonId}/bookings`;
}

/**
 * Builds the STOMP topic for a salon's dashboard events.
 * @param salonId Salon identifier.
 */
export function salonDashboardTopic(salonId: number): string {
  return `/topic/salon/${salonId}/dashboard`;
}

/**
 * Creates a STOMP client pointed at the API WebSocket endpoint.
 * The client is not activated; call `client.activate()` when ready and
 * `client.deactivate()` on cleanup (e.g. in a React effect).
 * @param accessToken JWT sent in the CONNECT frame so the API can authorize subscriptions.
 * @param overrides Optional STOMP configuration overrides (debug, handlers, ...).
 * @returns A configured but inactive STOMP client.
 */
export function createStompClient(accessToken: string, overrides: StompConfig = {}): Client {
  return new Client({
    brokerURL: env.publicWsUrl,
    connectHeaders: { Authorization: `Bearer ${accessToken}` },
    reconnectDelay: RECONNECT_DELAY_MS,
    ...overrides,
  });
}
