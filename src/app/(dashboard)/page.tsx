/**
 * Dashboard home (`/`): KPI cards for today's activity. Phase 0 renders
 * skeletons; Phase 3 wires `reports/dashboard` and live WebSocket updates.
 */
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const KPI_KEYS = ["bookingsToday", "revenueToday", "newCustomers", "pendingBookings"] as const;

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_KEYS.map((key) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t(`kpi.${key}`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
