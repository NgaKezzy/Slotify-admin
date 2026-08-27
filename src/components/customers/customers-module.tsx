"use client";

/**
 * Customers list for the selected salon (\`/customers\`).
 * Client boundary: the server page cannot pass the `RequireSalon` render
 * function itself, so this wrapper resolves the selected salon on the client.
 */
import { RequireSalon } from "@/components/common/no-salon";
import { CustomersTable } from "@/components/customers/customers-table";

export function CustomersTableModule() {
  return <RequireSalon>{(salonId) => <CustomersTable salonId={salonId} />}</RequireSalon>;
}
