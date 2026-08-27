/**
 * In-memory feed of the latest real-time booking events for the selected salon.
 * Fed by `RealtimeBridge` (dashboard shell) and rendered by the dashboard
 * "live feed" card. Not persisted: a reload starts with an empty feed.
 */
import { create } from "zustand";

import type { RealtimeEvent } from "@/hooks/use-realtime";

/** Maximum number of events kept in the feed (oldest are dropped). */
export const REALTIME_FEED_LIMIT = 10;

/** A feed entry: the raw event plus a client-side id for React keys. */
export interface RealtimeFeedEntry {
  id: number;
  receivedAt: string;
  event: RealtimeEvent;
}

interface RealtimeState {
  events: RealtimeFeedEntry[];
  /** Prepends an event and trims the feed to `REALTIME_FEED_LIMIT`. */
  push: (event: RealtimeEvent) => void;
  clear: () => void;
}

let nextId = 1;

export const useRealtimeStore = create<RealtimeState>()((set) => ({
  events: [],
  push: (event) =>
    set((state) => ({
      events: [
        { id: nextId++, receivedAt: new Date().toISOString(), event },
        ...state.events,
      ].slice(0, REALTIME_FEED_LIMIT),
    })),
  clear: () => set({ events: [] }),
}));
