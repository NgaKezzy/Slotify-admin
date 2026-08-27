/**
 * Platform categories page (`/platform/categories`): salon category CRUD.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { CategoriesList } from "@/components/platform/categories-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("platform.catalog.categories");
  return { title: t("title") };
}

export default async function CategoriesListPage() {
  const t = await getTranslations("platform.catalog.categories");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <CategoriesList />
    </div>
  );
}
