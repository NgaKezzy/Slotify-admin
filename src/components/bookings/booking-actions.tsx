"use client";

/**
 * Action buttons for a booking, derived from the state machine (backend §3.5):
 * PENDING → confirm / reject / cancel · CONFIRMED → start / no-show / cancel ·
 * IN_PROGRESS → complete. Reschedule is offered while the booking is still open
 * and "mark paid" while it is unpaid. Reject/cancel ask for a reason first.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { RescheduleDialog } from "@/components/bookings/reschedule-dialog";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { useBookingActionMutation, type Booking, type BookingAction } from "@/hooks/use-bookings";
import { toApiError } from "@/lib/api-error";

/** Actions available per status, in display order. */
const ACTIONS_BY_STATUS: Record<Booking["status"], BookingAction[]> = {
  PENDING: ["confirm", "reject", "cancel"],
  CONFIRMED: ["start", "noShow", "cancel"],
  IN_PROGRESS: ["complete"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
  REJECTED: [],
};

/** Statuses that can still be moved to another slot. */
const RESCHEDULABLE: Booking["status"][] = ["PENDING", "CONFIRMED"];
/** Statuses where a cash payment can still be recorded. */
const PAYABLE: Booking["status"][] = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];
/** Actions that need a reason and a confirmation dialog. */
type ReasonAction = Extract<BookingAction, "reject" | "cancel">;

const DESTRUCTIVE: BookingAction[] = ["reject", "cancel", "noShow"];

export function BookingActions({ salonId, booking }: { salonId: number; booking: Booking }) {
  const t = useTranslations("bookings");
  const mutation = useBookingActionMutation(salonId);
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const run = (action: BookingAction, reasonText?: string) =>
    mutation.mutate(
      { bookingId: booking.id, action, reason: reasonText },
      {
        onSuccess: () => {
          toast.success(t(`toast.${action}`));
          setReasonAction(null);
          setReason("");
        },
        onError: (error) => toast.error(toApiError(error).message),
      }
    );

  const onClick = (action: BookingAction) => {
    if (action === "reject" || action === "cancel") {
      setReason("");
      setReasonError(false);
      setReasonAction(action);
      return;
    }
    run(action);
  };

  const submitReason = () => {
    if (!reasonAction) return;
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    run(reasonAction, reason.trim());
  };

  const actions = ACTIONS_BY_STATUS[booking.status];
  const canReschedule = RESCHEDULABLE.includes(booking.status);
  const canMarkPaid = PAYABLE.includes(booking.status) && booking.paymentStatus === "UNPAID";
  if (actions.length === 0 && !canReschedule && !canMarkPaid) return null;

  return (
    <div className="flex flex-wrap gap-2 pb-4">
      {actions.map((action) => (
        <Button
          key={action}
          variant={DESTRUCTIVE.includes(action) ? "outline" : "default"}
          className={DESTRUCTIVE.includes(action) ? "text-destructive" : undefined}
          disabled={mutation.isPending}
          onClick={() => onClick(action)}
        >
          {t(`actions.${action}`)}
        </Button>
      ))}
      {canReschedule ? (
        <Button
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => setRescheduleOpen(true)}
        >
          {t("actions.reschedule")}
        </Button>
      ) : null}
      {canMarkPaid ? (
        <Button
          variant="secondary"
          disabled={mutation.isPending}
          onClick={() => onClick("markPaid")}
        >
          {t("actions.markPaid")}
        </Button>
      ) : null}

      <ConfirmDialog
        open={reasonAction !== null}
        onOpenChange={(open) => !open && setReasonAction(null)}
        title={reasonAction ? t(`${reasonAction}.title`) : ""}
        description={reasonAction ? t(`${reasonAction}.description`) : undefined}
        confirmLabel={reasonAction ? t(`${reasonAction}.submit`) : undefined}
        destructive
        isPending={mutation.isPending}
        onConfirm={submitReason}
      >
        <Field data-invalid={reasonError}>
          <FieldLabel htmlFor="booking-reason">
            {reasonAction ? t(`${reasonAction}.reason`) : ""}
          </FieldLabel>
          <Textarea
            id="booking-reason"
            value={reason}
            aria-invalid={reasonError}
            onChange={(e) => {
              setReason(e.target.value);
              setReasonError(false);
            }}
          />
          <FieldError>{reasonError ? t("reasonRequired") : undefined}</FieldError>
        </Field>
      </ConfirmDialog>

      <RescheduleDialog
        salonId={salonId}
        booking={booking}
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
      />
    </div>
  );
}
