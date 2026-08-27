"use client";

/**
 * FullCalendar wrapper for the salon calendar. Renders bookings as events
 * coloured by status (CSS `--status-*` tokens), supports drag-drop / resize
 * rescheduling and reports the visible range back to the parent.
 *
 * Note: FullCalendar's per-staff resource views (resource-timeline /
 * resource-timegrid) are premium plugins that require a licence, so this uses
 * the free timeGrid/dayGrid views with a staff filter above the calendar.
 */
import { Calendar, type CalendarRef } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import formaThemePlugin from "@fullcalendar/react/themes/forma";
import timeGridPlugin from "@fullcalendar/react/timegrid";
import { useLocale } from "next-intl";
import { useRef } from "react";

import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/forma/theme.css";

import type { Booking } from "@/hooks/use-bookings";

/** Booking status → CSS variable used as the event colour. */
const STATUS_COLOR_VAR: Record<Booking["status"], string> = {
  PENDING: "var(--status-pending)",
  CONFIRMED: "var(--status-confirmed)",
  IN_PROGRESS: "var(--status-confirmed)",
  COMPLETED: "var(--status-completed)",
  CANCELLED: "var(--status-cancelled)",
  NO_SHOW: "var(--status-no-show)",
  REJECTED: "var(--status-rejected)",
};

/** Statuses whose events can be dragged / resized. */
const EDITABLE_STATUSES: Booking["status"][] = ["PENDING", "CONFIRMED"];

/** First and last hour shown in the time grid. */
const SLOT_MIN_TIME = "06:00:00";
const SLOT_MAX_TIME = "22:00:00";
/** Calendar view ids. */
export const CALENDAR_VIEWS = {
  day: "timeGridDay",
  week: "timeGridWeek",
  month: "dayGridMonth",
} as const;

export interface CalendarRange {
  /** ISO instants of the visible range (start inclusive, end exclusive). */
  from: string;
  to: string;
}

export interface RescheduleRequest {
  booking: Booking;
  startAt: string;
  /** Puts the event back where it was (call on API failure). */
  revert: () => void;
}

interface BookingCalendarProps {
  bookings: Booking[];
  timezone: string;
  initialView: string;
  onRangeChange: (range: CalendarRange) => void;
  onEventClick: (booking: Booking) => void;
  onReschedule: (request: RescheduleRequest) => void;
  /** Toolbar button labels. */
  labels: { today: string; day: string; week: string; month: string };
}

export function BookingCalendar({
  bookings,
  timezone,
  initialView,
  onRangeChange,
  onEventClick,
  onReschedule,
  labels,
}: BookingCalendarProps) {
  const locale = useLocale();
  const ref = useRef<CalendarRef>(null);

  const events = bookings.map((booking) => ({
    id: String(booking.id),
    title: `${booking.customer.fullName} · ${booking.staff.displayName}`,
    start: booking.startAt,
    end: booking.endAt,
    color: STATUS_COLOR_VAR[booking.status],
    contrastColor: "var(--background)",
    editable: EDITABLE_STATUSES.includes(booking.status),
    extendedProps: { booking },
  }));

  return (
    <div className="slotify-calendar rounded-xl border bg-card p-3">
      <Calendar
        ref={ref}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, formaThemePlugin]}
        initialView={initialView}
        timeZone={timezone}
        locale={locale}
        headerToolbar={{
          start: "prev,next today",
          center: "title",
          end: "timeGridDay,timeGridWeek,dayGridMonth",
        }}
        buttons={{
          today: { text: labels.today },
          timeGridDay: { text: labels.day },
          timeGridWeek: { text: labels.week },
          dayGridMonth: { text: labels.month },
        }}
        events={events}
        editable
        eventResizableFromStart={false}
        eventDurationEditable={false}
        nowIndicator
        allDaySlot={false}
        slotMinTime={SLOT_MIN_TIME}
        slotMaxTime={SLOT_MAX_TIME}
        firstDay={1}
        height="auto"
        expandRows
        datesSet={(info) =>
          onRangeChange({ from: info.start.toISOString(), to: info.end.toISOString() })
        }
        eventClick={(info) => onEventClick(info.event.extendedProps.booking as Booking)}
        eventDrop={(info) => {
          const booking = info.event.extendedProps.booking as Booking;
          if (!info.event.start) return info.revert();
          onReschedule({ booking, startAt: info.event.start.toISOString(), revert: info.revert });
        }}
      />
    </div>
  );
}
