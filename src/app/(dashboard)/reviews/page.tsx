/**
 * Reviews module page (`/reviews`): rating summary, review list with reply and
 * hide/show actions for the selected salon.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ReviewsListModule } from "@/components/reviews/reviews-module";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.reviews");
  return { title: t("title") };
}

export default async function ReviewsPage() {
  const t = await getTranslations("modules.reviews");
  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ReviewsListModule />
    </div>
  );
}
