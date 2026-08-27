/**
 * Top services by revenue for the selected period.
 */
import { useTranslations } from "next-intl";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { Money } from "@/components/common/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenueReport } from "@/hooks/use-reports";

type ServiceRow = RevenueReport["byService"][number];

export function TopServicesTable({ report }: { report: RevenueReport }) {
  const t = useTranslations("reports");
  const columns: DataTableColumn<ServiceRow>[] = [
    { key: "service", header: t("revenue.service"), cell: (row) => row.serviceName },
    {
      key: "bookings",
      header: t("staff.bookings"),
      className: "text-right tabular-nums",
      cell: (row) => row.bookings,
    },
    {
      key: "revenue",
      header: t("revenue.revenue"),
      className: "text-right tabular-nums",
      cell: (row) => <Money minor={row.revenueMinor} currency={report.currency} />,
    },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("revenue.topServices")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          rows={report.byService}
          rowKey={(row) => row.serviceId}
          emptyMessage={t("revenue.empty")}
        />
      </CardContent>
    </Card>
  );
}
