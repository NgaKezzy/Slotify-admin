/**
 * Reports module page (`/reports`): revenue, bookings and staff performance
 * charts with Excel/PDF export for the selected salon.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ReportsViewModule } from "@/components/reports/reports-module";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.reports");
  return { title: t("title") };
}

export default async function ReportsPage() {
  const t = await getTranslations("modules.reports");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ReportsViewModule />
    </div>
  );
}
