"use client";

/**
 * Opening hours editor: one row per weekday with a "closed" toggle and
 * open/close times; saves with `PUT .../opening-hours`.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SalonDetail } from "@/hooks/use-salons";
import { useUpdateOpeningHours, type OpeningHour } from "@/hooks/use-settings";
import { DAYS_OF_WEEK, type DayOfWeek } from "@/hooks/use-staff";
import { toTimeInputValue } from "@/lib/format";
import { toastApiError } from "@/lib/form-errors";
import { isTimeRangeValid } from "@/lib/validation";

/** Pre-filled hours when a day is switched from closed to open. */
const DEFAULT_OPEN = "09:00";
const DEFAULT_CLOSE = "18:00";

interface Row {
  day: DayOfWeek;
  closed: boolean;
  openTime: string;
  closeTime: string;
}

function toRows(hours: OpeningHour[] | undefined): Row[] {
  return DAYS_OF_WEEK.map((day) => {
    const entry = hours?.find((h) => h.day === day);
    return {
      day,
      closed: entry?.closed ?? !entry,
      openTime: toTimeInputValue(entry?.openTime) || DEFAULT_OPEN,
      closeTime: toTimeInputValue(entry?.closeTime) || DEFAULT_CLOSE,
    };
  });
}

function toRequest(rows: Row[]): OpeningHour[] {
  return rows.map((row) =>
    row.closed
      ? { day: row.day, closed: true }
      : { day: row.day, closed: false, openTime: row.openTime, closeTime: row.closeTime }
  );
}

export function OpeningHoursForm({ salon }: { salon: SalonDetail }) {
  const t = useTranslations("settings.hours");
  const tCommon = useTranslations("common");
  const update = useUpdateOpeningHours(salon.id);
  const [rows, setRows] = useState<Row[]>(() => toRows(salon.openingHours));
  const [syncedHours, setSyncedHours] = useState(salon.openingHours);

  // Reload the local copy when the salon detail refreshes (e.g. after saving).
  if (syncedHours !== salon.openingHours) {
    setSyncedHours(salon.openingHours);
    setRows(toRows(salon.openingHours));
  }

  const patch = (day: DayOfWeek, changes: Partial<Row>) =>
    setRows((current) => current.map((row) => (row.day === day ? { ...row, ...changes } : row)));

  const save = () => {
    const valid = rows.every((row) => row.closed || isTimeRangeValid(row.openTime, row.closeTime));
    if (!valid) {
      toast.error(t("invalidRange"));
      return;
    }
    update.mutate(toRequest(rows), {
      onSuccess: () => toast.success(t("saved")),
      onError: toastApiError,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map((row) => {
          const invalid = !row.closed && !isTimeRangeValid(row.openTime, row.closeTime);
          return (
            <div key={row.day} className="grid items-center gap-3 sm:grid-cols-[8rem_7rem_1fr]">
              <span className="text-sm font-medium">{tCommon(`days.${row.day}`)}</span>
              <div className="flex items-center gap-2">
                <Switch
                  id={`hours-${row.day}`}
                  checked={!row.closed}
                  onCheckedChange={(open) => patch(row.day, { closed: !open })}
                />
                <label htmlFor={`hours-${row.day}`} className="text-sm text-muted-foreground">
                  {row.closed ? t("closed") : t("open")}
                </label>
              </div>
              {!row.closed ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="w-32"
                    aria-label={t("open")}
                    aria-invalid={invalid}
                    value={row.openTime}
                    onChange={(e) => patch(row.day, { openTime: e.target.value })}
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="time"
                    className="w-32"
                    aria-label={t("close")}
                    aria-invalid={invalid}
                    value={row.closeTime}
                    onChange={(e) => patch(row.day, { closeTime: e.target.value })}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={save} disabled={update.isPending}>
          {update.isPending ? tCommon("saving") : tCommon("save")}
        </Button>
      </CardFooter>
    </Card>
  );
}
