"use client";

/**
 * Payments list (`/payments`): server-paginated transactions with a refund
 * action. Cash payments show a disabled button with an explanatory tooltip.
 */
import { Undo2 } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { Money } from "@/components/common/money";
import { PaymentTransactionBadge } from "@/components/payments/payment-status-badge";
import { RefundDialog } from "@/components/payments/refund-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { canRefund, usePayments, type Payment } from "@/hooks/use-payments";

const PAGE_SIZE = 20;

export function PaymentsTable({ salonId }: { salonId: number }) {
  const t = useTranslations("payments");
  const [page, setPage] = useState(0);
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const payments = usePayments(salonId, { page, size: PAGE_SIZE });

  const refundButton = (row: Payment) => {
    const allowed = canRefund(row);
    const button = (
      <Button
        variant="outline"
        size="sm"
        disabled={!allowed}
        onClick={() => setRefundTarget(row)}
        aria-label={`${t("refund")} ${row.bookingCode}`}
      >
        <Undo2 />
        {t("refund")}
      </Button>
    );
    if (allowed) return button;
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" tabIndex={0} />}>
          {button}
        </TooltipTrigger>
        <TooltipContent>
          {row.provider === "CASH" ? t("cashNotRefundable") : t("notRefundable")}
        </TooltipContent>
      </Tooltip>
    );
  };

  const columns: DataTableColumn<Payment>[] = [
    {
      key: "booking",
      header: t("columns.booking"),
      cell: (row) => (
        <Link
          href={{ pathname: "/bookings", query: { q: row.bookingCode } }}
          className="font-mono text-sm font-medium hover:underline"
        >
          {row.bookingCode}
        </Link>
      ),
    },
    {
      key: "provider",
      header: t("columns.provider"),
      cell: (row) => t(`provider.${row.provider}`),
    },
    { key: "type", header: t("columns.type"), cell: (row) => t(`type.${row.type}`) },
    {
      key: "amount",
      header: t("columns.amount"),
      className: "text-right tabular-nums",
      cell: (row) => <Money minor={row.amountMinor} currency={row.currency} />,
    },
    {
      key: "refunded",
      header: t("columns.refunded"),
      className: "text-right tabular-nums",
      cell: (row) =>
        row.refundedMinor > 0 ? (
          <Money
            minor={row.refundedMinor}
            currency={row.currency}
            className="text-status-no-show"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "status",
      header: t("columns.status"),
      cell: (row) => <PaymentTransactionBadge status={row.status} />,
    },
    {
      key: "paidAt",
      header: t("columns.paidAt"),
      cell: (row) =>
        row.paidAt ? (
          <DateTime iso={row.paidAt} />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { key: "actions", header: "", className: "text-right", cell: refundButton },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={payments.data?.items}
        rowKey={(row) => row.id}
        isLoading={payments.isLoading}
        emptyMessage={t("empty")}
        pagination={{
          page: payments.data?.page ?? 0,
          totalPages: payments.data?.totalPages ?? 0,
          totalItems: payments.data?.totalItems,
          onPageChange: setPage,
        }}
      />
      <RefundDialog
        salonId={salonId}
        payment={refundTarget}
        onOpenChange={(open) => !open && setRefundTarget(null)}
      />
    </>
  );
}
