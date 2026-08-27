/**
 * Customers module page (`/customers`): searchable CRM list with booking
 * statistics and tags. Rows open the customer detail page.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CustomersTableModule } from "@/components/customers/customers-module";
import { PageHeader } from "@/components/layout/page-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.customers");
  return { title: t("title") };
}

export default async function CustomersPage() {
  const t = await getTranslations("modules.customers");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CustomersTableModule />
    </div>
  );
}
