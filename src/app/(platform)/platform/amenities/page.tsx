/**
 * Platform amenities page (`/platform/amenities`): amenity CRUD.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { AmenitiesList } from "@/components/platform/amenities-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.catalog.amenities");
  return { title: t("title") };
}

export default async function AmenitiesListPage() {
  const t = await getTranslations("platform.catalog.amenities");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AmenitiesList />
    </div>
  );
}
