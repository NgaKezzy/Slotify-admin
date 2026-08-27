/**
 * Payments module page (`/payments`): transaction list with refunds for the selected salon.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { PaymentsTableModule } from "@/components/payments/payments-module";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.payments");
  return { title: t("title") };
}

export default async function PaymentsPage() {
  const t = await getTranslations("modules.payments");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <PaymentsTableModule />
    </div>
  );
}
