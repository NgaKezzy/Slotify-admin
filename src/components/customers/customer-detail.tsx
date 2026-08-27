"use client";

/**
 * Customer detail page body (`/customers/[customerId]`): loads the customer and
 * composes contact card, statistics, tags editor, notes and recent bookings.
 */
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/common/empty-state";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { CustomerContactCard } from "@/components/customers/customer-contact-card";
import { CustomerNotes } from "@/components/customers/customer-notes";
import { CustomerRecentBookings } from "@/components/customers/customer-recent-bookings";
import { CustomerStats } from "@/components/customers/customer-stats";
import { CustomerTagsEditor } from "@/components/customers/customer-tags-editor";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useCustomer } from "@/hooks/use-customers";
import { toApiError } from "@/lib/api-error";

interface CustomerDetailProps {
  salonId: number;
  customerId: number;
}

export function CustomerDetail({ salonId, customerId }: CustomerDetailProps) {
  const t = useTranslations("customers.detail");
  const detail = useCustomer(salonId, customerId);

  const backButton = (
    <Button variant="outline" size="sm" render={<Link href="/customers" />}>
      <ArrowLeft />
      {t("backToList")}
    </Button>
  );

  if (detail.isLoading) return <PageSkeleton />;
  if (detail.isError || !detail.data) {
    return (
      <EmptyState
        title={t("notFound")}
        description={detail.error ? toApiError(detail.error).message : undefined}
        action={backButton}
      />
    );
  }

  const { customer, notes, recentBookings } = detail.data;
  return (
    <div className="grid gap-6">
      <PageHeader title={customer.fullName} description={t("title")} actions={backButton} />
      <CustomerStats customer={customer} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="grid gap-6 lg:col-span-1">
          <CustomerContactCard customer={customer} />
          <CustomerTagsEditor salonId={salonId} customerId={customerId} assigned={customer.tags} />
        </div>
        <div className="grid gap-6 lg:col-span-2">
          <CustomerNotes salonId={salonId} customerId={customerId} notes={notes} />
          <CustomerRecentBookings bookings={recentBookings} />
        </div>
      </div>
    </div>
  );
}
