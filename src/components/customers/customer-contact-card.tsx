/**
 * Contact + visit summary card on the customer detail page.
 */
import { Mail, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { DateTime } from "@/components/common/date-time";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CustomerSummary } from "@/hooks/use-customers";
import { getInitials } from "@/lib/utils";

export function CustomerContactCard({ customer }: { customer: CustomerSummary }) {
  const t = useTranslations("customers.detail");
  const visit = (iso: string | null | undefined) =>
    iso ? (
      <DateTime iso={iso} mode="date" />
    ) : (
      <span className="text-muted-foreground">{t("never")}</span>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("contact")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            {customer.avatarUrl ? <AvatarImage src={customer.avatarUrl} alt="" /> : null}
            <AvatarFallback>{getInitials(customer.fullName)}</AvatarFallback>
          </Avatar>
          <span className="text-lg font-semibold">{customer.fullName}</span>
        </div>
        <dl className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="size-4" />
              <span className="sr-only">{t("email")}</span>
            </dt>
            <dd>
              {customer.email ? (
                <a href={`mailto:${customer.email}`} className="hover:underline">
                  {customer.email}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-4" />
              <span className="sr-only">{t("phone")}</span>
            </dt>
            <dd>
              {customer.phone ? (
                <a href={`tel:${customer.phone}`} className="hover:underline">
                  {customer.phone}
                </a>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div className="flex justify-between gap-2 border-t pt-2">
            <dt className="text-muted-foreground">{t("firstVisit")}</dt>
            <dd>{visit(customer.firstVisitAt)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">{t("lastVisit")}</dt>
            <dd>{visit(customer.lastVisitAt)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
