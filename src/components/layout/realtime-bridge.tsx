"use client";

/**
 * Invisible component that keeps the STOMP subscription of the selected salon
 * alive for the whole dashboard and shows a toast for incoming booking events.
 * Rendered once by `src/app/(dashboard)/layout.tsx`.
 */
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { toast } from "sonner";

import { type RealtimeEvent, useSalonRealtime } from "@/hooks/use-realtime";
import { useCurrentSalon } from "@/hooks/use-salons";

interface BookingEventPayload {
  code: string;
  status: string;
  customer?: { fullName: string } | null;
}

export function RealtimeBridge() {
  const t = useTranslations("realtime");
  const { salonId } = useCurrentSalon();

  const onEvent = useCallback(
    (event: RealtimeEvent) => {
      const payload = event.payload as BookingEventPayload;
      toast.info(t("bookingEvent", { code: payload.code, status: payload.status }), {
        description: payload.customer?.fullName,
      });
    },
    [t]
  );

  useSalonRealtime(salonId, onEvent);
  return null;
}
