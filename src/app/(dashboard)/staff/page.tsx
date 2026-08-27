/**
 * Staff module page (`/staff`): team list with create/edit/delete actions.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { StaffList } from "@/components/staff/staff-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("staff");
  return { title: t("title") };
}

export default function StaffPage() {
  return <StaffList />;
}
