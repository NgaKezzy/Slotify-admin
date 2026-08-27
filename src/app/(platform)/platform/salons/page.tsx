/**
 * Platform salons page (`/platform/salons`): approval, suspension and commission.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformSalonsTable } from "@/components/platform/platform-salons-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.salons");
  return { title: t("title") };
}

export default async function PlatformSalonsTablePage() {
  const t = await getTranslations("platform.salons");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <PlatformSalonsTable />
    </div>
  );
}
