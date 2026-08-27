"use client";

/**
 * Amenities CRUD (`/platform/amenities`) built on `CatalogList`.
 */
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import type { DataTableColumn } from "@/components/common/data-table";
import { CatalogList } from "@/components/platform/catalog-list";
import {
  useAmenities,
  useAmenityMutations,
  type Amenity,
  type AmenityInput,
} from "@/hooks/use-platform-catalog";

export function AmenitiesList() {
  const t = useTranslations("platform.catalog.amenities");
  const amenities = useAmenities();
  const mutations = useAmenityMutations();

  const fields = useMemo(
    () => [
      { key: "name", label: t("name") },
      { key: "icon", label: t("icon") },
    ],
    [t]
  );

  const columns: DataTableColumn<Amenity>[] = [
    {
      key: "name",
      header: t("name"),
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "icon",
      header: t("icon"),
      cell: (row) =>
        row.icon ? (
          <span className="font-mono text-xs text-muted-foreground">{row.icon}</span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <CatalogList<Amenity, AmenityInput>
      items={amenities.data}
      isLoading={amenities.isLoading}
      fields={fields}
      columns={columns}
      addLabel={t("add")}
      emptyMessage={t("empty")}
      toValues={(item) => ({ name: item?.name ?? "", icon: item?.icon ?? "" })}
      toInput={(values) => ({ name: values.name, icon: values.icon || undefined })}
      create={mutations.create}
      update={mutations.update}
      remove={mutations.remove}
    />
  );
}
