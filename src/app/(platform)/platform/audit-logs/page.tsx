/**
 * Platform audit-logs page (`/platform/audit-logs`): who changed what across all salons.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { AuditLogsTable } from "@/components/platform/audit-logs-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.auditLogs");
  return { title: t("title") };
}

export default async function AuditLogsTablePage() {
  const t = await getTranslations("platform.auditLogs");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AuditLogsTable />
    </div>
  );
}
