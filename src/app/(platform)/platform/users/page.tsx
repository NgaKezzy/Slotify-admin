/**
 * Platform users page (`/platform/users`): user directory with status and role management.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { PlatformUsersTable } from "@/components/platform/platform-users-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.users");
  return { title: t("title") };
}

export default async function PlatformUsersTablePage() {
  const t = await getTranslations("platform.users");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <PlatformUsersTable />
    </div>
  );
}
