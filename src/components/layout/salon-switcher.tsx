"use client";

/**
 * Salon switcher for owners managing several salons. Loads `GET /admin/salons`
 * and stores the selection in `useSalonStore`. Used in `AppHeader`.
 */
import { Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentSalon } from "@/hooks/use-salons";

export function SalonSwitcher() {
  const t = useTranslations("salonSwitcher");
  const { salons, salonId, setSalonId, summary, isLoading } = useCurrentSalon();

  if (isLoading && !summary) return <Skeleton className="h-8 w-40" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" aria-label={t("label")} />}>
        <Store className="size-4" />
        <span className="max-w-40 truncate">{summary?.name ?? t("none")}</span>
        <ChevronsUpDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {salons.map((salon) => (
          <DropdownMenuItem key={salon.id} onClick={() => setSalonId(salon.id)}>
            <span className="flex-1 truncate">{salon.name}</span>
            <span className="text-xs text-muted-foreground">{salon.city}</span>
            {salon.id === salonId ? <Check className="size-4" /> : null}
          </DropdownMenuItem>
        ))}
        {salons.length === 0 ? <DropdownMenuItem disabled>{t("none")}</DropdownMenuItem> : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings/new" />}>
          <Plus className="size-4" />
          {t("create")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
