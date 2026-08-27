/**
 * Downloads binary exports (Excel/PDF) from authenticated API endpoints.
 * openapi-fetch is JSON-oriented, so exports use a plain `fetch` with the same
 * bearer token, turn the body into a Blob and trigger a browser download named
 * after the `Content-Disposition` header (falling back to `fallbackName`).
 */
import { getAccessToken } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { env } from "@/lib/env";

/** Extracts `filename="x"` (or `filename*=UTF-8''x`) from a Content-Disposition header. */
export function fileNameFromDisposition(header: string | null): string | null {
  if (!header) return null;
  const utf8 = header.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);
  const plain = header.match(/filename="?([^";]+)"?/i);
  return plain?.[1] ?? null;
}

/**
 * Fetches an authenticated file and saves it through a temporary anchor element.
 * @param path API path (e.g. `/api/v1/admin/salons/1/reports/export`).
 * @param query Query parameters; `undefined` values are skipped.
 * @param fallbackName File name used when the server sends no Content-Disposition.
 * @throws ApiError when the server rejects the request.
 */
export async function downloadFile(
  path: string,
  query: Record<string, string | undefined>,
  fallbackName: string
): Promise<void> {
  const url = new URL(path, env.publicApiUrl);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") url.searchParams.set(key, value);
  }
  const token = await getAccessToken();
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined);
    throw ApiError.fromResponse(body, response);
  }
  const blob = await response.blob();
  const fileName = fileNameFromDisposition(response.headers.get("Content-Disposition"));
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName ?? fallbackName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
