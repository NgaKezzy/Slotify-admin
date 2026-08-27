"use client";

/**
 * Staff detail page body (`/staff/[staffId]`): header with avatar and status,
 * then tabs Profile / Services / Shifts / Time off. Profile actions (edit,
 * activate/deactivate, delete) live here; each other tab is its own component.
 */
import { ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ActiveBadge } from "@/components/common/active-badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { RequireSalon } from "@/components/common/no-salon";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { StaffAvatar } from "@/components/staff/staff-avatar";
import { StaffFormDialog } from "@/components/staff/staff-form-dialog";
import { StaffOverrides } from "@/components/staff/staff-overrides";
import { StaffServicesTab } from "@/components/staff/staff-services-tab";
import { StaffShiftsEditor } from "@/components/staff/staff-shifts-editor";
import { StaffTimeOff } from "@/components/staff/staff-time-off";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDeleteStaff, useStaff, useUpdateStaff, type Staff } from "@/hooks/use-staff";
import { toastApiError } from "@/lib/form-errors";

export function StaffDetail({ staffId }: { staffId: number }) {
  return (
    <RequireSalon>
      {(salonId) => <StaffDetailBody salonId={salonId} staffId={staffId} />}
    </RequireSalon>
  );
}

function StaffDetailBody({ salonId, staffId }: { salonId: number; staffId: number }) {
  const t = useTranslations("staff");
  const staff = useStaff(salonId, staffId);

  if (staff.isLoading) return <PageSkeleton />;
  if (!staff.data) {
    return (
      <EmptyState
        title={t("empty")}
        action={<Button render={<Link href="/staff" />}>{t("backToList")}</Button>}
      />
    );
  }
  return <StaffDetailContent salonId={salonId} staff={staff.data} />;
}

function StaffDetailContent({ salonId, staff }: { salonId: number; staff: Staff }) {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const updateStaff = useUpdateStaff(salonId);
  const deleteStaff = useDeleteStaff(salonId);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const toggleActive = () =>
    updateStaff.mutate(
      {
        staffId: staff.id,
        body: {
          displayName: staff.displayName,
          title: staff.title,
          bio: staff.bio,
          avatarUrl: staff.avatarUrl,
          active: !staff.active,
        },
      },
      { onSuccess: () => toast.success(t("statusUpdated")), onError: toastApiError }
    );

  const confirmDelete = () =>
    deleteStaff.mutate(staff.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        router.push("/staff");
      },
      onError: toastApiError,
    });

  return (
    <div className="grid gap-6">
      <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/staff" />}>
        <ArrowLeft className="size-4" />
        {t("backToList")}
      </Button>
      <div className="flex flex-wrap items-center gap-4">
        <StaffAvatar staff={staff} className="size-16 text-lg" />
        <div className="grid flex-1 gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{staff.displayName}</h1>
            <ActiveBadge active={staff.active} />
          </div>
          <p className="text-sm text-muted-foreground">{staff.title ?? "—"}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            {tCommon("edit")}
          </Button>
          <Button variant="outline" onClick={toggleActive} disabled={updateStaff.isPending}>
            {staff.active ? t("actions.deactivate") : t("actions.activate")}
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="services">{t("tabs.services")}</TabsTrigger>
          <TabsTrigger value="shifts">{t("tabs.shifts")}</TabsTrigger>
          <TabsTrigger value="timeOff">{t("tabs.timeOff")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <ProfileField
                label={t("profile.email")}
                value={staff.email ?? t("profile.noEmail")}
              />
              <ProfileField
                label={t("profile.rating")}
                value={
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-4 text-status-pending" />
                    {staff.ratingAvg?.toFixed(1) ?? "0.0"} ({staff.ratingCount ?? 0})
                  </span>
                }
              />
              <div className="sm:col-span-2">
                <ProfileField label={t("form.bio")} value={staff.bio ?? t("profile.noBio")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="services" className="mt-4">
          <StaffServicesTab salonId={salonId} staff={staff} />
        </TabsContent>
        <TabsContent value="shifts" className="mt-4 grid gap-6">
          <StaffShiftsEditor salonId={salonId} staffId={staff.id} />
          <StaffOverrides salonId={salonId} staffId={staff.id} />
        </TabsContent>
        <TabsContent value="timeOff" className="mt-4">
          <StaffTimeOff salonId={salonId} staffId={staff.id} />
        </TabsContent>
      </Tabs>

      <StaffFormDialog salonId={salonId} staff={staff} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("deleteTitle")}
        description={t("deleteDescription", { name: staff.displayName })}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={deleteStaff.isPending}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}
