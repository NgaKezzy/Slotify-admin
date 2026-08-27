/**
 * Coloured badge for booking / payment statuses. Colours come from the
 * `--status-*` tokens in `globals.css` so they stay in sync with the mobile app.
 */
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BookingStatus =
  "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "REJECTED";

export type PaymentStatus = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";

const BOOKING_CLASSES: Record<BookingStatus, string> = {
  PENDING: "bg-status-pending/15 text-status-pending border-status-pending/30",
  CONFIRMED: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30",
  IN_PROGRESS: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30",
  COMPLETED: "bg-status-completed/15 text-status-completed border-status-completed/30",
  CANCELLED: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
  NO_SHOW: "bg-status-no-show/15 text-status-no-show border-status-no-show/30",
  REJECTED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
};

const PAYMENT_CLASSES: Record<PaymentStatus, string> = {
  UNPAID: "bg-status-pending/15 text-status-pending border-status-pending/30",
  PAID: "bg-status-completed/15 text-status-completed border-status-completed/30",
  PARTIALLY_PAID: "bg-status-confirmed/15 text-status-confirmed border-status-confirmed/30",
  REFUNDED: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const t = useTranslations("status.booking");
  return (
    <Badge variant="outline" className={cn("font-medium", BOOKING_CLASSES[status])}>
      {t(status)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations("status.payment");
  return (
    <Badge variant="outline" className={cn("font-medium", PAYMENT_CLASSES[status])}>
      {t(status)}
    </Badge>
  );
}
