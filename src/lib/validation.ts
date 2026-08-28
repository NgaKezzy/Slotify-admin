/**
 * Shared zod helpers and the hook that turns zod message keys into translated
 * text. Zod schemas in this project use keys under `validation.*` as messages
 * (`z.string().min(1, "required")`); server-side field errors arrive already
 * localised and are passed through unchanged.
 */
import { useTranslations } from "next-intl";
import { z } from "zod";

/** Message keys under `validation` in the message bundles. */
export const ValidationKeys = {
  required: "required",
  invalidEmail: "invalidEmail",
  positive: "positive",
  nonNegative: "nonNegative",
  percent: "percent",
  timeRange: "timeRange",
  dateRange: "dateRange",
  latRange: "latRange",
  lngRange: "lngRange",
} as const;

type ValidationKey = (typeof ValidationKeys)[keyof typeof ValidationKeys];

const KNOWN_KEYS = new Set<string>(Object.values(ValidationKeys));

/**
 * Returns a function that maps a form error message to display text:
 * known `validation.*` keys are translated, anything else is shown as-is.
 */
export function useFieldError(): (message: string | undefined) => string | undefined {
  const t = useTranslations("validation");
  return (message) => {
    if (!message) return undefined;
    return KNOWN_KEYS.has(message) ? t(message as ValidationKey) : message;
  };
}

/** Required, trimmed text. */
export const requiredString = z.string().trim().min(1, ValidationKeys.required);

/** Optional text: empty strings become `undefined` so the API receives no value. */
export const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value));

/** Optional email (empty allowed). */
export const optionalEmail = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.email(ValidationKeys.invalidEmail).optional());

/** Number input (coerced from the text field) that must be >= 0. */
export const nonNegativeNumber = z.coerce
  .number<string | number>()
  .min(0, ValidationKeys.nonNegative);

/** Number input that must be > 0. */
export const positiveNumber = z.coerce.number<string | number>().positive(ValidationKeys.positive);

/** Optional number: empty input becomes `undefined`. */
export const optionalNumber = z
  .union([z.literal(""), z.coerce.number<string | number>().min(0, ValidationKeys.nonNegative)])
  .transform((value) => (value === "" ? undefined : value));

/** `HH:MM` strings compare lexicographically, so this is a valid start < end check. */
export function isTimeRangeValid(start: string, end: string): boolean {
  return Boolean(start && end && start < end);
}
