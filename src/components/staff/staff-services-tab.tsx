"use client";

/**
 * "Services" tab of the staff detail page: checkbox list of the salon's
 * services grouped by category; saving replaces the assignment through
 * `PUT .../staff/{id}/services`.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useServices, type Service } from "@/hooks/use-services";
import { useReplaceStaffServices, type Staff } from "@/hooks/use-staff";
import { toastApiError } from "@/lib/form-errors";

/** Groups services by category name, keeping the API order inside each group. */
function groupByCategory(services: Service[]): [string, Service[]][] {
  const groups = new Map<string, Service[]>();
  for (const service of services) {
    const key = service.categoryName ?? "";
    groups.set(key, [...(groups.get(key) ?? []), service]);
  }
  return [...groups.entries()];
}

export function StaffServicesTab({ salonId, staff }: { salonId: number; staff: Staff }) {
  const t = useTranslations("staff.servicesTab");
  const tCommon = useTranslations("common");
  const services = useServices(salonId);
  const replaceServices = useReplaceStaffServices(salonId);
  const [selected, setSelected] = useState<Set<number>>(new Set(staff.serviceIds ?? []));
  const [syncedIds, setSyncedIds] = useState(staff.serviceIds);

  // Resync when the staff record refreshes (e.g. after saving), without an effect.
  if (syncedIds !== staff.serviceIds) {
    setSyncedIds(staff.serviceIds);
    setSelected(new Set(staff.serviceIds ?? []));
  }

  const toggle = (serviceId: number, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(serviceId);
      else next.delete(serviceId);
      return next;
    });

  const save = () =>
    replaceServices.mutate(
      { staffId: staff.id, serviceIds: [...selected] },
      { onSuccess: () => toast.success(t("saved")), onError: toastApiError }
    );

  if (services.isLoading) return <Skeleton className="h-48" />;
  if (!services.data?.length) return <EmptyState title={t("empty")} />;

  return (
    <Card>
      <CardHeader>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        {groupByCategory(services.data).map(([category, items]) => (
          <div key={category || "uncategorised"} className="grid gap-2">
            <p className="text-sm font-medium">{category || tCommon("none")}</p>
            {items.map((service) => {
              const id = `staff-service-${service.id}`;
              return (
                <div key={service.id} className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={selected.has(service.id)}
                    onCheckedChange={(checked) => toggle(service.id, checked === true)}
                  />
                  <Label htmlFor={id} className="font-normal">
                    {service.name}
                    {!service.active ? (
                      <span className="text-xs text-muted-foreground">({tCommon("inactive")})</span>
                    ) : null}
                  </Label>
                </div>
              );
            })}
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={save} disabled={replaceServices.isPending}>
          {replaceServices.isPending ? tCommon("saving") : tCommon("save")}
        </Button>
      </CardFooter>
    </Card>
  );
}
