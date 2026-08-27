/**
 * Badge for payment transaction statuses (PENDING / SUCCEEDED / FAILED /
 * REFUNDED / PARTIAL_REFUND) using the shared `--status-*` tokens.
 */
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import type { PaymentTransactionStatus } from "@/hooks/use-payments";
import { cn } from "@/lib/utils";

const CLASSES: Record<PaymentTransactionStatus, string> = {
  PENDING: "bg-status-pending/15 text-status-pending border-status-pending/30",
  SUCCEEDED: "bg-status-completed/15 text-status-completed border-status-completed/30",
  FAILED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
  REFUNDED: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
  PARTIAL_REFUND: "bg-status-no-show/15 text-status-no-show border-status-no-show/30",
};

export function PaymentTransactionBadge({ status }: { status: PaymentTransactionStatus }) {
  const t = useTranslations("payments.status");
  return (
    <Badge variant="outline" className={cn("font-medium", CLASSES[status])}>
      {t(status)}
    </Badge>
  );
}
