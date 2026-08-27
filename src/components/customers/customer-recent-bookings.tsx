/**
 * Recent bookings table on the customer detail page (date, services, staff,
 * total, status badge). Rows link to the bookings list filtered by code.
 */
import Link from "next/link";
import { useTranslations } from "next-intl";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { Money } from "@/components/common/money";
import { BookingStatusBadge } from "@/components/common/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { components } from "@/types/api";

type Booking = components["schemas"]["BookingResponse"];

export function CustomerRecentBookings({ bookings }: { bookings: Booking[] }) {
  const t = useTranslations("customers.detail");

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "code",
      header: t("date"),
      cell: (row) => (
        <div className="grid">
          <DateTime iso={row.startAt} />
          <Link
            href={{ pathname: "/bookings", query: { q: row.code } }}
            className="font-mono text-xs text-muted-foreground hover:underline"
          >
            {row.code}
          </Link>
        </div>
      ),
    },
    {
      key: "service",
      header: t("service"),
      cell: (row) => row.items.map((item) => item.serviceName).join(", "),
    },
    { key: "staff", header: t("staff"), cell: (row) => row.staff?.displayName ?? "—" },
    {
      key: "total",
      header: t("total"),
      className: "text-right tabular-nums",
      cell: (row) => <Money minor={row.totalMinor} currency={row.currency} />,
    },
    { key: "status", header: "", cell: (row) => <BookingStatusBadge status={row.status} /> },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentBookings")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={bookings}
          rowKey={(row) => row.id}
          emptyMessage={t("noBookings")}
        />
      </CardContent>
    </Card>
  );
}
