"use client";

/**
 * Salon categories CRUD (`/platform/categories`) built on `CatalogList`.
 */
import { useMemo } from "react";
import { useTranslations } from "next-intl";

import type { DataTableColumn } from "@/components/common/data-table";
import { CatalogList } from "@/components/platform/catalog-list";
import {
  useCategories,
  useCategoryMutations,
  type Category,
  type CategoryInput,
} from "@/hooks/use-platform-catalog";

export function CategoriesList() {
  const t = useTranslations("platform.catalog.categories");
  const categories = useCategories();
  const mutations = useCategoryMutations();

  const fields = useMemo(
    () => [
      { key: "name", label: t("name") },
      { key: "iconUrl", label: t("iconUrl") },
      { key: "sortOrder", label: t("sortOrder"), type: "number" as const },
    ],
    [t]
  );

  const columns: DataTableColumn<Category>[] = [
    {
      key: "sortOrder",
      header: t("sortOrder"),
      className: "w-24 tabular-nums",
      cell: (row) => row.sortOrder,
    },
    {
      key: "name",
      header: t("name"),
      cell: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "iconUrl",
      header: t("iconUrl"),
      cell: (row) =>
        row.iconUrl ? (
          <span className="block max-w-xs truncate font-mono text-xs text-muted-foreground">
            {row.iconUrl}
          </span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <CatalogList<Category, CategoryInput>
      items={categories.data}
      isLoading={categories.isLoading}
      fields={fields}
      columns={columns}
      addLabel={t("add")}
      emptyMessage={t("empty")}
      toValues={(item) => ({
        name: item?.name ?? "",
        iconUrl: item?.iconUrl ?? "",
        sortOrder: item ? String(item.sortOrder) : String((categories.data?.length ?? 0) + 1),
      })}
      toInput={(values) => ({
        name: values.name,
        iconUrl: values.iconUrl || undefined,
        sortOrder: values.sortOrder === "" ? undefined : Number(values.sortOrder),
      })}
      create={mutations.create}
      update={mutations.update}
      remove={mutations.remove}
    />
  );
}
