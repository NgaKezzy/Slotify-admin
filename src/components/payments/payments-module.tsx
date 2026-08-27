"use client";

/**
 * Payments for the selected salon (\`/payments\`).
 * Client boundary: the server page cannot pass the `RequireSalon` render
 * function itself, so this wrapper resolves the selected salon on the client.
 */
import { RequireSalon } from "@/components/common/no-salon";
import { PaymentsTable } from "@/components/payments/payments-table";

export function PaymentsTableModule() {
  return <RequireSalon>{(salonId) => <PaymentsTable salonId={salonId} />}</RequireSalon>;
}
