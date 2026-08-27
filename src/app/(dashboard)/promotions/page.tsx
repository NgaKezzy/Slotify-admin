/**
 * Promotions module page (`/promotions`): coupons CRUD.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CouponsPage } from "@/components/promotions/coupons-table";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("promotions");
  return { title: t("title") };
}

export default function PromotionsPage() {
  return <CouponsPage />;
}
