/**
 * Settings module page (`/settings`). Placeholder until the module is implemented in Phase 3.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.settings");
  return { title: t("title") };
}

export default function SettingsPage() {
  return <ModulePlaceholder moduleKey="settings" />;
}
