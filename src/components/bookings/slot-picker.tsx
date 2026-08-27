"use client";

/**
 * Date + staff + time-slot picker backed by the availability endpoint.
 * Used by the reschedule and walk-in dialogs. Controlled: the parent owns the
 * selected date (`YYYY-MM-DD`), staff id and start instant (ISO).
 */
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailability } from "@/hooks/use-availability";
import { useCurrentSalon } from "@/hooks/use-salons";
import type { Staff } from "@/hooks/use-staff";
import { toApiError } from "@/lib/api-error";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Sentinel for "any available staff member". */
export const ANY_STAFF = "any";

export interface SlotPickerValue {
  date: string;
  /** Staff id, or `ANY_STAFF`. */
  staffId: string;
  /** Selected start instant (ISO) or "". */
  startAt: string;
}

interface SlotPickerProps {
  salonId: number;
  serviceIds: number[];
  staff: Staff[];
  value: SlotPickerValue;
  onChange: (value: SlotPickerValue) => void;
  /** Validation message for the slot (from the form). */
  slotError?: string;
  /** Validation message for the staff select (from the form). */
  staffError?: string;
  /** Allows choosing "any staff"; the backend then auto-assigns. */
  allowAnyStaff?: boolean;
}

export function SlotPicker({
  salonId,
  serviceIds,
  staff,
  value,
  onChange,
  slotError,
  staffError,
  allowAnyStaff = true,
}: SlotPickerProps) {
  const t = useTranslations("bookings.slot");
  const locale = useLocale();
  const { timezone } = useCurrentSalon();
  const staffId = value.staffId !== ANY_STAFF ? Number(value.staffId) : undefined;
  const availability = useAvailability(salonId, { date: value.date, serviceIds, staffId });

  const set = (patch: Partial<SlotPickerValue>) => onChange({ ...value, startAt: "", ...patch });

  // Staff who can perform every selected service (the API auto-assigns otherwise).
  const eligibleStaff = staff.filter(
    (member) => member.active && serviceIds.every((id) => member.serviceIds.includes(id))
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="slot-date">{t("date")}</FieldLabel>
          <Input
            id="slot-date"
            type="date"
            value={value.date}
            onChange={(e) => set({ date: e.target.value })}
          />
        </Field>
        <Field data-invalid={Boolean(staffError)}>
          <FieldLabel htmlFor="slot-staff">{t("staff")}</FieldLabel>
          <Select
            value={!allowAnyStaff && value.staffId === ANY_STAFF ? null : value.staffId}
            onValueChange={(v) => set({ staffId: v ?? ANY_STAFF })}
          >
            <SelectTrigger id="slot-staff" className="w-full" aria-invalid={Boolean(staffError)}>
              <SelectValue placeholder={t("staff")} />
            </SelectTrigger>
            <SelectContent>
              {allowAnyStaff ? <SelectItem value={ANY_STAFF}>{t("anyStaff")}</SelectItem> : null}
              {eligibleStaff.map((member) => (
                <SelectItem key={member.id} value={String(member.id)}>
                  {member.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError>{staffError}</FieldError>
        </Field>
      </div>
      <Field data-invalid={Boolean(slotError)}>
        <FieldLabel>{t("time")}</FieldLabel>
        {serviceIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("pickServices")}</p>
        ) : availability.isLoading ? (
          <div className="grid grid-cols-4 gap-2" aria-label={t("loading")}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        ) : availability.error ? (
          <p className="text-sm text-destructive">{toApiError(availability.error).message}</p>
        ) : !availability.data?.slots.length ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <div className="grid max-h-56 grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-5">
            {availability.data.slots.map((slot) => (
              <Button
                key={slot.startAt}
                type="button"
                size="sm"
                variant={value.startAt === slot.startAt ? "default" : "outline"}
                className={cn("tabular-nums")}
                onClick={() => onChange({ ...value, startAt: slot.startAt })}
              >
                {formatTime(slot.startAt, timezone, locale)}
              </Button>
            ))}
          </div>
        )}
        <FieldError>{slotError}</FieldError>
      </Field>
    </div>
  );
}
