"use client";

/**
 * Live feed card: the latest real-time booking events received over STOMP
 * (see `RealtimeBridge` and `useRealtimeStore`).
 */
import { Radio } from "lucide-react";
import { useTranslations } from "next-intl";

import { DateTime } from "@/components/common/date-time";
import { EmptyState } from "@/components/common/empty-state";
import { BookingStatusBadge, type BookingStatus } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRealtimeStore } from "@/stores/realtime-store";

/** Shape of the booking event payload published by the API. */
interface BookingEventPayload {
  code?: string;
  status?: string;
  customer?: { fullName?: string } | null;
}

const BOOKING_STATUSES: readonly string[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "REJECTED",
];

export function LiveFeed() {
  const t = useTranslations("dashboard.liveFeed");
  const events = useRealtimeStore((s) => s.events);
  const clear = useRealtimeStore((s) => s.clear);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="size-4 text-success" aria-hidden />
          {t("title")}
        </CardTitle>
        <CardDescription>{t("description")}</CardDescription>
        {events.length > 0 ? (
          <CardAction>
            <Button variant="ghost" size="sm" onClick={clear}>
              {t("clear")}
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <EmptyState title={t("empty")} compact icon={<Radio className="size-6" />} />
        ) : (
          <ul className="divide-y">
            {events.map(({ id, receivedAt, event }) => {
              const payload = (event.payload ?? {}) as BookingEventPayload;
              const status = payload.status;
              return (
                <li key={id} className="flex items-center gap-3 py-2 text-sm">
                  <DateTime
                    iso={receivedAt}
                    mode="time"
                    className="w-12 text-xs text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-mono text-xs">{payload.code ?? event.type}</span>
                    {payload.customer?.fullName ? (
                      <span className="text-muted-foreground"> · {payload.customer.fullName}</span>
                    ) : null}
                  </span>
                  {status && BOOKING_STATUSES.includes(status) ? (
                    <BookingStatusBadge status={status as BookingStatus} />
                  ) : (
                    <span className="text-xs text-muted-foreground">{event.type}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
