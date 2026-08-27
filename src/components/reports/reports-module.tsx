"use client";

/**
 * Reports for the selected salon (\`/reports\`).
 * Client boundary: the server page cannot pass the `RequireSalon` render
 * function itself, so this wrapper resolves the selected salon on the client.
 */
import { RequireSalon } from "@/components/common/no-salon";
import { ReportsView } from "@/components/reports/reports-view";

export function ReportsViewModule() {
  return <RequireSalon>{(salonId) => <ReportsView salonId={salonId} />}</RequireSalon>;
}
