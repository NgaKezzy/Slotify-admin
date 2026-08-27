"use client";

/**
 * "New walk-in booking" dialog: existing customer (by email) or a new one,
 * services, staff, date/slot from availability, payment method and note.
 * Validated with zod + react-hook-form; API field errors are mapped onto the form.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ANY_STAFF, SlotPicker } from "@/components/bookings/slot-picker";
import { Money } from "@/components/common/money";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCreateWalkInMutation, type PaymentMethod } from "@/hooks/use-bookings";
import { useCurrentSalon } from "@/hooks/use-salons";
import { useServices } from "@/hooks/use-services";
import { useStaff } from "@/hooks/use-staff";
import { toApiError } from "@/lib/api-error";
import { formatDuration, toIsoDate } from "@/lib/format";

const PAYMENT_METHODS: PaymentMethod[] = ["CASH", "STRIPE", "PAYPAL"];

const formSchema = z
  .object({
    customerMode: z.enum(["existing", "new"]),
    customerEmail: z.string().trim(),
    customerName: z.string().trim(),
    serviceIds: z.array(z.number()).min(1, "servicesRequired"),
    date: z.string(),
    staffId: z.string(),
    startAt: z.string().min(1, "slotRequired"),
    paymentMethod: z.enum(PAYMENT_METHODS),
    note: z.string().trim(),
  })
  .superRefine((values, ctx) => {
    const emailValid = z.email().safeParse(values.customerEmail).success;
    if (values.customerMode === "existing" && !emailValid) {
      ctx.addIssue({ code: "custom", path: ["customerEmail"], message: "invalidEmail" });
    }
    if (values.staffId === ANY_STAFF) {
      ctx.addIssue({ code: "custom", path: ["staffId"], message: "staffRequired" });
    }
    if (values.customerMode === "new") {
      if (!values.customerName)
        ctx.addIssue({ code: "custom", path: ["customerName"], message: "nameRequired" });
      if (!emailValid)
        ctx.addIssue({ code: "custom", path: ["customerEmail"], message: "invalidEmail" });
    }
  });

type FormValues = z.infer<typeof formSchema>;
type ValidationKey =
  "servicesRequired" | "slotRequired" | "invalidEmail" | "nameRequired" | "staffRequired";

interface WalkInDialogProps {
  salonId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalkInDialog({ salonId, open, onOpenChange }: WalkInDialogProps) {
  const t = useTranslations("bookings");
  const tCommon = useTranslations("common");
  const { timezone } = useCurrentSalon();
  const services = useServices(salonId);
  const staff = useStaff(salonId);
  const mutation = useCreateWalkInMutation(salonId);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerMode: "existing",
      customerEmail: "",
      customerName: "",
      serviceIds: [],
      date: toIsoDate(new Date(), timezone),
      staffId: ANY_STAFF,
      startAt: "",
      paymentMethod: "CASH",
      note: "",
    },
  });
  const { register, control, handleSubmit, setValue, setError, reset, formState } = form;
  const errors = formState.errors;
  const [customerMode, serviceIds, date, staffId, startAt] = useWatch({
    control,
    name: ["customerMode", "serviceIds", "date", "staffId", "startAt"],
  });

  useEffect(() => {
    if (open)
      reset({
        ...form.formState.defaultValues,
        date: toIsoDate(new Date(), timezone),
      } as FormValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Zod messages are keys under `bookings.validation`; API field errors are already localised.
  const errorText = (message: string | undefined) =>
    message && message in VALIDATION_KEYS ? t(`validation.${message as ValidationKey}`) : message;

  const onSubmit = (values: FormValues) =>
    mutation.mutate(
      {
        customerEmail: values.customerEmail,
        customerName: values.customerMode === "new" ? values.customerName : undefined,
        serviceIds: values.serviceIds,
        staffId: Number(values.staffId),
        startAt: values.startAt,
        paymentMethod: values.paymentMethod,
        note: values.note || undefined,
      },
      {
        onSuccess: (booking) => {
          toast.success(t("walkIn.created", { code: booking.code }));
          onOpenChange(false);
        },
        onError: (error) => {
          const apiError = toApiError(error);
          for (const [field, message] of Object.entries(apiError.fieldErrors)) {
            setError(field as keyof FormValues, { message });
          }
          toast.error(apiError.message);
        },
      }
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("walkIn.title")}</DialogTitle>
          <DialogDescription>{t("walkIn.description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Controller
              control={control}
              name="customerMode"
              render={({ field }) => (
                <Tabs value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <TabsList>
                    <TabsTrigger value="existing">{t("walkIn.existingCustomer")}</TabsTrigger>
                    <TabsTrigger value="new">{t("walkIn.newCustomer")}</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {customerMode === "new" ? (
                <Field data-invalid={Boolean(errors.customerName)}>
                  <FieldLabel htmlFor="walkin-name">{t("walkIn.customerName")}</FieldLabel>
                  <Input
                    id="walkin-name"
                    aria-invalid={Boolean(errors.customerName)}
                    {...register("customerName")}
                  />
                  <FieldError>{errorText(errors.customerName?.message)}</FieldError>
                </Field>
              ) : null}
              <Field data-invalid={Boolean(errors.customerEmail)}>
                <FieldLabel htmlFor="walkin-email">{t("walkIn.customerEmail")}</FieldLabel>
                <Input
                  id="walkin-email"
                  type="email"
                  aria-invalid={Boolean(errors.customerEmail)}
                  {...register("customerEmail")}
                />
                <FieldError>{errorText(errors.customerEmail?.message)}</FieldError>
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.serviceIds)}>
              <FieldLabel>{t("walkIn.services")}</FieldLabel>
              <div className="grid max-h-44 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                {(services.data ?? [])
                  .filter((service) => service.active)
                  .map((service) => {
                    const checked = serviceIds.includes(service.id);
                    return (
                      <label
                        key={service.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) => {
                            const ids = next
                              ? [...serviceIds, service.id]
                              : serviceIds.filter((id) => id !== service.id);
                            setValue("serviceIds", ids, { shouldValidate: formState.isSubmitted });
                            setValue("startAt", "");
                          }}
                        />
                        <span className="flex-1 truncate">{service.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(service.durationMin)} ·{" "}
                          <Money minor={service.priceMinor} currency={service.currency} />
                        </span>
                      </label>
                    );
                  })}
              </div>
              <FieldError>{errorText(errors.serviceIds?.message)}</FieldError>
            </Field>

            <SlotPicker
              salonId={salonId}
              serviceIds={serviceIds}
              staff={staff.data ?? []}
              value={{ date, staffId, startAt }}
              onChange={(next) => {
                setValue("date", next.date);
                setValue("staffId", next.staffId, { shouldValidate: formState.isSubmitted });
                setValue("startAt", next.startAt, { shouldValidate: formState.isSubmitted });
              }}
              slotError={errorText(errors.startAt?.message)}
              staffError={errorText(errors.staffId?.message)}
              allowAnyStaff={false}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="walkin-payment">{t("walkIn.paymentMethod")}</FieldLabel>
                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                      <SelectTrigger id="walkin-payment" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method} value={method}>
                            {t(`paymentMethod.${method}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
              <Field data-invalid={Boolean(errors.note)}>
                <FieldLabel htmlFor="walkin-note">
                  {t("walkIn.note")}{" "}
                  <span className="text-muted-foreground">({tCommon("optional")})</span>
                </FieldLabel>
                <Textarea id="walkin-note" rows={2} {...register("note")} />
                <FieldError>{errors.note?.message}</FieldError>
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {t("walkIn.submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const VALIDATION_KEYS: Record<ValidationKey, true> = {
  servicesRequired: true,
  slotRequired: true,
  staffRequired: true,
  invalidEmail: true,
  nameRequired: true,
};
