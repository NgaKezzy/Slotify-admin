"use client";

/**
 * "Today's bookings" card on the dashboard: compact agenda with status badges
 * and the count of upcoming bookings.
 */
import Link from "next/link";
import { useTranslations } from "next-intl";

import { DateTime } from "@/components/common/date-time";
import { EmptyState } from "@/components/common/empty-state";
import { BookingStatusBadge } from "@/components/common/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { TodayBooking } from "@/hooks/use-reports";

interface TodayBookingsProps {
  bookings: TodayBooking[] | undefined;
  upcomingCount: number;
  isLoading: boolean;
}

/** Number of skeleton rows while loading. */
const SKELETON_ROWS = 4;

export function TodayBookings({ bookings, upcomingCount, isLoading }: TodayBookingsProps) {
  const t = useTranslations("dashboard.today");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("title")}
          <Badge variant="secondary">{t("upcoming", { count: upcomingCount })}</Badge>
        </CardTitle>
        <CardAction>
          <Button variant="outline" size="sm" render={<Link href="/bookings" />}>
            {t("viewAll")}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ul className="grid gap-2">
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <li key={index}>
                <Skeleton className="h-10 w-full" />
              </li>
            ))}
          </ul>
        ) : !bookings?.length ? (
          <EmptyState title={t("empty")} compact />
        ) : (
          <ul className="divide-y">
            {bookings.map((booking) => (
              <li key={booking.id} className="flex flex-wrap items-center gap-3 py-2 text-sm">
                <span className="w-28 font-medium tabular-nums">
                  <DateTime iso={booking.startAt} mode="time" />
                  {" – "}
                  <DateTime iso={booking.endAt} mode="time" />
                </span>
                <span className="min-w-0 flex-1 truncate">
                  <Link
                    href={`/bookings?q=${encodeURIComponent(booking.code)}`}
                    className="hover:underline"
                  >
                    {booking.customerName}
                  </Link>
                  <span className="text-muted-foreground"> · {booking.staffName}</span>
                </span>
                <span className="font-mono text-xs text-muted-foreground">{booking.code}</span>
                <BookingStatusBadge status={booking.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
