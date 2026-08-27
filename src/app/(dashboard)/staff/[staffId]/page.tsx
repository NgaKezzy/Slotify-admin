/**
 * Staff detail page (`/staff/[staffId]`): profile, services, shifts and time off tabs.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { StaffDetail } from "@/components/staff/staff-detail";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("staff");
  return { title: t("title") };
}

export default async function StaffDetailPage({ params }: PageProps<"/staff/[staffId]">) {
  const { staffId } = await params;
  const id = Number(staffId);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <StaffDetail staffId={id} />;
}
