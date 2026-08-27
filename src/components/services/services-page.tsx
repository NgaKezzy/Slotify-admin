"use client";

/**
 * Services module page body (`/services`): category manager on the left,
 * services table (filterable by category) with create/edit/delete on the right.
 */
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { RequireSalon } from "@/components/common/no-salon";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryManager } from "@/components/services/category-manager";
import { ServiceFormDialog } from "@/components/services/service-form-dialog";
import { ServicesTable } from "@/components/services/services-table";
import { Button } from "@/components/ui/button";
import type { Service } from "@/hooks/use-services";

export function ServicesPage() {
  return <RequireSalon>{(salonId) => <ServicesBody salonId={salonId} />}</RequireSalon>;
}

function ServicesBody({ salonId }: { salonId: number }) {
  const t = useTranslations("services");
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

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
      <div className="grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <CategoryManager salonId={salonId} />
        <ServicesTable salonId={salonId} onEdit={setEditing} />
      </div>
      <ServiceFormDialog salonId={salonId} open={createOpen} onOpenChange={setCreateOpen} />
      <ServiceFormDialog
        salonId={salonId}
        service={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </div>
  );
}
