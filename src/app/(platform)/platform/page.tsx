/**
 * Platform overview page (`/platform`) for SUPER_ADMIN: salon approval, users,
 * categories and platform settings. Placeholder until Phase 3.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.platform");
  return { title: t("title") };
}

export default function PlatformPage() {
  return <ModulePlaceholder moduleKey="platform" />;
}
