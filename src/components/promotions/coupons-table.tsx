"use client";

/**
 * Promotions page body (`/promotions`): coupons table with code, type, value,
 * usage, validity and status, plus create/edit/delete actions.
 */
import { MoreHorizontal, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ActiveBadge } from "@/components/common/active-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { Money } from "@/components/common/money";
import { RequireSalon } from "@/components/common/no-salon";
import { PageHeader } from "@/components/layout/page-header";
import { CouponFormDialog } from "@/components/promotions/coupon-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCoupons, useDeleteCoupon, type Coupon } from "@/hooks/use-coupons";
import { useCurrentSalon } from "@/hooks/use-salons";
import { formatDate } from "@/lib/format";
import { toastApiError } from "@/lib/form-errors";

export function CouponsPage() {
  return <RequireSalon>{(salonId) => <CouponsBody salonId={salonId} />}</RequireSalon>;
}

function CouponsBody({ salonId }: { salonId: number }) {
  const t = useTranslations("promotions");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { timezone } = useCurrentSalon();
  const coupons = useCoupons(salonId);
  const deleteCoupon = useDeleteCoupon(salonId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [deleting, setDeleting] = useState<Coupon | null>(null);

  const confirmDelete = () => {
    if (!deleting) return;
    deleteCoupon.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setDeleting(null);
      },
      onError: toastApiError,
    });
  };

  const validity = (coupon: Coupon) => {
    const from = coupon.startsAt
      ? t("validity.from", { date: formatDate(coupon.startsAt, timezone, locale) })
      : null;
    const until = coupon.endsAt
      ? t("validity.until", { date: formatDate(coupon.endsAt, timezone, locale) })
      : null;
    return [from, until].filter(Boolean).join(" · ") || t("validity.always");
  };

  const columns: DataTableColumn<Coupon>[] = [
    {
      key: "code",
      header: t("columns.code"),
      cell: (row) => <span className="font-mono font-medium">{row.code}</span>,
    },
    {
      key: "type",
      header: t("columns.type"),
      cell: (row) => <Badge variant="secondary">{t(`type.${row.type}`)}</Badge>,
    },
    {
      key: "value",
      header: t("columns.value"),
      className: "text-right",
      cell: (row) => (row.type === "PERCENT" ? `${row.value}%` : <Money minor={row.value} />),
    },
    {
      key: "usage",
      header: t("columns.usage"),
      cell: (row) => `${row.usedCount ?? 0} / ${row.usageLimit ?? t("unlimited")}`,
    },
    { key: "validity", header: t("columns.validity"), cell: validity },
    {
      key: "status",
      header: t("columns.status"),
      cell: (row) => <ActiveBadge active={row.active} />,
    },
    {
      key: "actions",
      header: <span className="sr-only">{tCommon("actions")}</span>,
      className: "w-12 text-right",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-sm" aria-label={tCommon("actions")} />}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditing(row)}>{tCommon("edit")}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row)}>
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            {t("new")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={coupons.data}
        rowKey={(row) => row.id}
        isLoading={coupons.isLoading}
        emptyMessage={t("empty")}
      />
      <CouponFormDialog salonId={salonId} open={createOpen} onOpenChange={setCreateOpen} />
      <CouponFormDialog
        salonId={salonId}
        coupon={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription", { code: deleting?.code ?? "" })}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={deleteCoupon.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
