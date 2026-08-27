/**
 * Platform payouts page (`/platform/payouts`): per-salon payout report with Excel export.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { PayoutsView } from "@/components/platform/payouts-view";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.payouts");
  return { title: t("title") };
}

export default async function PayoutsViewPage() {
  const t = await getTranslations("platform.payouts");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <PayoutsView />
    </div>
  );
}
