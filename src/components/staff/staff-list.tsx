"use client";

/**
 * Staff list page body (`/staff`): table of team members with avatar, title,
 * assigned services count and status, plus create/edit/delete actions.
 * Rows link to the detail page (`/staff/[staffId]`).
 */
import { MoreHorizontal, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ActiveBadge } from "@/components/common/active-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import { RequireSalon } from "@/components/common/no-salon";
import { PageHeader } from "@/components/layout/page-header";
import { StaffAvatar } from "@/components/staff/staff-avatar";
import { StaffFormDialog } from "@/components/staff/staff-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeleteStaff, useStaffList, useUpdateStaff, type Staff } from "@/hooks/use-staff";
import { toastApiError } from "@/lib/form-errors";

export function StaffList() {
  return <RequireSalon>{(salonId) => <StaffTable salonId={salonId} />}</RequireSalon>;
}

function StaffTable({ salonId }: { salonId: number }) {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const staff = useStaffList(salonId);
  const updateStaff = useUpdateStaff(salonId);
  const deleteStaff = useDeleteStaff(salonId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [deleting, setDeleting] = useState<Staff | null>(null);

  const toggleActive = (member: Staff) => {
    updateStaff.mutate(
      {
        staffId: member.id,
        body: {
          displayName: member.displayName,
          title: member.title,
          bio: member.bio,
          avatarUrl: member.avatarUrl,
          active: !member.active,
        },
      },
      { onSuccess: () => toast.success(t("statusUpdated")), onError: toastApiError }
    );
  };

  const confirmDelete = () => {
    if (!deleting) return;
    deleteStaff.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setDeleting(null);
      },
      onError: toastApiError,
    });
  };

  const columns: DataTableColumn<Staff>[] = [
    {
      key: "member",
      header: t("columns.member"),
      cell: (row) => (
        <div className="flex items-center gap-3">
          <StaffAvatar staff={row} />
          <div className="grid">
            <span className="font-medium">{row.displayName}</span>
            <span className="text-xs text-muted-foreground">
              {row.email ?? t("profile.noEmail")}
            </span>
          </div>
        </div>
      ),
    },
    { key: "title", header: t("columns.jobTitle"), cell: (row) => row.title ?? "—" },
    {
      key: "services",
      header: t("columns.services"),
      cell: (row) => t("servicesCount", { count: row.serviceIds?.length ?? 0 }),
    },
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
            onClick={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem onClick={() => setEditing(row)}>{tCommon("edit")}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleActive(row)}>
              {row.active ? t("actions.deactivate") : t("actions.activate")}
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(row)}>
              {t("actions.delete")}
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
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            {t("new")}
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={staff.data}
        rowKey={(row) => row.id}
        isLoading={staff.isLoading}
        emptyMessage={t("empty")}
        onRowClick={(row) => router.push(`/staff/${row.id}`)}
      />
      <StaffFormDialog salonId={salonId} open={formOpen} onOpenChange={setFormOpen} />
      <StaffFormDialog
        salonId={salonId}
        staff={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription", { name: deleting?.displayName ?? "" })}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={deleteStaff.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
