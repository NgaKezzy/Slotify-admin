/**
 * Bookings module page (`/bookings`): server-paginated list with filters in
 * the URL, detail sheet with state-machine actions and walk-in creation.
 * `BookingsView` reads `useSearchParams`, hence the Suspense boundary.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { BookingsView } from "@/components/bookings/bookings-view";
import { PageSkeleton } from "@/components/common/page-skeleton";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("bookings");
  return { title: t("title") };
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <BookingsView />
    </Suspense>
  );
}
