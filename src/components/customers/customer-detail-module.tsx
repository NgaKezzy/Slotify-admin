"use client";

/**
 * Customer detail for the selected salon (\`/customers/[customerId]\`).
 * Client boundary: the server page cannot pass the `RequireSalon` render
 * function itself, so this wrapper resolves the selected salon on the client.
 */
import { RequireSalon } from "@/components/common/no-salon";
import { CustomerDetail } from "@/components/customers/customer-detail";

export function CustomerDetailModule({ customerId }: { customerId: number }) {
  return (
    <RequireSalon>
      {(salonId) => <CustomerDetail salonId={salonId} customerId={customerId} />}
    </RequireSalon>
  );
}
