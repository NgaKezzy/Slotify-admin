"use client";

/**
 * Booking rules & payment settings form (`PUT .../settings`): slot interval,
 * advance limits, cancellation deadline, auto-confirm, deposit and accepted
 * payment methods.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import type { SalonDetail } from "@/hooks/use-salons";
import { useUpdateSalonSettings, type SalonSettings } from "@/hooks/use-settings";
import { applyApiError } from "@/lib/form-errors";
import { ValidationKeys, nonNegativeNumber, positiveNumber, useFieldError } from "@/lib/validation";

const MAX_PERCENT = 100;

const formSchema = z.object({
  slotIntervalMin: positiveNumber,
  minAdvanceBookingMin: nonNegativeNumber,
  maxAdvanceDays: positiveNumber,
  cancelBeforeMin: nonNegativeNumber,
  autoConfirm: z.boolean(),
  requireDeposit: z.boolean(),
  depositPercent: z.coerce
    .number<string | number>()
    .min(0, ValidationKeys.percent)
    .max(MAX_PERCENT, ValidationKeys.percent),
  acceptStripe: z.boolean(),
  acceptPaypal: z.boolean(),
  acceptCash: z.boolean(),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function defaultsFor(settings: SalonSettings): FormInput {
  return { ...settings };
}

export function BookingRulesForm({ salon }: { salon: SalonDetail }) {
  const t = useTranslations("settings.rules");
  const tCommon = useTranslations("common");
  const fieldError = useFieldError();
  const update = useUpdateSalonSettings(salon.id);

  const { register, control, handleSubmit, reset, setError, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(salon.settings),
  });
  const { errors } = formState;
  const requireDeposit = useWatch({ control, name: "requireDeposit" });

  useEffect(() => reset(defaultsFor(salon.settings)), [salon.settings, reset]);

  const onSubmit = (values: FormValues) =>
    update.mutate(values, {
      onSuccess: () => toast.success(t("saved")),
      onError: (error) => applyApiError(error, setError),
    });

  const numberField = (name: keyof FormInput, label: string) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`rules-${name}`}>{label}</FieldLabel>
      <Input
        id={`rules-${name}`}
        type="number"
        min={0}
        aria-invalid={Boolean(errors[name])}
        {...register(name)}
      />
      <FieldError>{fieldError(errors[name]?.message)}</FieldError>
    </Field>
  );

  const switchField = (
    name: "autoConfirm" | "requireDeposit" | "acceptStripe" | "acceptPaypal" | "acceptCash",
    label: string,
    hint?: string
  ) => (
    <Field orientation="horizontal">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Switch id={`rules-${name}`} checked={field.value} onCheckedChange={field.onChange} />
        )}
      />
      <div className="grid gap-0.5">
        <FieldLabel htmlFor={`rules-${name}`}>{label}</FieldLabel>
        {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      </div>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Card>
        <CardHeader>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>{t("booking")}</FieldLegend>
              <div className="grid gap-4 sm:grid-cols-2">
                {numberField("slotIntervalMin", t("slotInterval"))}
                {numberField("minAdvanceBookingMin", t("minAdvance"))}
                {numberField("maxAdvanceDays", t("maxAdvanceDays"))}
                {numberField("cancelBeforeMin", t("cancelDeadline"))}
              </div>
              {switchField("autoConfirm", t("autoConfirm"), t("autoConfirmHint"))}
            </FieldSet>
            <FieldSet>
              <FieldLegend>{t("deposit")}</FieldLegend>
              {switchField("requireDeposit", t("requireDeposit"))}
              {requireDeposit ? (
                <div className="sm:w-1/2">{numberField("depositPercent", t("depositPercent"))}</div>
              ) : null}
            </FieldSet>
            <FieldSet>
              <FieldLegend>{t("payments")}</FieldLegend>
              {switchField("acceptStripe", t("acceptStripe"))}
              {switchField("acceptPaypal", t("acceptPaypal"))}
              {switchField("acceptCash", t("acceptCash"))}
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={update.isPending}>
            {update.isPending ? tCommon("saving") : tCommon("save")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
