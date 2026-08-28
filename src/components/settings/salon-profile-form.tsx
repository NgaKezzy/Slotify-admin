"use client";

/**
 * Salon profile form shared by the settings "Profile" tab (edit) and
 * `/settings/new` (create). Submits a `SalonRequest`; the parent decides which
 * mutation to call through `onSubmit`.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { z } from "zod";

import { ImageUpload } from "@/components/common/image-upload";
import {
  countryOptions,
  currencyOptions,
  timezoneOptions,
  type SelectOption,
} from "@/components/settings/salon-options";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";
import type { SalonDetail } from "@/hooks/use-salons";
import { useAmenities, useGlobalCategories, type SalonInput } from "@/hooks/use-settings";
import { UploadFolders } from "@/lib/upload";
import {
  optionalEmail,
  optionalString,
  requiredString,
  useFieldError,
  ValidationKeys,
} from "@/lib/validation";

/** Optional coordinate within `±limit`: empty input becomes undefined. */
const optionalCoordinate = (limit: number, message: string) =>
  z
    .union([
      z.literal(""),
      z.coerce.number<string | number>().min(-limit, message).max(limit, message),
    ])
    .transform((value) => (value === "" ? undefined : value));

const formSchema = z.object({
  name: requiredString,
  description: optionalString,
  phone: optionalString,
  email: optionalEmail,
  address: requiredString,
  city: requiredString,
  country: requiredString,
  lat: optionalCoordinate(90, ValidationKeys.latRange),
  lng: optionalCoordinate(180, ValidationKeys.lngRange),
  timezone: requiredString,
  currency: requiredString,
  coverUrl: z.string().optional(),
  categoryIds: z.array(z.number()),
  amenityIds: z.array(z.number()),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

/** Default timezone/currency for new salons (EU market). */
const DEFAULT_TIMEZONE = "Europe/Berlin";
const DEFAULT_CURRENCY = "EUR";
const DEFAULT_COUNTRY = "DE";

function defaultsFor(salon?: SalonDetail): FormInput {
  return {
    name: salon?.name ?? "",
    description: salon?.description ?? "",
    phone: salon?.phone ?? "",
    email: salon?.email ?? "",
    address: salon?.address ?? "",
    city: salon?.city ?? "",
    country: salon?.country ?? DEFAULT_COUNTRY,
    lat: salon?.lat ?? "",
    lng: salon?.lng ?? "",
    timezone: salon?.timezone ?? DEFAULT_TIMEZONE,
    currency: salon?.currency ?? DEFAULT_CURRENCY,
    coverUrl: salon?.coverUrl ?? undefined,
    categoryIds: salon?.categories?.map((c) => c.id) ?? [],
    amenityIds: salon?.amenities?.map((a) => a.id) ?? [],
  };
}

interface SalonProfileFormProps {
  salon?: SalonDetail;
  submitLabel: string;
  isPending: boolean;
  /** Receives the API body and the form's `setError` for field-level API errors. */
  onSubmit: (body: SalonInput, setError: UseFormSetError<FormInput>) => void;
}

export function SalonProfileForm({
  salon,
  submitLabel,
  isPending,
  onSubmit,
}: SalonProfileFormProps) {
  const t = useTranslations("settings.profile");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const fieldError = useFieldError();
  const categories = useGlobalCategories();
  const amenities = useAmenities();

  const countries = useMemo(() => countryOptions(locale), [locale]);
  const currencies = useMemo(() => currencyOptions(locale), [locale]);
  const timezones = useMemo(() => timezoneOptions(), []);

  const { register, control, handleSubmit, setError, formState } = useForm<
    FormInput,
    unknown,
    FormValues
  >({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(salon),
  });
  const { errors } = formState;

  const submit = (values: FormValues) => onSubmit(values, setError);

  const renderSelect = (
    name: "country" | "timezone" | "currency",
    id: string,
    items: SelectOption[]
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <SearchableSelect
          id={id}
          value={field.value}
          onValueChange={field.onChange}
          options={items}
          disabled={isPending}
          aria-invalid={Boolean(errors[name])}
        />
      )}
    />
  );

  const renderIdList = (
    name: "categoryIds" | "amenityIds",
    items: { id: number; name: string }[]
  ) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => {
            const id = `${name}-${item.id}`;
            const checked = field.value.includes(item.id);
            return (
              <div key={item.id} className="flex items-center gap-2">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) =>
                    field.onChange(
                      next === true
                        ? [...field.value, item.id]
                        : field.value.filter((v) => v !== item.id)
                    )
                  }
                />
                <Label htmlFor={id} className="font-normal">
                  {item.name}
                </Label>
              </div>
            );
          })}
        </div>
      )}
    />
  );

  const textField = (
    name: keyof FormInput,
    id: string,
    label: string,
    props: React.ComponentProps<typeof Input> = {}
  ) => (
    <Field data-invalid={Boolean(errors[name])}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} aria-invalid={Boolean(errors[name])} {...props} {...register(name)} />
      <FieldError>{fieldError(errors[name]?.message)}</FieldError>
    </Field>
  );

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="grid gap-6">
      <FieldGroup>
        <Field>
          <FieldLabel>{t("cover")}</FieldLabel>
          <Controller
            control={control}
            name="coverUrl"
            render={({ field }) => (
              <ImageUpload
                value={field.value}
                onChange={field.onChange}
                folder={UploadFolders.salons}
                disabled={isPending}
              />
            )}
          />
        </Field>
        {textField("name", "salon-name", t("name"))}
        <Field data-invalid={Boolean(errors.description)}>
          <FieldLabel htmlFor="salon-description">{t("salonDescription")}</FieldLabel>
          <Textarea id="salon-description" rows={3} {...register("description")} />
          <FieldError>{fieldError(errors.description?.message)}</FieldError>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("phone", "salon-phone", t("phone"), { type: "tel" })}
          {textField("email", "salon-email", t("email"), { type: "email" })}
        </div>
        {textField("address", "salon-address", t("address"))}
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("city", "salon-city", t("city"))}
          <Field data-invalid={Boolean(errors.country)}>
            <FieldLabel htmlFor="salon-country">{t("country")}</FieldLabel>
            {renderSelect("country", "salon-country", countries)}
            <FieldError>{fieldError(errors.country?.message)}</FieldError>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {textField("lat", "salon-lat", t("lat"), { type: "number", step: "any" })}
          {textField("lng", "salon-lng", t("lng"), { type: "number", step: "any" })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={Boolean(errors.timezone)}>
            <FieldLabel htmlFor="salon-timezone">{t("timezone")}</FieldLabel>
            {renderSelect("timezone", "salon-timezone", timezones)}
            <FieldError>{fieldError(errors.timezone?.message)}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.currency)}>
            <FieldLabel htmlFor="salon-currency">{t("currency")}</FieldLabel>
            {renderSelect("currency", "salon-currency", currencies)}
            <FieldError>{fieldError(errors.currency?.message)}</FieldError>
          </Field>
        </div>
        <FieldSet>
          <FieldLegend>{t("categories")}</FieldLegend>
          {renderIdList("categoryIds", categories.data ?? [])}
        </FieldSet>
        <FieldSet>
          <FieldLegend>{t("amenities")}</FieldLegend>
          {renderIdList("amenityIds", amenities.data ?? [])}
        </FieldSet>
      </FieldGroup>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? tCommon("saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
