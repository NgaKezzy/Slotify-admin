/**
 * Calendar module page (`/calendar`): FullCalendar day/week/month views of the
 * salon's bookings with a staff filter and drag-drop rescheduling.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CalendarView } from "@/components/calendar/calendar-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("calendar");
  return { title: t("title") };
}

export default function CalendarPage() {
  return <CalendarView />;
}
