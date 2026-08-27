"use client";

/**
 * Shift overrides for single dates (day off or custom hours):
 * `POST .../shift-overrides` and `DELETE .../shift-overrides/{id}`.
 * The API has no list endpoint for overrides yet, so only the ones created in
 * this session are shown (with a note); deleting works on those.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  useCreateShiftOverride,
  useDeleteShiftOverride,
  type ShiftOverride,
} from "@/hooks/use-staff";
import { toTimeInputValue } from "@/lib/format";
import { applyApiError, toastApiError } from "@/lib/form-errors";
import { ValidationKeys, isTimeRangeValid, requiredString, useFieldError } from "@/lib/validation";

const formSchema = z
  .object({
    date: requiredString,
    off: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  })
  .refine((v) => v.off || isTimeRangeValid(v.startTime, v.endTime), {
    message: ValidationKeys.timeRange,
    path: ["endTime"],
  });

type FormValues = z.infer<typeof formSchema>;

export function StaffOverrides({ salonId, staffId }: { salonId: number; staffId: number }) {
  const t = useTranslations("staff.overrides");
  const tCommon = useTranslations("common");
  const fieldError = useFieldError();
  const createOverride = useCreateShiftOverride(salonId);
  const deleteOverride = useDeleteShiftOverride(salonId);
  const [created, setCreated] = useState<ShiftOverride[]>([]);

  const { register, control, handleSubmit, reset, setError, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { date: "", off: true, startTime: "09:00", endTime: "17:00" },
  });
  const isOff = useWatch({ control, name: "off" });
  const { errors } = formState;

  const onSubmit = (values: FormValues) =>
    createOverride.mutate(
      {
        staffId,
        body: values.off
          ? { date: values.date, off: true }
          : { date: values.date, off: false, startTime: values.startTime, endTime: values.endTime },
      },
      {
        onSuccess: (override) => {
          toast.success(t("added"));
          setCreated((list) => [...list, override]);
          reset();
        },
        onError: (error) => applyApiError(error, setError),
      }
    );

  const remove = (overrideId: number) =>
    deleteOverride.mutate(
      { staffId, overrideId },
      {
        onSuccess: () => {
          toast.success(t("deleted"));
          setCreated((list) => list.filter((o) => o.id !== overrideId));
        },
        onError: toastApiError,
      }
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-wrap items-end gap-3"
        >
          <Field data-invalid={Boolean(errors.date)} className="w-44">
            <FieldLabel htmlFor="override-date">{t("date")}</FieldLabel>
            <Input id="override-date" type="date" {...register("date")} />
            <FieldError>{fieldError(errors.date?.message)}</FieldError>
          </Field>
          <Field orientation="horizontal" className="w-auto pb-2">
            <Controller
              control={control}
              name="off"
              render={({ field }) => (
                <Switch id="override-off" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <FieldLabel htmlFor="override-off">{isOff ? t("dayOff") : t("customHours")}</FieldLabel>
          </Field>
          {!isOff ? (
            <>
              <Field className="w-32">
                <FieldLabel htmlFor="override-start">{t("start")}</FieldLabel>
                <Input id="override-start" type="time" {...register("startTime")} />
              </Field>
              <Field data-invalid={Boolean(errors.endTime)} className="w-32">
                <FieldLabel htmlFor="override-end">{t("end")}</FieldLabel>
                <Input id="override-end" type="time" {...register("endTime")} />
                <FieldError>{fieldError(errors.endTime?.message)}</FieldError>
              </Field>
            </>
          ) : null}
          <Button type="submit" disabled={createOverride.isPending}>
            {t("add")}
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">{t("sessionNote")}</p>
        {created.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="grid gap-2">
            {created.map((override) => (
              <li key={override.id} className="flex items-center gap-3 text-sm">
                <span className="font-medium">{override.date}</span>
                <span className="text-muted-foreground">
                  {override.off
                    ? t("dayOff")
                    : `${toTimeInputValue(override.startTime)} – ${toTimeInputValue(override.endTime)}`}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tCommon("remove")}
                  onClick={() => remove(override.id)}
                  disabled={deleteOverride.isPending}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
