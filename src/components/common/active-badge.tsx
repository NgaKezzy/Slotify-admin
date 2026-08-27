/**
 * Small "Active / Inactive" badge shared by staff, services and coupons lists.
 * Colours come from the status tokens so active/inactive look the same everywhere.
 */
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ActiveBadge({ active }: { active: boolean }) {
  const t = useTranslations("common");
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        active
          ? "border-status-completed/30 bg-status-completed/15 text-status-completed"
          : "border-status-cancelled/30 bg-status-cancelled/15 text-status-cancelled"
      )}
    >
      {active ? t("active") : t("inactive")}
    </Badge>
  );
}
