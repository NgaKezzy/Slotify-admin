"use client";

/**
 * Services DataTable with category filter, price/duration/buffer columns,
 * active toggle and edit/delete actions. Deleting is a soft delete on the API.
 */
import { MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ActiveBadge } from "@/components/common/active-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { Money } from "@/components/common/money";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useDeleteService,
  useServiceCategories,
  useServices,
  useUpdateService,
  type Service,
} from "@/hooks/use-services";
import { formatDuration } from "@/lib/format";
import { toastApiError } from "@/lib/form-errors";

/** Select value meaning "no category filter". */
const ALL = "all";

/** Maps a service response back to the request body (used for the active toggle). */
export function toServiceInput(service: Service, patch: Partial<Service> = {}) {
  const merged = { ...service, ...patch };
  return {
    categoryId: merged.categoryId,
    name: merged.name,
    description: merged.description,
    durationMin: merged.durationMin,
    bufferAfterMin: merged.bufferAfterMin,
    priceMinor: merged.priceMinor,
    imageUrl: merged.imageUrl,
    active: merged.active,
    sortOrder: merged.sortOrder,
  };
}

export function ServicesTable({
  salonId,
  onEdit,
}: {
  salonId: number;
  onEdit: (service: Service) => void;
}) {
  const t = useTranslations("services");
  const tCommon = useTranslations("common");
  const services = useServices(salonId);
  const categories = useServiceCategories(salonId);
  const updateService = useUpdateService(salonId);
  const deleteService = useDeleteService(salonId);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const rows = useMemo(() => {
    const list = services.data ?? [];
    if (categoryFilter === ALL) return list;
    return list.filter((s) => String(s.categoryId) === categoryFilter);
  }, [services.data, categoryFilter]);

  const toggleActive = (service: Service, active: boolean) =>
    updateService.mutate(
      { serviceId: service.id, body: toServiceInput(service, { active }) },
      { onSuccess: () => toast.success(t("statusUpdated")), onError: toastApiError }
    );

  const confirmDelete = () => {
    if (!deleting) return;
    deleteService.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setDeleting(null);
      },
      onError: toastApiError,
    });
  };

  const filterItems = [
    { value: ALL, label: t("allCategories") },
    ...(categories.data ?? []).map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const columns: DataTableColumn<Service>[] = [
    {
      key: "service",
      header: t("columns.service"),
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.imageUrl} alt="" className="size-9 rounded-md object-cover" />
          ) : (
            <div className="size-9 rounded-md bg-muted" />
          )}
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { key: "category", header: t("columns.category"), cell: (row) => row.categoryName ?? "—" },
    {
      key: "price",
      header: t("columns.price"),
      className: "text-right",
      cell: (row) => <Money minor={row.priceMinor} currency={row.currency} />,
    },
    {
      key: "duration",
      header: t("columns.duration"),
      cell: (row) => formatDuration(row.durationMin),
    },
    {
      key: "buffer",
      header: t("columns.buffer"),
      cell: (row) => tCommon("minutes", { count: row.bufferAfterMin ?? 0 }),
    },
    {
      key: "status",
      header: t("columns.status"),
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Switch
            size="sm"
            checked={row.active}
            aria-label={t("form.active")}
            onCheckedChange={(checked) => toggleActive(row, checked)}
          />
          <ActiveBadge active={row.active} />
        </div>
      ),
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
            <DropdownMenuItem onClick={() => onEdit(row)}>{tCommon("edit")}</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row)}>
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t("filterCategory")}</span>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v ?? ALL)}
          items={filterItems}
        >
          <SelectTrigger className="w-48" aria-label={t("filterCategory")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.id}
        isLoading={services.isLoading}
        emptyMessage={t("empty")}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription", { name: deleting?.name ?? "" })}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={deleteService.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
