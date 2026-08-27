"use client";

/**
 * "Time off" tab: lists absences (`GET .../time-off`), adds one
 * (`POST .../time-off`) and removes one after confirmation (`DELETE`).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  useCreateTimeOff,
  useDeleteTimeOff,
  useStaffTimeOff,
  type TimeOff,
} from "@/hooks/use-staff";
import { fromDateTimeInputValue } from "@/lib/format";
import { applyApiError, toastApiError } from "@/lib/form-errors";
import { ValidationKeys, optionalString, requiredString, useFieldError } from "@/lib/validation";

const formSchema = z
  .object({ startAt: requiredString, endAt: requiredString, reason: optionalString })
  .refine((v) => v.startAt < v.endAt, { message: ValidationKeys.dateRange, path: ["endAt"] });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

export function StaffTimeOff({ salonId, staffId }: { salonId: number; staffId: number }) {
  const t = useTranslations("staff.timeOff");
  const tCommon = useTranslations("common");
  const fieldError = useFieldError();
  const timeOff = useStaffTimeOff(salonId, staffId);
  const createTimeOff = useCreateTimeOff(salonId);
  const deleteTimeOff = useDeleteTimeOff(salonId);
  const [deleting, setDeleting] = useState<TimeOff | null>(null);

  const { register, handleSubmit, reset, setError, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({
    resolver: zodResolver(formSchema),
    defaultValues: { startAt: "", endAt: "", reason: "" },
  });
  const { errors } = formState;

  const onSubmit = (values: FormValues) =>
    createTimeOff.mutate(
      {
        staffId,
        body: {
          startAt: fromDateTimeInputValue(values.startAt) ?? "",
          endAt: fromDateTimeInputValue(values.endAt) ?? "",
          reason: values.reason,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("added"));
          reset();
        },
        onError: (error) => applyApiError(error, setError),
      }
    );

  const confirmDelete = () => {
    if (!deleting) return;
    deleteTimeOff.mutate(
      { staffId, timeOffId: deleting.id },
      {
        onSuccess: () => {
          toast.success(t("deleted"));
          setDeleting(null);
        },
        onError: toastApiError,
      }
    );
  };

  const columns: DataTableColumn<TimeOff>[] = [
    { key: "start", header: t("startAt"), cell: (row) => <DateTime iso={row.startAt} /> },
    { key: "end", header: t("endAt"), cell: (row) => <DateTime iso={row.endAt} /> },
    { key: "reason", header: t("reason"), cell: (row) => row.reason ?? "—" },
    {
      key: "status",
      header: tCommon("actions"),
      className: "w-40 text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Badge variant="secondary">{t(`status.${row.status}`)}</Badge>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={tCommon("remove")}
            onClick={() => setDeleting(row)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-wrap items-end gap-3"
          >
            <Field data-invalid={Boolean(errors.startAt)} className="w-56">
              <FieldLabel htmlFor="timeoff-start">{t("startAt")}</FieldLabel>
              <Input id="timeoff-start" type="datetime-local" {...register("startAt")} />
              <FieldError>{fieldError(errors.startAt?.message)}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.endAt)} className="w-56">
              <FieldLabel htmlFor="timeoff-end">{t("endAt")}</FieldLabel>
              <Input id="timeoff-end" type="datetime-local" {...register("endAt")} />
              <FieldError>{fieldError(errors.endAt?.message)}</FieldError>
            </Field>
            <Field className="min-w-48 flex-1">
              <FieldLabel htmlFor="timeoff-reason">{t("reason")}</FieldLabel>
              <Input id="timeoff-reason" {...register("reason")} />
            </Field>
            <Button type="submit" disabled={createTimeOff.isPending}>
              {t("add")}
            </Button>
            <FieldDescription className="basis-full">{t("localTimeHint")}</FieldDescription>
          </form>
        </CardContent>
      </Card>
      <DataTable
        columns={columns}
        rows={timeOff.data}
        rowKey={(row) => row.id}
        isLoading={timeOff.isLoading}
        emptyMessage={t("empty")}
        skeletonRows={3}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle")}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={deleteTimeOff.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
