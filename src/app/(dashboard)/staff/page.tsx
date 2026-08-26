/**
 * Staff module page (`/staff`). Placeholder until the module is implemented in Phase 3.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ModulePlaceholder } from "@/components/layout/module-placeholder";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("modules.staff");
  return { title: t("title") };
}

export default function StaffPage() {
  return <ModulePlaceholder moduleKey="staff" />;
}
