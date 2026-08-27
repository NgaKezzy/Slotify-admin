/**
 * Bridges `ApiError` and react-hook-form: validation failures from the API
 * (`errors[].field`) are shown inline on the matching field, everything else
 * becomes an error toast. Call from a mutation's `onError` in every form.
 */
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

import { ApiError, toApiError } from "@/lib/api-error";

/**
 * Maps API field errors onto the form and toasts the general message.
 * @param error Anything thrown by a mutation.
 * @param setError `setError` from `useForm()`.
 * @returns The normalised `ApiError` so callers can branch on `code`.
 */
export function applyApiError<Values extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<Values>
): ApiError {
  const apiError = toApiError(error);
  const fields = Object.entries(apiError.fieldErrors);
  if (setError) {
    for (const [field, message] of fields) {
      setError(field as Path<Values>, { type: "server", message });
    }
  }
  // Only toast when there is nothing inline to look at, or the message is generic.
  if (fields.length === 0 || !setError) toast.error(apiError.message);
  return apiError;
}

/**
 * Single-argument variant for mutations without a form: toasts the API message.
 * Pass directly as `onError: toastApiError`.
 * @param error Anything thrown by a mutation.
 */
export function toastApiError(error: unknown): ApiError {
  return applyApiError(error);
}
