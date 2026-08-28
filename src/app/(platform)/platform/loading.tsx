/**
 * Instant loading UI for every platform screen. Rendered by Next.js the moment
 * a platform link is clicked, while the server component of the target page is
 * still rendering, so navigation never feels unresponsive.
 */
import { Skeleton } from "@/components/ui/skeleton";

export default function PlatformLoading() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <div className="grid gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 rounded-xl border p-4">
        <Skeleton className="h-9 w-full max-w-sm" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
