"use client";

/**
 * Platform users list (`/platform/users`): search, role filter, suspend /
 * activate (suspend asks for confirmation) and the change-role dialog.
 */
import { Ban, CircleCheck, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { DateTime } from "@/components/common/date-time";
import { SearchInput } from "@/components/common/search-input";
import { ChangeRoleDialog, USER_ROLES } from "@/components/platform/change-role-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePlatformUserMutations,
  usePlatformUsers,
  type PlatformUser,
  type PlatformUserRole,
  type PlatformUserStatus,
} from "@/hooks/use-platform";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const ALL_ROLES = "ALL";

const STATUS_CLASSES: Record<PlatformUserStatus, string> = {
  ACTIVE: "bg-status-completed/15 text-status-completed border-status-completed/30",
  SUSPENDED: "bg-status-rejected/15 text-status-rejected border-status-rejected/30",
  DELETED: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
};

export function PlatformUsersTable() {
  const t = useTranslations("platform.users");
  const tCommon = useTranslations("common");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string>(ALL_ROLES);
  const [page, setPage] = useState(0);
  const [roleTarget, setRoleTarget] = useState<PlatformUser | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<PlatformUser | null>(null);
  const users = usePlatformUsers({
    q: query || undefined,
    role: role === ALL_ROLES ? undefined : (role as PlatformUserRole),
    page,
    size: PAGE_SIZE,
  });
  const { setStatus } = usePlatformUserMutations();
  const onError = (error: unknown) => toast.error(toApiError(error).message);

  const changeStatus = (user: PlatformUser, status: PlatformUserStatus) =>
    setStatus.mutate(
      { id: user.id, status },
      {
        onSuccess: () => {
          toast.success(status === "ACTIVE" ? t("activated") : t("suspended"));
          setSuspendTarget(null);
        },
        onError,
      }
    );

  const columns: DataTableColumn<PlatformUser>[] = [
    {
      key: "user",
      header: t("columns.user"),
      cell: (row) => (
        <div className="grid">
          <span className="font-medium">{row.fullName}</span>
          <span className="text-xs text-muted-foreground">{row.email}</span>
        </div>
      ),
    },
    { key: "role", header: t("columns.role"), cell: (row) => t(`role.${row.role}`) },
    {
      key: "status",
      header: t("columns.status"),
      cell: (row) => (
        <Badge variant="outline" className={cn("font-medium", STATUS_CLASSES[row.status])}>
          {t(`status.${row.status}`)}
        </Badge>
      ),
    },
    {
      key: "provider",
      header: t("columns.provider"),
      cell: (row) => t(`provider.${row.provider}`),
    },
    {
      key: "createdAt",
      header: t("columns.createdAt"),
      cell: (row) => <DateTime iso={row.createdAt} mode="date" />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {row.status === "ACTIVE" ? (
            <Button variant="outline" size="sm" onClick={() => setSuspendTarget(row)}>
              <Ban />
              {t("suspend")}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled={setStatus.isPending}
              onClick={() => changeStatus(row, "ACTIVE")}
            >
              <CircleCheck />
              {t("activate")}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setRoleTarget(row)}>
            <UserCog />
            {t("changeRole")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(0);
          }}
          placeholder={t("searchPlaceholder")}
        />
        <Select
          value={role}
          onValueChange={(value) => {
            setRole(value ?? ALL_ROLES);
            setPage(0);
          }}
        >
          <SelectTrigger aria-label={t("columns.role")} className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>{tCommon("all")}</SelectItem>
            {USER_ROLES.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`role.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        rows={users.data?.items}
        rowKey={(row) => row.id}
        isLoading={users.isLoading}
        emptyMessage={t("empty")}
        pagination={{
          page: users.data?.page ?? 0,
          totalPages: users.data?.totalPages ?? 0,
          totalItems: users.data?.totalItems,
          onPageChange: setPage,
        }}
      />
      <ChangeRoleDialog user={roleTarget} onOpenChange={(open) => !open && setRoleTarget(null)} />
      <ConfirmDialog
        open={suspendTarget !== null}
        onOpenChange={(open) => !open && setSuspendTarget(null)}
        title={t("suspendTitle")}
        description={t("suspendDescription", { name: suspendTarget?.fullName ?? "" })}
        confirmLabel={t("suspend")}
        destructive
        isPending={setStatus.isPending}
        onConfirm={() => suspendTarget && changeStatus(suspendTarget, "SUSPENDED")}
      />
    </div>
  );
}
