"use client";

/**
 * Invisible component that keeps the STOMP subscription of the selected salon
 * alive for the whole dashboard, shows a toast for incoming booking events and
 * pushes them into `useRealtimeStore` for the dashboard live feed.
 * Rendered once by `src/app/(dashboard)/layout.tsx`.
 */
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

import { type RealtimeEvent, useSalonRealtime } from "@/hooks/use-realtime";
import { useCurrentSalon } from "@/hooks/use-salons";
import { useRealtimeStore } from "@/stores/realtime-store";

interface BookingEventPayload {
  code: string;
  status: string;
  customer?: { fullName: string } | null;
}

export function RealtimeBridge() {
  const t = useTranslations("realtime");
  const { salonId } = useCurrentSalon();
  const pushEvent = useRealtimeStore((s) => s.push);

  const onEvent = useCallback(
    (event: RealtimeEvent) => {
      pushEvent(event);
      const payload = event.payload as BookingEventPayload;
      toast.info(t("bookingEvent", { code: payload.code, status: payload.status }), {
        description: payload.customer?.fullName,
      });
    },
    [t, pushEvent]
  );

  useSalonRealtime(salonId, onEvent);
  return null;
}
