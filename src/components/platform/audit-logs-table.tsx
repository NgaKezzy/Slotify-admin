"use client";

/**
 * Audit trail (`/platform/audit-logs`): entity and action filters plus a
 * server-paginated table with a compact diff preview.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs, type AuditAction, type AuditLog } from "@/hooks/use-platform";

const PAGE_SIZE = 25;
const ALL_ACTIONS = "ALL";
const ACTIONS: AuditAction[] = [
  "BOOKING_CREATED",
  "BOOKING_STATUS_CHANGED",
  "BOOKING_RESCHEDULED",
  "PAYMENT_REFUNDED",
  "SALON_UPDATED",
  "SALON_SETTINGS_UPDATED",
  "SALON_STATUS_CHANGED",
  "STAFF_UPDATED",
  "USER_STATUS_CHANGED",
  "USER_DELETED",
];

export function AuditLogsTable() {
  const t = useTranslations("platform.auditLogs");
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState<string>(ALL_ACTIONS);
  const [page, setPage] = useState(0);
  const logs = useAuditLogs({
    entity: entity || undefined,
    action: action === ALL_ACTIONS ? undefined : (action as AuditAction),
    page,
    size: PAGE_SIZE,
  });

  const columns: DataTableColumn<AuditLog>[] = [
    {
      key: "when",
      header: t("columns.when"),
      className: "whitespace-nowrap",
      cell: (row) => <DateTime iso={row.createdAt} />,
    },
    {
      key: "action",
      header: t("columns.action"),
      cell: (row) => <Badge variant="secondary">{t(`action.${row.action}`)}</Badge>,
    },
    {
      key: "entity",
      header: t("columns.entity"),
      cell: (row) => (
        <span className="font-mono text-xs">
          {row.entity}#{row.entityId}
        </span>
      ),
    },
    {
      key: "actor",
      header: t("columns.actor"),
      className: "tabular-nums",
      cell: (row) => row.actorId ?? "—",
    },
    {
      key: "salon",
      header: t("columns.salon"),
      className: "tabular-nums",
      cell: (row) => row.salonId ?? "—",
    },
    {
      key: "diff",
      header: t("columns.diff"),
      cell: (row) => (
        <code
          className="block max-w-md truncate text-xs text-muted-foreground"
          title={JSON.stringify(row.diff)}
        >
          {row.diff ? JSON.stringify(row.diff) : "—"}
        </code>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={entity}
          onChange={(value) => {
            setEntity(value);
            setPage(0);
          }}
          placeholder={t("entityPlaceholder")}
        />
        <Select
          value={action}
          onValueChange={(value) => {
            setAction(value ?? ALL_ACTIONS);
            setPage(0);
          }}
        >
          <SelectTrigger aria-label={t("columns.action")} className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ACTIONS}>{t("allActions")}</SelectItem>
            {ACTIONS.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`action.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={logs.data?.items}
        rowKey={(row) => row.id}
        isLoading={logs.isLoading}
        emptyMessage={t("empty")}
        pagination={{
          page: logs.data?.page ?? 0,
          totalPages: logs.data?.totalPages ?? 0,
          totalItems: logs.data?.totalItems,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
