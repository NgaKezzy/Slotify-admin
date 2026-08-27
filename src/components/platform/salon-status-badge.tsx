/**
 * Badge for platform salon statuses (PENDING / ACTIVE / SUSPENDED).
 */
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { PlatformSalonStatus } from "@/hooks/use-platform";
import { cn } from "@/lib/utils";

const CLASSES: Record<PlatformSalonStatus, string> = {
  PENDING: "bg-status-pending/15 text-status-pending border-status-pending/30",
  ACTIVE: "bg-status-completed/15 text-status-completed border-status-completed/30",
  SUSPENDED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
};

export function SalonStatusBadge({ status }: { status: PlatformSalonStatus }) {
  const t = useTranslations("platform.overview.salonStatus");
  return (
    <Badge variant="outline" className={cn("font-medium", CLASSES[status])}>
      {t(status)}
    </Badge>
  );
}
