"use client";

/**
 * Weekly shifts editor (Mon-Sun grid, several windows per day). Edits a local
 * copy of the schedule and replaces it with `PUT .../staff/{id}/shifts` on save.
 * The API rejects overlapping windows with error 4006, shown as a friendly toast.
 */
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DAYS_OF_WEEK,
  useReplaceStaffShifts,
  useStaffShifts,
  type DayOfWeek,
  type Shift,
  type ShiftInput,
} from "@/hooks/use-staff";
import { ErrorCodes } from "@/lib/api-error";
import { toTimeInputValue } from "@/lib/format";
import { applyApiError } from "@/lib/form-errors";
import { isTimeRangeValid } from "@/lib/validation";

/** Default window pre-filled when the owner adds a shift. */
const DEFAULT_WINDOW = { startTime: "09:00", endTime: "17:00" };

type Window = { startTime: string; endTime: string };
type Schedule = Record<DayOfWeek, Window[]>;

function toSchedule(shifts: Shift[] | undefined): Schedule {
  const schedule = Object.fromEntries(DAYS_OF_WEEK.map((day) => [day, []])) as unknown as Schedule;
  for (const shift of shifts ?? []) {
    schedule[shift.dayOfWeek].push({
      startTime: toTimeInputValue(shift.startTime),
      endTime: toTimeInputValue(shift.endTime),
    });
  }
  return schedule;
}

function toRequest(schedule: Schedule): ShiftInput[] {
  return DAYS_OF_WEEK.flatMap((day) =>
    schedule[day].map((window) => ({ dayOfWeek: day, ...window }))
  );
}

export function StaffShiftsEditor({ salonId, staffId }: { salonId: number; staffId: number }) {
  const t = useTranslations("staff.shifts");
  const tCommon = useTranslations("common");
  const shifts = useStaffShifts(salonId, staffId);
  const replaceShifts = useReplaceStaffShifts(salonId);
  const [schedule, setSchedule] = useState<Schedule>(() => toSchedule(shifts.data));
  const [syncedShifts, setSyncedShifts] = useState(shifts.data);

  // Reload the local copy when the API data changes (initial load, after save).
  if (syncedShifts !== shifts.data) {
    setSyncedShifts(shifts.data);
    setSchedule(toSchedule(shifts.data));
  }

  const updateWindow = (day: DayOfWeek, index: number, patch: Partial<Window>) =>
    setSchedule((current) => ({
      ...current,
      [day]: current[day].map((window, i) => (i === index ? { ...window, ...patch } : window)),
    }));

  const addWindow = (day: DayOfWeek) =>
    setSchedule((current) => ({ ...current, [day]: [...current[day], { ...DEFAULT_WINDOW }] }));

  const removeWindow = (day: DayOfWeek, index: number) =>
    setSchedule((current) => ({
      ...current,
      [day]: current[day].filter((_, i) => i !== index),
    }));

  const save = () => {
    const allValid = DAYS_OF_WEEK.every((day) =>
      schedule[day].every((window) => isTimeRangeValid(window.startTime, window.endTime))
    );
    if (!allValid) {
      toast.error(t("invalidRange"));
      return;
    }
    replaceShifts.mutate(
      { staffId, shifts: toRequest(schedule) },
      {
        onSuccess: () => toast.success(t("saved")),
        onError: (error) => {
          const apiError = applyApiError(error);
          if (apiError.code === ErrorCodes.SHIFT_OVERLAP) toast.error(t("overlap"));
        },
      }
    );
  };

  if (shifts.isLoading) return <Skeleton className="h-72" />;

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="grid gap-2 border-b pb-3 last:border-b-0 sm:grid-cols-[8rem_1fr]"
          >
            <span className="pt-1.5 text-sm font-medium">{tCommon(`days.${day}`)}</span>
            <div className="grid gap-2">
              {schedule[day].length === 0 ? (
                <span className="pt-1.5 text-sm text-muted-foreground">{t("noWindows")}</span>
              ) : null}
              {schedule[day].map((window, index) => {
                const invalid = !isTimeRangeValid(window.startTime, window.endTime);
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="time"
                      aria-label={`${tCommon(`days.${day}`)} ${tCommon("from")}`}
                      aria-invalid={invalid}
                      className="w-32"
                      value={window.startTime}
                      onChange={(e) => updateWindow(day, index, { startTime: e.target.value })}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      aria-label={`${tCommon(`days.${day}`)} ${tCommon("to")}`}
                      aria-invalid={invalid}
                      className="w-32"
                      value={window.endTime}
                      onChange={(e) => updateWindow(day, index, { endTime: e.target.value })}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={tCommon("remove")}
                      onClick={() => removeWindow(day, index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => addWindow(day)}
              >
                <Plus className="size-3.5" />
                {t("addWindow")}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={save} disabled={replaceShifts.isPending}>
          {replaceShifts.isPending ? tCommon("saving") : tCommon("save")}
        </Button>
      </CardFooter>
    </Card>
  );
}
