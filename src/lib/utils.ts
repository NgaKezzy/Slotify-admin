/**
 * Small, framework-agnostic helpers shared across the admin panel.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names, resolving conflicts (e.g. `p-2` vs `p-4`).
 * @param inputs Class values accepted by clsx.
 * @returns A single, de-duplicated class string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Builds initials from a full name for avatar fallbacks ("Jane Doe" -> "JD").
 * @param fullName The person's display name.
 * @returns Up to two upper-case initials, or "?" for an empty name.
 */
export function getInitials(fullName: string | null | undefined): string {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
