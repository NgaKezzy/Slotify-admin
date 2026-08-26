/**
 * Reports whether the viewport is narrower than the mobile breakpoint.
 * Used by the shadcn Sidebar to switch between the fixed sidebar and a sheet.
 * Implemented with `useSyncExternalStore` so it stays SSR-safe (false on the server).
 */
import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT_PX = 768;
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX - 1}px)`;

function subscribe(onChange: () => void): () => void {
  const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQueryList.addEventListener("change", onChange);
  return () => mediaQueryList.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * @returns `true` when the viewport is below the mobile breakpoint.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
