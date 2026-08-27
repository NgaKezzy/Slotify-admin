"use client";

/**
 * Customers list (`/customers`): debounced search plus a server-paginated
 * DataTable with booking statistics, total spent and tag chips. Rows link to
 * the customer detail page.
 */
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { Money } from "@/components/common/money";
import { SearchInput } from "@/components/common/search-input";
import { TagChip } from "@/components/customers/tag-chip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCustomers, type CustomerSummary } from "@/hooks/use-customers";
import { getInitials } from "@/lib/utils";

const PAGE_SIZE = 20;

export function CustomersTable({ salonId }: { salonId: number }) {
  const t = useTranslations("customers");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const customers = useCustomers(salonId, { q: query || undefined, page, size: PAGE_SIZE });

  const columns: DataTableColumn<CustomerSummary>[] = [
    {
      key: "customer",
      header: t("columns.customer"),
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            {row.avatarUrl ? <AvatarImage src={row.avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xs">{getInitials(row.fullName)}</AvatarFallback>
          </Avatar>
          <div className="grid">
            <span className="font-medium">{row.fullName}</span>
            <span className="text-xs text-muted-foreground">{row.email || row.phone}</span>
          </div>
        </div>
      ),
    },
    {
      key: "bookings",
      header: t("columns.bookings"),
      className: "text-right tabular-nums",
      cell: (row) => row.totalBookings,
    },
    {
      key: "completed",
      header: t("columns.completed"),
      className: "text-right tabular-nums",
      cell: (row) => row.completedBookings,
    },
    {
      key: "noShows",
      header: t("columns.noShows"),
      className: "text-right tabular-nums",
      cell: (row) => (
        <span className={row.noShows > 0 ? "text-status-no-show" : undefined}>{row.noShows}</span>
      ),
    },
    {
      key: "totalSpent",
      header: t("columns.totalSpent"),
      className: "text-right tabular-nums",
      cell: (row) => <Money minor={row.totalSpentMinor} />,
    },
    {
      key: "lastVisit",
      header: t("columns.lastVisit"),
      cell: (row) =>
        row.lastVisitAt ? (
          <DateTime iso={row.lastVisitAt} />
        ) : (
          <span className="text-muted-foreground">{t("detail.never")}</span>
        ),
    },
    {
      key: "tags",
      header: t("columns.tags"),
      cell: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <SearchInput
        value={query}
        onChange={(value) => {
          setQuery(value);
          setPage(0);
        }}
        placeholder={t("searchPlaceholder")}
      />
      <DataTable
        columns={columns}
        rows={customers.data?.items}
        rowKey={(row) => row.id}
        isLoading={customers.isLoading}
        emptyMessage={t("empty")}
        onRowClick={(row) => router.push(`/customers/${row.id}`)}
        pagination={{
          page: customers.data?.page ?? 0,
          totalPages: customers.data?.totalPages ?? 0,
          totalItems: customers.data?.totalItems,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
