"use client";

/**
 * Bookings list page content: filters synced to the URL search params, the
 * server-paginated `DataTable`, the detail sheet and the walk-in dialog.
 */
import { Plus } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  BookingFilters,
  ALL,
  EMPTY_FILTERS,
  type BookingFilterValues,
} from "@/components/bookings/booking-filters";
import { BookingSheet } from "@/components/bookings/booking-sheet";
import { WalkInDialog } from "@/components/bookings/walk-in-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { Money } from "@/components/common/money";
import { RequireSalon } from "@/components/common/no-salon";
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/common/status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useBookings, type Booking, type BookingsListParams } from "@/hooks/use-bookings";
import { useCurrentSalon } from "@/hooks/use-salons";
import { useStaffList } from "@/hooks/use-staff";
import { endOfDayInZone, startOfDayInZone } from "@/lib/format";

/** Rows per page of the bookings table. */
const PAGE_SIZE = 20;

export function BookingsView() {
  const t = useTranslations("bookings");
  const [walkInOpen, setWalkInOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button onClick={() => setWalkInOpen(true)}>
            <Plus className="size-4" />
            {t("newWalkIn")}
          </Button>
        }
      />
      <RequireSalon>
        {(salonId) => (
          <>
            <BookingsTable salonId={salonId} />
            <WalkInDialog salonId={salonId} open={walkInOpen} onOpenChange={setWalkInOpen} />
          </>
        )}
      </RequireSalon>
    </div>
  );
}

/** Reads the filter values and page from the URL search params. */
function readFilters(params: URLSearchParams): BookingFilterValues & { page: number } {
  return {
    q: params.get("q") ?? "",
    status: params.get("status") ?? ALL,
    staffId: params.get("staffId") ?? ALL,
    from: params.get("from") ?? "",
    to: params.get("to") ?? "",
    page: Math.max(0, Number(params.get("page") ?? 0) || 0),
  };
}

/** Converts URL filter values into the API query parameters (dates become salon-day instants). */
function toListParams(
  filters: ReturnType<typeof readFilters>,
  timezone: string
): BookingsListParams {
  return {
    page: filters.page,
    size: PAGE_SIZE,
    q: filters.q || undefined,
    status: filters.status !== ALL ? (filters.status as BookingsListParams["status"]) : undefined,
    staffId: filters.staffId !== ALL ? Number(filters.staffId) : undefined,
    from: filters.from ? startOfDayInZone(filters.from, timezone) : undefined,
    to: filters.to ? endOfDayInZone(filters.to, timezone) : undefined,
  };
}

function BookingsTable({ salonId }: { salonId: number }) {
  const t = useTranslations("bookings");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { timezone } = useCurrentSalon();
  const filters = readFilters(searchParams);
  const bookings = useBookings(salonId, toListParams(filters, timezone));
  const staff = useStaffList(salonId);
  const [selected, setSelected] = useState<Booking | null>(null);

  // The sheet shows the freshest copy of the selected booking after mutations.
  const selectedBooking =
    bookings.data?.items.find((booking) => booking.id === selected?.id) ?? selected;

  const writeUrl = (values: BookingFilterValues, page: number) => {
    const next = new URLSearchParams();
    if (values.q) next.set("q", values.q);
    if (values.status !== ALL) next.set("status", values.status);
    if (values.staffId !== ALL) next.set("staffId", values.staffId);
    if (values.from) next.set("from", values.from);
    if (values.to) next.set("to", values.to);
    if (page > 0) next.set("page", String(page));
    const query = next.toString();
    router.replace((query ? `${pathname}?${query}` : pathname) as Route, { scroll: false });
  };

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "code",
      header: t("columns.code"),
      cell: (b) => <span className="font-mono text-xs">{b.code}</span>,
    },
    {
      key: "customer",
      header: t("columns.customer"),
      cell: (b) => (
        <div className="grid">
          <span className="font-medium">{b.customer.fullName}</span>
          <span className="text-xs text-muted-foreground">{b.customer.email}</span>
        </div>
      ),
    },
    {
      key: "services",
      header: t("columns.services"),
      cell: (b) => (
        <span className="line-clamp-2">{b.items.map((i) => i.serviceName).join(", ")}</span>
      ),
    },
    { key: "staff", header: t("columns.staff"), cell: (b) => b.staff.displayName },
    { key: "start", header: t("columns.start"), cell: (b) => <DateTime iso={b.startAt} /> },
    {
      key: "status",
      header: t("columns.status"),
      cell: (b) => <BookingStatusBadge status={b.status} />,
    },
    {
      key: "payment",
      header: t("columns.payment"),
      cell: (b) => <PaymentStatusBadge status={b.paymentStatus} />,
    },
    {
      key: "total",
      header: t("columns.total"),
      className: "text-right",
      cell: (b) => <Money minor={b.totalMinor} currency={b.currency} />,
    },
  ];

  return (
    <>
      <BookingFilters
        values={{ ...EMPTY_FILTERS, ...filters }}
        staff={staff.data ?? []}
        onChange={(values) => writeUrl(values, 0)}
      />
      <DataTable
        columns={columns}
        rows={bookings.data?.items}
        rowKey={(b) => b.id}
        isLoading={bookings.isLoading}
        emptyMessage={t("empty")}
        onRowClick={setSelected}
        pagination={{
          page: bookings.data?.page ?? filters.page,
          totalPages: bookings.data?.totalPages ?? 0,
          totalItems: bookings.data?.totalItems,
          onPageChange: (page) => writeUrl(filters, page),
        }}
      />
      <BookingSheet
        salonId={salonId}
        booking={selectedBooking}
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </>
  );
}
