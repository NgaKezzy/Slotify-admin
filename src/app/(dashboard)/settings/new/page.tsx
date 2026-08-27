/**
 * "Create a salon" page (`/settings/new`): salon profile form in create mode.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NewSalon } from "@/components/settings/new-salon";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings.newSalon");
  return { title: t("title") };
}

export default function NewSalonPage() {
  return <NewSalon />;
}
