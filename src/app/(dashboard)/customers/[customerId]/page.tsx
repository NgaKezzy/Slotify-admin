/**
 * Customer detail page (`/customers/[customerId]`): contact, statistics, tags,
 * notes and recent bookings for one customer of the selected salon.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CustomerDetailModule } from "@/components/customers/customer-detail-module";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customers.detail");
  return { title: t("title") };
}

export default async function CustomerDetailPage({ params }: PageProps<"/customers/[customerId]">) {
  const { customerId } = await params;
  const id = Number(customerId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return <CustomerDetailModule customerId={id} />;
}
