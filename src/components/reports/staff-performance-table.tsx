/**
 * Staff performance table: bookings, completed, no-shows, revenue, rating and utilisation.
 */
import { useLocale, useTranslations } from "next-intl";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { Money } from "@/components/common/money";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StaffPerformanceRow } from "@/hooks/use-reports";
import { formatPercent } from "@/lib/format";

interface StaffPerformanceTableProps {
  rows: StaffPerformanceRow[] | undefined;
  currency: string;
  isLoading: boolean;
}

export function StaffPerformanceTable({ rows, currency, isLoading }: StaffPerformanceTableProps) {
  const t = useTranslations("reports.staff");
  const tReviews = useTranslations("reviews");
  const locale = useLocale();

  const columns: DataTableColumn<StaffPerformanceRow>[] = [
    {
      key: "name",
      header: t("name"),
      cell: (row) => (
        <span className="flex items-center gap-2 font-medium">
          {row.displayName}
          {!row.active ? <Badge variant="secondary">{t("inactive")}</Badge> : null}
        </span>
      ),
    },
    {
      key: "bookings",
      header: t("bookings"),
      className: "text-right tabular-nums",
      cell: (row) => row.bookings,
    },
    {
      key: "completed",
      header: t("completed"),
      className: "text-right tabular-nums",
      cell: (row) => row.completed,
    },
    {
      key: "noShows",
      header: t("noShows"),
      className: "text-right tabular-nums",
      cell: (row) => (
        <span className={row.noShows > 0 ? "text-status-no-show" : undefined}>{row.noShows}</span>
      ),
    },
    {
      key: "revenue",
      header: t("revenue"),
      className: "text-right tabular-nums",
      cell: (row) => <Money minor={row.revenueMinor} currency={currency} />,
    },
    {
      key: "rating",
      header: t("rating"),
      cell: (row) =>
        row.ratingAvg > 0 ? (
          <span className="flex items-center gap-1.5">
            <RatingStars
              rating={row.ratingAvg}
              label={tReviews("rating", { rating: row.ratingAvg })}
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {row.ratingAvg.toFixed(1)}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "utilisation",
      header: t("utilisation"),
      className: "text-right tabular-nums",
      cell: (row) => formatPercent(row.utilisationPercent, locale),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.staffId}
          isLoading={isLoading}
          emptyMessage={t("empty")}
        />
      </CardContent>
    </Card>
  );
}
