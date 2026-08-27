"use client";

/**
 * Platform salons list (`/platform/salons`): status filter, approve / suspend
 * actions (suspend asks for confirmation) and the commission dialog.
 */
import { Ban, Check, Percent, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { CommissionDialog } from "@/components/platform/commission-dialog";
import { SalonStatusBadge } from "@/components/platform/salon-status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePlatformSalonMutations,
  usePlatformSalons,
  type PlatformSalon,
  type PlatformSalonStatus,
} from "@/hooks/use-platform";
import { toApiError } from "@/lib/api-error";

type StatusFilter = "ALL" | PlatformSalonStatus;
const FILTERS: StatusFilter[] = ["ALL", "PENDING", "ACTIVE", "SUSPENDED"];

export function PlatformSalonsTable() {
  const t = useTranslations("platform");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [commissionTarget, setCommissionTarget] = useState<PlatformSalon | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<PlatformSalon | null>(null);
  const salons = usePlatformSalons(filter === "ALL" ? undefined : filter);
  const { approve, suspend } = usePlatformSalonMutations();
  const onError = (error: unknown) => toast.error(toApiError(error).message);

  const columns: DataTableColumn<PlatformSalon>[] = [
    {
      key: "salon",
      header: t("salons.columns.salon"),
      cell: (row) => (
        <div className="grid">
          <span className="font-medium">{row.name}</span>
          <span className="text-xs text-muted-foreground">{row.slug}</span>
        </div>
      ),
    },
    {
      key: "location",
      header: t("salons.columns.location"),
      cell: (row) => [row.city, row.country].filter(Boolean).join(", ") || "—",
    },
    {
      key: "rating",
      header: t("salons.columns.rating"),
      cell: (row) => (
        <span className="flex items-center gap-1 tabular-nums">
          <Star className="size-3.5 fill-warning text-warning" />
          {row.ratingAvg.toFixed(1)}
          <span className="text-xs text-muted-foreground">({row.ratingCount})</span>
        </span>
      ),
    },
    {
      key: "status",
      header: t("salons.columns.status"),
      cell: (row) => <SalonStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.status !== "ACTIVE" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={approve.isPending}
              onClick={() =>
                approve.mutate(row.id, {
                  onSuccess: () => toast.success(t("salons.approved")),
                  onError,
                })
              }
            >
              <Check />
              {t("salons.approve")}
            </Button>
          ) : null}
          {row.status !== "SUSPENDED" ? (
            <Button variant="outline" size="sm" onClick={() => setSuspendTarget(row)}>
              <Ban />
              {t("salons.suspend")}
            </Button>
          ) : null}
          <Button variant="ghost" size="sm" onClick={() => setCommissionTarget(row)}>
            <Percent />
            {t("salons.commission")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <Tabs value={filter} onValueChange={(value) => setFilter(value as StatusFilter)}>
        <TabsList>
          {FILTERS.map((item) => (
            <TabsTrigger key={item} value={item}>
              {item === "ALL" ? tCommon("all") : t(`overview.salonStatus.${item}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataTable
        columns={columns}
        rows={salons.data}
        rowKey={(row) => row.id}
        isLoading={salons.isLoading}
        emptyMessage={t("salons.empty")}
      />
      <CommissionDialog
        salon={commissionTarget}
        onOpenChange={(open) => !open && setCommissionTarget(null)}
      />
      <ConfirmDialog
        open={suspendTarget !== null}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={t("salons.suspendTitle")}
        description={t("salons.suspendDescription", { name: suspendTarget?.name ?? "" })}
        confirmLabel={t("salons.suspend")}
        destructive
        isPending={suspend.isPending}
        onConfirm={() =>
          suspendTarget &&
          suspend.mutate(suspendTarget.id, {
            onSuccess: () => {
              toast.success(t("salons.suspended"));
              setSuspendTarget(null);
            },
            onError,
          })
        }
      />
    </div>
  );
}
