"use client";

/**
 * Create / edit dialog for a coupon. Percent values are sent as-is; fixed
 * amounts, minimum order and maximum discount are entered in major units and
 * converted to minor units for the API.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCreateCoupon,
  useUpdateCoupon,
  type Coupon,
  type CouponType,
} from "@/hooks/use-coupons";
import { useCurrentSalon } from "@/hooks/use-salons";
import { fromDateTimeInputValue, toDateTimeInputValue } from "@/lib/format";
import { applyApiError } from "@/lib/form-errors";
import { ValidationKeys, nonNegativeNumber, optionalNumber, useFieldError } from "@/lib/validation";

const MINOR_PER_MAJOR = 100;
const MAX_PERCENT = 100;
const COUPON_TYPES: CouponType[] = ["PERCENT", "FIXED"];

const formSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, ValidationKeys.required)
      .regex(/^[A-Z0-9]+$/, ValidationKeys.required),
    type: z.enum(COUPON_TYPES),
    value: nonNegativeNumber,
    minOrder: optionalNumber,
    maxDiscount: optionalNumber,
    usageLimit: optionalNumber,
    perUserLimit: optionalNumber,
    startsAt: z.string(),
    endsAt: z.string(),
    active: z.boolean(),
  })
  .refine((v) => v.type !== "PERCENT" || v.value <= MAX_PERCENT, {
    message: ValidationKeys.percent,
    path: ["value"],
  })
  .refine((v) => !v.startsAt || !v.endsAt || v.startsAt < v.endsAt, {
    message: ValidationKeys.dateRange,
    path: ["endsAt"],
  });

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

const toMajor = (minor: number | undefined) => (minor === undefined ? "" : minor / MINOR_PER_MAJOR);
const toMinor = (major: number | undefined) =>
  major === undefined ? undefined : Math.round(major * MINOR_PER_MAJOR);

function defaultsFor(coupon?: Coupon): FormInput {
  const isPercent = coupon?.type !== "FIXED";
  return {
    code: coupon?.code ?? "",
    type: coupon?.type ?? "PERCENT",
    value: coupon ? (isPercent ? coupon.value : coupon.value / MINOR_PER_MAJOR) : 10,
    minOrder: toMajor(coupon?.minOrderMinor),
    maxDiscount: toMajor(coupon?.maxDiscountMinor),
    usageLimit: coupon?.usageLimit ?? "",
    perUserLimit: coupon?.perUserLimit ?? "",
    startsAt: toDateTimeInputValue(coupon?.startsAt),
    endsAt: toDateTimeInputValue(coupon?.endsAt),
    active: coupon?.active ?? true,
  };
}

interface CouponFormDialogProps {
  salonId: number;
  coupon?: Coupon;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CouponFormDialog({ salonId, coupon, open, onOpenChange }: CouponFormDialogProps) {
  const t = useTranslations("promotions");
  const tCommon = useTranslations("common");
  const fieldError = useFieldError();
  const { currency } = useCurrentSalon();
  const createCoupon = useCreateCoupon(salonId);
  const updateCoupon = useUpdateCoupon(salonId);
  const isEdit = coupon !== undefined;
  const isPending = createCoupon.isPending || updateCoupon.isPending;

  const { register, control, handleSubmit, reset, setError, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(coupon),
  });
  const { errors } = formState;
  const type = useWatch({ control, name: "type" });

  useEffect(() => {
    if (open) reset(defaultsFor(coupon));
  }, [open, coupon, reset]);

  const onSubmit = (values: FormValues) => {
    const body = {
      code: values.code,
      type: values.type,
      value: values.type === "PERCENT" ? values.value : Math.round(values.value * MINOR_PER_MAJOR),
      minOrderMinor: toMinor(values.minOrder),
      maxDiscountMinor: toMinor(values.maxDiscount),
      usageLimit: values.usageLimit,
      perUserLimit: values.perUserLimit,
      startsAt: fromDateTimeInputValue(values.startsAt),
      endsAt: fromDateTimeInputValue(values.endsAt),
      active: values.active,
    };
    const options = {
      onSuccess: () => {
        toast.success(isEdit ? t("form.updated") : t("form.created"));
        onOpenChange(false);
      },
      onError: (error: unknown) => applyApiError(error, setError),
    };
    if (isEdit) updateCoupon.mutate({ couponId: coupon.id, body }, options);
    else createCoupon.mutate(body, options);
  };

  const typeItems = COUPON_TYPES.map((value) => ({ value, label: t(`type.${value}`) }));

  const numberField = (
    name: "value" | "minOrder" | "maxDiscount" | "usageLimit" | "perUserLimit",
    label: string,
    hint?: string,
    step = 1
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={`coupon-${name}`}>{label}</FieldLabel>
      <Input
        id={`coupon-${name}`}
        type="number"
        min={0}
        step={step}
        inputMode="decimal"
        aria-invalid={Boolean(errors[name])}
        {...register(name)}
      />
      {hint ? <FieldDescription>{hint}</FieldDescription> : null}
      <FieldError>{fieldError(errors[name]?.message)}</FieldError>
    </Field>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("form.editTitle") : t("form.createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.code)}>
                <FieldLabel htmlFor="coupon-code">{t("form.code")}</FieldLabel>
                <Input
                  id="coupon-code"
                  className="font-mono uppercase"
                  aria-invalid={Boolean(errors.code)}
                  {...register("code")}
                />
                <FieldDescription>{t("form.codeHint")}</FieldDescription>
                <FieldError>{fieldError(errors.code?.message)}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="coupon-type">{t("form.type")}</FieldLabel>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v ?? "PERCENT")}
                      items={typeItems}
                    >
                      <SelectTrigger id="coupon-type" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {typeItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {numberField(
                "value",
                t("form.value"),
                type === "PERCENT" ? t("form.percentHint") : t("form.fixedHint", { currency }),
                type === "PERCENT" ? 1 : 0.01
              )}
              {numberField("minOrder", `${t("form.minOrder")} (${currency})`, undefined, 0.01)}
              {numberField(
                "maxDiscount",
                `${t("form.maxDiscount")} (${currency})`,
                undefined,
                0.01
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {numberField("usageLimit", t("form.usageLimit"))}
              {numberField("perUserLimit", t("form.perUserLimit"))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.startsAt)}>
                <FieldLabel htmlFor="coupon-startsAt">{t("form.startsAt")}</FieldLabel>
                <Input id="coupon-startsAt" type="datetime-local" {...register("startsAt")} />
                <FieldError>{fieldError(errors.startsAt?.message)}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.endsAt)}>
                <FieldLabel htmlFor="coupon-endsAt">{t("form.endsAt")}</FieldLabel>
                <Input id="coupon-endsAt" type="datetime-local" {...register("endsAt")} />
                <FieldError>{fieldError(errors.endsAt?.message)}</FieldError>
              </Field>
            </div>
            <Field orientation="horizontal">
              <Controller
                control={control}
                name="active"
                render={({ field }) => (
                  <Switch
                    id="coupon-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <FieldLabel htmlFor="coupon-active">{t("form.active")}</FieldLabel>
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
