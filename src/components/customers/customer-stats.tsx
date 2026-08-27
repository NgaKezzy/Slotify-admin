/**
 * KPI tiles (bookings, completed, no-shows, cancelled, total spent) for one customer.
 */
import { useTranslations } from "next-intl";

import { Money } from "@/components/common/money";
import { StatCard } from "@/components/common/stat-card";
import type { CustomerSummary } from "@/hooks/use-customers";

export function CustomerStats({ customer }: { customer: CustomerSummary }) {
  const t = useTranslations("customers");
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label={t("columns.bookings")} value={customer.totalBookings} />
      <StatCard label={t("columns.completed")} value={customer.completedBookings} />
      <StatCard
        label={t("columns.noShows")}
        value={
          <span className={customer.noShows > 0 ? "text-status-no-show" : undefined}>
            {customer.noShows}
          </span>
        }
      />
      <StatCard label={t("detail.cancelled")} value={customer.cancelledBookings} />
      <StatCard
        label={t("columns.totalSpent")}
        value={<Money minor={customer.totalSpentMinor} />}
      />
    </div>
  );
}
