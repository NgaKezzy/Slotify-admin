/**
 * Platform announcements page (`/platform/notifications`): compose a push
 * notification for customers, staff or everyone.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { BroadcastForm } from "@/components/platform/broadcast-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.notifications");
  return { title: t("title") };
}

export default async function PlatformNotificationsPage() {
  const t = await getTranslations("platform.notifications");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <BroadcastForm />
    </div>
  );
}
