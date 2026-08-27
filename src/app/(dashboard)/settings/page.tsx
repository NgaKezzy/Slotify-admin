/**
 * Settings module page (`/settings`): salon profile, opening hours, booking rules and gallery.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SettingsTabs } from "@/components/settings/settings-tabs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("settings");
  return { title: t("title") };
}

export default function SettingsPage() {
  return <SettingsTabs />;
}
