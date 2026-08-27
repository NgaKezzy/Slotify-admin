"use client";

/**
 * Calendar page content: staff filter + status legend, the FullCalendar view
 * (loaded client-side only) and the shared booking sheet. Drag-drop calls the
 * reschedule endpoint and reverts the event when the slot is unavailable (4003).
 */
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ALL } from "@/components/bookings/booking-filters";
import { BookingSheet } from "@/components/bookings/booking-sheet";
import type { CalendarRange } from "@/components/calendar/booking-calendar";
import { RequireSalon } from "@/components/common/no-salon";
import { BookingStatusBadge, type BookingStatus } from "@/components/common/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useRescheduleBookingMutation, type Booking } from "@/hooks/use-bookings";
import { useCalendarBookings } from "@/hooks/use-calendar";
import { useCurrentSalon } from "@/hooks/use-salons";
import { useStaffList } from "@/hooks/use-staff";
import { ErrorCodes, toApiError } from "@/lib/api-error";

const BookingCalendar = dynamic(
  () => import("@/components/calendar/booking-calendar").then((m) => m.BookingCalendar),
  { ssr: false, loading: () => <Skeleton className="h-[640px] w-full" /> }
);

/** Statuses shown in the legend, in display order. */
const LEGEND_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export function CalendarView() {
  const t = useTranslations("calendar");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <RequireSalon>{(salonId) => <CalendarContent salonId={salonId} />}</RequireSalon>
    </div>
  );
}

function CalendarContent({ salonId }: { salonId: number }) {
  const t = useTranslations("calendar");
  const tBookings = useTranslations("bookings");
  const { timezone } = useCurrentSalon();
  const staff = useStaffList(salonId);
  const [range, setRange] = useState<CalendarRange>({ from: "", to: "" });
  const [staffId, setStaffId] = useState(ALL);
  const [selected, setSelected] = useState<Booking | null>(null);
  const bookings = useCalendarBookings(salonId, range.from, range.to);
  const reschedule = useRescheduleBookingMutation(salonId);

  const visible = (bookings.data ?? []).filter(
    (booking) => staffId === ALL || booking.staff.id === Number(staffId)
  );
  const selectedBooking = bookings.data?.find((b) => b.id === selected?.id) ?? selected;

  return (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <Select value={staffId} onValueChange={(v) => setStaffId(v ?? ALL)}>
          <SelectTrigger aria-label={t("staffFilter")} className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t("allStaff")}</SelectItem>
            {(staff.data ?? []).map((member) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap items-center gap-2" aria-label={t("legend")}>
          {LEGEND_STATUSES.map((status) => (
            <BookingStatusBadge key={status} status={status} />
          ))}
        </div>
        {bookings.error ? (
          <p className="text-sm text-destructive">{toApiError(bookings.error).message}</p>
        ) : null}
      </div>
      <BookingCalendar
        bookings={visible}
        timezone={timezone}
        initialView="timeGridWeek"
        labels={{
          today: t("today"),
          day: t("views.day"),
          week: t("views.week"),
          month: t("views.month"),
        }}
        onRangeChange={setRange}
        onEventClick={setSelected}
        onReschedule={({ booking, startAt, revert }) =>
          reschedule.mutate(
            { bookingId: booking.id, startAt },
            {
              onSuccess: () => toast.success(t("rescheduled")),
              onError: (error) => {
                revert();
                const apiError = toApiError(error);
                toast.error(
                  apiError.code === ErrorCodes.SLOT_UNAVAILABLE
                    ? t("slotUnavailable")
                    : apiError.message
                );
              },
            }
          )
        }
      />
      <BookingSheet
        salonId={salonId}
        booking={selectedBooking}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
      <span className="sr-only">{tBookings("title")}</span>
    </>
  );
}
