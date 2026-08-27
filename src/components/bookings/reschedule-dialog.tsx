"use client";

/**
 * Dialog to move a booking to another date/time and optionally another staff
 * member, using the availability slots of the booking's services.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ANY_STAFF, SlotPicker, type SlotPickerValue } from "@/components/bookings/slot-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRescheduleBookingMutation, type Booking } from "@/hooks/use-bookings";
import { useCurrentSalon } from "@/hooks/use-salons";
import { useStaffList } from "@/hooks/use-staff";
import { ErrorCodes, toApiError } from "@/lib/api-error";
import { toIsoDate } from "@/lib/format";

interface RescheduleDialogProps {
  salonId: number;
  booking: Booking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RescheduleDialog({ salonId, booking, open, onOpenChange }: RescheduleDialogProps) {
  const t = useTranslations("bookings");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("reschedule.title")}</DialogTitle>
          <DialogDescription>{t("reschedule.description")}</DialogDescription>
        </DialogHeader>
        {/* Mounted only while open so the picker starts from the booking's current slot each time. */}
        {open ? (
          <RescheduleForm salonId={salonId} booking={booking} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RescheduleForm({ salonId, booking, onOpenChange }: Omit<RescheduleDialogProps, "open">) {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const { timezone } = useCurrentSalon();
  const staff = useStaffList(salonId);
  const mutation = useRescheduleBookingMutation(salonId);
  const [value, setValue] = useState<SlotPickerValue>(() => ({
    date: toIsoDate(new Date(booking.startAt), timezone),
    staffId: String(booking.staff.id),
    startAt: "",
  }));
  const [slotError, setSlotError] = useState<string | undefined>();

  const submit = () => {
    if (!value.startAt) {
      setSlotError(t("validation.slotRequired"));
      return;
    }
    mutation.mutate(
      {
        bookingId: booking.id,
        startAt: value.startAt,
        staffId: value.staffId !== ANY_STAFF ? Number(value.staffId) : undefined,
      },
      {
        onSuccess: () => {
          toast.success(t("toast.rescheduled"));
          onOpenChange(false);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          toast.error(
            apiError.code === ErrorCodes.SLOT_UNAVAILABLE
              ? t("toast.slotUnavailable")
              : apiError.message
          );
        },
      }
    );
  };

  return (
    <>
      <SlotPicker
        salonId={salonId}
        serviceIds={booking.items.map((item) => item.serviceId)}
        staff={staff.data ?? []}
        value={value}
        onChange={(next) => {
          setValue(next);
          setSlotError(undefined);
        }}
        slotError={slotError}
      />
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
          {tCommon("cancel")}
        </Button>
        <Button onClick={submit} disabled={mutation.isPending}>
          {t("reschedule.submit")}
        </Button>
      </DialogFooter>
    </>
  );
}
