/**
 * Promotions module page (`/promotions`). Placeholder until the module is implemented in Phase 3.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.promotions");
  return { title: t("title") };
}

export default function PromotionsPage() {
  return <ModulePlaceholder moduleKey="promotions" />;
}
