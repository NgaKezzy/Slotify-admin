"use client";

/**
 * Create / edit dialog for a service. Price is entered in major units and sent
 * to the API as `priceMinor` (cents).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ImageUpload } from "@/components/common/image-upload";
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
import { Textarea } from "@/components/ui/textarea";
import { useCurrentSalon } from "@/hooks/use-salons";
import {
  useCreateService,
  useServiceCategories,
  useUpdateService,
  type Service,
} from "@/hooks/use-services";
import { applyApiError } from "@/lib/form-errors";
import { UploadFolders } from "@/lib/upload";
import {
  nonNegativeNumber,
  optionalString,
  positiveNumber,
  requiredString,
  useFieldError,
} from "@/lib/validation";

/** Select value for "no category" (Base UI Select needs a string). */
const NO_CATEGORY = "none";
/** Minor units per major unit for every supported currency. */
const MINOR_PER_MAJOR = 100;

const formSchema = z.object({
  name: requiredString,
  categoryId: z.string(),
  description: optionalString,
  durationMin: positiveNumber,
  bufferAfterMin: nonNegativeNumber,
  price: nonNegativeNumber,
  imageUrl: z.string().optional(),
  active: z.boolean(),
  sortOrder: nonNegativeNumber,
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

function defaultsFor(service?: Service): FormInput {
  return {
    name: service?.name ?? "",
    categoryId: service?.categoryId ? String(service.categoryId) : NO_CATEGORY,
    description: service?.description ?? "",
    durationMin: service?.durationMin ?? 30,
    bufferAfterMin: service?.bufferAfterMin ?? 0,
    price: service ? service.priceMinor / MINOR_PER_MAJOR : 0,
    imageUrl: service?.imageUrl ?? undefined,
    active: service?.active ?? true,
    sortOrder: service?.sortOrder ?? 0,
  };
}

interface ServiceFormDialogProps {
  salonId: number;
  service?: Service;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceFormDialog({
  salonId,
  service,
  open,
  onOpenChange,
}: ServiceFormDialogProps) {
  const t = useTranslations("services.form");
  const tCommon = useTranslations("common");
  const fieldError = useFieldError();
  const { currency } = useCurrentSalon();
  const categories = useServiceCategories(salonId);
  const createService = useCreateService(salonId);
  const updateService = useUpdateService(salonId);
  const isEdit = service !== undefined;
  const isPending = createService.isPending || updateService.isPending;

  const { register, control, handleSubmit, reset, setError, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({ resolver: zodResolver(formSchema), defaultValues: defaultsFor(service) });
  const { errors } = formState;

  useEffect(() => {
    if (open) reset(defaultsFor(service));
  }, [open, service, reset]);

  const onSubmit = (values: FormValues) => {
    const body = {
      categoryId: values.categoryId === NO_CATEGORY ? undefined : Number(values.categoryId),
      name: values.name,
      description: values.description,
      durationMin: values.durationMin,
      bufferAfterMin: values.bufferAfterMin,
      priceMinor: Math.round(values.price * MINOR_PER_MAJOR),
      imageUrl: values.imageUrl,
      active: values.active,
      sortOrder: values.sortOrder,
    };
    const options = {
      onSuccess: () => {
        toast.success(isEdit ? t("updated") : t("created"));
        onOpenChange(false);
      },
      onError: (error: unknown) => applyApiError(error, setError),
    };
    if (isEdit) updateService.mutate({ serviceId: service.id, body }, options);
    else createService.mutate(body, options);
  };

  const categoryItems = [
    { value: NO_CATEGORY, label: t("noCategory") },
    ...(categories.data ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel>{t("image")}</FieldLabel>
              <Controller
                control={control}
                name="imageUrl"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder={UploadFolders.services}
                    disabled={isPending}
                  />
                )}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="service-name">{t("name")}</FieldLabel>
                <Input
                  id="service-name"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name")}
                />
                <FieldError>{fieldError(errors.name?.message)}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.categoryId)}>
                <FieldLabel htmlFor="service-category">{t("category")}</FieldLabel>
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v ?? NO_CATEGORY)}
                      items={categoryItems}
                    >
                      <SelectTrigger id="service-category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError>{fieldError(errors.categoryId?.message)}</FieldError>
              </Field>
            </div>
            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="service-description">{t("description")}</FieldLabel>
              <Textarea id="service-description" rows={3} {...register("description")} />
              <FieldError>{fieldError(errors.description?.message)}</FieldError>
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field data-invalid={Boolean(errors.durationMin)}>
                <FieldLabel htmlFor="service-duration">{t("duration")}</FieldLabel>
                <Input
                  id="service-duration"
                  type="number"
                  min={1}
                  step={5}
                  {...register("durationMin")}
                />
                <FieldError>{fieldError(errors.durationMin?.message)}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.bufferAfterMin)}>
                <FieldLabel htmlFor="service-buffer">{t("buffer")}</FieldLabel>
                <Input
                  id="service-buffer"
                  type="number"
                  min={0}
                  step={5}
                  {...register("bufferAfterMin")}
                />
                <FieldError>{fieldError(errors.bufferAfterMin?.message)}</FieldError>
              </Field>
              <Field data-invalid={Boolean(errors.price)}>
                <FieldLabel htmlFor="service-price">{t("price")}</FieldLabel>
                <Input
                  id="service-price"
                  type="number"
                  min={0}
                  step={0.01}
                  inputMode="decimal"
                  {...register("price")}
                />
                <FieldDescription>{t("priceHint", { currency })}</FieldDescription>
                <FieldError>{fieldError(errors.price?.message)}</FieldError>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(errors.sortOrder)}>
                <FieldLabel htmlFor="service-sort">{t("sortOrder")}</FieldLabel>
                <Input id="service-sort" type="number" min={0} {...register("sortOrder")} />
                <FieldError>{fieldError(errors.sortOrder?.message)}</FieldError>
              </Field>
              <Field orientation="horizontal" className="pt-6">
                <Controller
                  control={control}
                  name="active"
                  render={({ field }) => (
                    <Switch
                      id="service-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="service-active">{t("active")}</FieldLabel>
              </Field>
            </div>
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
