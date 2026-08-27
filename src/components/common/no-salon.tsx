"use client";

/**
 * Shown on every salon-scoped page while no salon is selected: either the
 * salons are still loading, or the owner has not created one yet.
 */
import { Store } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { Button } from "@/components/ui/button";
import { useCurrentSalon } from "@/hooks/use-salons";

/** Wraps page content; renders it only once a salon is selected. */
export function RequireSalon({ children }: { children: (salonId: number) => React.ReactNode }) {
  const t = useTranslations("salonSwitcher");
  const { salonId, isLoading, hasSalons } = useCurrentSalon();

  if (salonId !== null) return <>{children(salonId)}</>;
  if (isLoading) return <PageSkeleton />;
  if (!hasSalons) {
    return (
      <EmptyState
        icon={<Store className="size-6" />}
        title={t("noneTitle")}
        description={t("noneDescription")}
        action={<Button render={<Link href="/settings/new" />}>{t("create")}</Button>}
      />
    );
  }
  return <PageSkeleton />;
}
