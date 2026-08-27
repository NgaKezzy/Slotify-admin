"use client";

/**
 * Platform overview (`/platform`): salons by status, users by role, bookings and
 * revenue of the last 30 days and the top salons table.
 */
import { CalendarCheck, Store, Users, Wallet } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatformOverview, type PlatformOverview as Overview } from "@/hooks/use-platform";
import { formatMoney } from "@/lib/format";

type TopSalon = Overview["topSalons"][number];

export function PlatformOverview() {
  const t = useTranslations("platform");
  const locale = useLocale();
  const overview = usePlatformOverview();
  const data = overview.data;
  if (!data) return <PageSkeleton />;

  const sum = (record: Record<string, number>) =>
    Object.values(record).reduce((total, value) => total + value, 0);
  const breakdown = (record: Record<string, number>, label: (key: string) => string) =>
    Object.entries(record)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => `${value} ${label(key)}`)
      .join(" · ");

  const columns: DataTableColumn<TopSalon>[] = [
    {
      key: "salon",
      header: t("overview.salon"),
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "completed",
      header: t("overview.completedBookings"),
      className: "text-right tabular-nums",
      cell: (row) => row.completedBookings,
    },
    {
      key: "revenue",
      header: t("overview.revenue"),
      className: "text-right tabular-nums",
      cell: (row) => formatMoney(row.revenueMinor, row.currency, locale),
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("overview.salons")}
          value={sum(data.salonsByStatus)}
          hint={breakdown(data.salonsByStatus, (key) =>
            t(`overview.salonStatus.${key as "PENDING" | "ACTIVE" | "SUSPENDED"}`)
          )}
          icon={<Store className="size-4" />}
        />
        <StatCard
          label={t("overview.users")}
          value={sum(data.usersByRole)}
          hint={breakdown(data.usersByRole, (key) =>
            t(`users.role.${key as "SUPER_ADMIN" | "SALON_OWNER" | "STAFF" | "CUSTOMER"}`)
          )}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label={t("overview.bookings30")}
          value={data.bookingsLast30Days}
          icon={<CalendarCheck className="size-4" />}
        />
        <StatCard
          label={t("overview.revenue30")}
          value={
            data.revenueLast30Days.length > 0 ? (
              <span className="grid">
                {data.revenueLast30Days.map((row) => (
                  <span key={row.currency}>
                    {formatMoney(row.revenueMinor, row.currency, locale)}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-base text-muted-foreground">{t("overview.noRevenue")}</span>
            )
          }
          icon={<Wallet className="size-4" />}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("overview.topSalons")}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            rows={data.topSalons}
            rowKey={(row) => row.salonId}
            emptyMessage={t("overview.noRevenue")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
