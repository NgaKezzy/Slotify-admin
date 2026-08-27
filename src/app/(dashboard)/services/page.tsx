/**
 * Services module page (`/services`): categories and services CRUD.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ServicesPage } from "@/components/services/services-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("services");
  return { title: t("title") };
}

export default function ServicesRoute() {
  return <ServicesPage />;
}
