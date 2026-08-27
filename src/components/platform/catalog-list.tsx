"use client";

/**
 * Generic CRUD list used by `/platform/categories` and `/platform/amenities`:
 * a DataTable with edit/delete per row, an "add" button and the shared dialog.
 * The caller supplies the query, mutations and the field definitions.
 */
import type { UseMutationResult } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import {
  CatalogDialog,
  type CatalogField,
  type CatalogValues,
} from "@/components/platform/catalog-dialog";
import { Button } from "@/components/ui/button";
import { toApiError } from "@/lib/api-error";

interface CatalogItem {
  id: number;
  name: string;
}

interface CatalogListProps<Item extends CatalogItem, Input> {
  items: Item[] | undefined;
  isLoading: boolean;
  fields: CatalogField[];
  columns: DataTableColumn<Item>[];
  addLabel: string;
  emptyMessage: string;
  /** Converts an item into dialog values (strings). */
  toValues: (item: Item | null) => CatalogValues;
  /** Converts dialog values into the API request body. */
  toInput: (values: CatalogValues) => Input;
  create: UseMutationResult<unknown, unknown, Input>;
  update: UseMutationResult<unknown, unknown, Input & { id: number }>;
  remove: UseMutationResult<unknown, unknown, number>;
  /** Optional content rendered left of the add button (e.g. a description). */
  toolbar?: ReactNode;
}

export function CatalogList<Item extends CatalogItem, Input>({
  items,
  isLoading,
  fields,
  columns,
  addLabel,
  emptyMessage,
  toValues,
  toInput,
  create,
  update,
  remove,
  toolbar,
}: CatalogListProps<Item, Input>) {
  const t = useTranslations("platform.catalog");
  const tCommon = useTranslations("common");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [deleting, setDeleting] = useState<Item | null>(null);
  const onError = (error: unknown) => toast.error(toApiError(error).message);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (item: Item) => {
    setEditing(item);
    setDialogOpen(true);
  };

  const submit = (values: CatalogValues) => {
    const input = toInput(values);
    const done = (message: string) => () => {
      toast.success(message);
      setDialogOpen(false);
    };
    if (editing) {
      update.mutate({ ...input, id: editing.id }, { onSuccess: done(t("updated")), onError });
    } else {
      create.mutate(input, { onSuccess: done(t("created")), onError });
    }
  };

  const allColumns: DataTableColumn<Item>[] = [
    ...columns,
    {
      key: "actions",
      header: "",
      className: "w-24 text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={tCommon("edit")}
            onClick={() => openEdit(row)}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={tCommon("delete")}
            onClick={() => setDeleting(row)}
          >
            <Trash2 className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>{toolbar}</div>
        <Button onClick={openCreate}>
          <Plus />
          {addLabel}
        </Button>
      </div>
      <DataTable
        columns={allColumns}
        rows={items}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />
      <CatalogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        formKey={editing ? String(editing.id) : "new"}
        title={editing ? t("editTitle") : t("createTitle")}
        fields={fields}
        initialValues={toValues(editing)}
        isPending={create.isPending || update.isPending}
        onSubmit={submit}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle", { name: deleting?.name ?? "" })}
        description={t("deleteDescription")}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={remove.isPending}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(t("deleted"));
              setDeleting(null);
            },
            onError,
          })
        }
      />
    </div>
  );
}
