/**
 * Error type for failed API calls, built from the standard envelope
 * `{ success:false, code, message, errors? }` (backend plan §3.8).
 *
 * `code` is the numeric ErrorCode (1xxx auth, 2xxx not found, 3xxx bad request,
 * 4xxx conflict, 5xxx payment, 9xxx system); `message` is already localised by
 * the API using the Accept-Language header. Field-level validation errors are
 * exposed through `fieldErrors` for forms.
 */

/** Well-known numeric error codes the UI branches on. */
export const ErrorCodes = {
  UNAUTHENTICATED: 1001,
  FORBIDDEN: 1002,
  INVALID_CREDENTIALS: 1003,
  TOKEN_EXPIRED: 1004,
  VALIDATION_FAILED: 3001,
  SLOT_UNAVAILABLE: 4003,
  BOOKING_INVALID_STATE: 4004,
} as const;

interface EnvelopeError {
  success?: boolean;
  code?: number;
  message?: string;
  errors?: { field?: string; code?: number; message?: string }[];
}

export class ApiError extends Error {
  /** Numeric backend error code, or -1 for transport failures. */
  readonly code: number;
  /** HTTP status when known. */
  readonly status: number | undefined;
  /** `field -> message` for validation failures (empty otherwise). */
  readonly fieldErrors: Record<string, string>;

  constructor(
    code: number,
    message: string,
    status?: number,
    fieldErrors: Record<string, string> = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /**
   * Builds an ApiError from an openapi-fetch `error` value (the parsed body) and the response.
   * @param body Parsed error body (may be undefined when the server sent no JSON).
   * @param response The fetch Response, used for the HTTP status.
   */
  static fromResponse(body: unknown, response?: Response): ApiError {
    const envelope = (body ?? {}) as EnvelopeError;
    const fieldErrors: Record<string, string> = {};
    for (const entry of envelope.errors ?? []) {
      if (entry.field && entry.message) fieldErrors[entry.field] = entry.message;
    }
    return new ApiError(
      envelope.code ?? -1,
      envelope.message ?? `Request failed${response ? ` (${response.status})` : ""}`,
      response?.status,
      fieldErrors
    );
  }

  /** True when the session is missing/expired and the user must sign in again. */
  get isUnauthenticated(): boolean {
    return this.code === ErrorCodes.UNAUTHENTICATED || this.code === ErrorCodes.TOKEN_EXPIRED;
  }
}

/**
 * Narrows an unknown thrown value to ApiError, wrapping anything else.
 * @param error Any thrown value.
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return new ApiError(-1, error.message);
  return ApiError.fromResponse(error);
}
