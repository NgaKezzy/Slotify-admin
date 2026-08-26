"use client";

/**
 * Salon switcher placeholder for owners managing several salons.
 * Phase 0 shows a single demo salon; Phase 3 loads `GET /admin/salons` and
 * stores the selection in a Zustand store. Used in `AppHeader`.
 */
import { ChevronsUpDown, Store } from "lucide-react";
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

export function SalonSwitcher() {
  const t = useTranslations("salonSwitcher");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" aria-label={t("label")} />}>
        <Store className="size-4" />
        <span className="max-w-40 truncate">{t("demoSalon")}</span>
        <ChevronsUpDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>{t("demoSalon")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
