"use client";

/**
 * Inline CRUD list for service categories: name + sort order per row,
 * edit in place, delete with confirmation, add at the bottom.
 */
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCreateServiceCategory,
  useDeleteServiceCategory,
  useServiceCategories,
  useUpdateServiceCategory,
  type ServiceCategory,
} from "@/hooks/use-services";
import { toastApiError } from "@/lib/form-errors";

interface RowDraft {
  name: string;
  sortOrder: string;
}

/** One category row: read mode with edit/delete, or edit mode with save/cancel. */
function CategoryRow({
  category,
  onSave,
  onDelete,
  isPending,
}: {
  category: ServiceCategory;
  onSave: (draft: RowDraft) => void;
  onDelete: () => void;
  isPending: boolean;
}) {
  const t = useTranslations("services.categories");
  const tCommon = useTranslations("common");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RowDraft>({
    name: category.name,
    sortOrder: String(category.sortOrder ?? 0),
  });

  if (!editing) {
    return (
      <li className="flex items-center gap-2 py-1">
        <span className="w-8 text-xs text-muted-foreground tabular-nums">{category.sortOrder}</span>
        <span className="flex-1 text-sm">{category.name}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={tCommon("edit")}
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={tCommon("delete")} onClick={onDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-2 py-1">
      <Input
        type="number"
        aria-label={t("sortOrder")}
        className="w-16"
        value={draft.sortOrder}
        onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })}
      />
      <Input
        aria-label={t("name")}
        className="flex-1"
        value={draft.name}
        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tCommon("save")}
        disabled={isPending || !draft.name.trim()}
        onClick={() => {
          onSave(draft);
          setEditing(false);
        }}
      >
        <Check className="size-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={tCommon("cancel")}
        onClick={() => setEditing(false)}
      >
        <X className="size-3.5" />
      </Button>
    </li>
  );
}

export function CategoryManager({ salonId }: { salonId: number }) {
  const t = useTranslations("services.categories");
  const tCommon = useTranslations("common");
  const categories = useServiceCategories(salonId);
  const createCategory = useCreateServiceCategory(salonId);
  const updateCategory = useUpdateServiceCategory(salonId);
  const deleteCategory = useDeleteServiceCategory(salonId);
  const [newName, setNewName] = useState("");
  const [deleting, setDeleting] = useState<ServiceCategory | null>(null);

  const nextSortOrder = (categories.data?.length ?? 0) + 1;

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    createCategory.mutate(
      { name, sortOrder: nextSortOrder },
      {
        onSuccess: () => {
          toast.success(t("created"));
          setNewName("");
        },
        onError: toastApiError,
      }
    );
  };

  const save = (category: ServiceCategory, draft: RowDraft) =>
    updateCategory.mutate(
      {
        categoryId: category.id,
        body: { name: draft.name.trim(), sortOrder: Number(draft.sortOrder) || 0 },
      },
      { onSuccess: () => toast.success(t("updated")), onError: toastApiError }
    );

  const confirmDelete = () => {
    if (!deleting) return;
    deleteCategory.mutate(deleting.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setDeleting(null);
      },
      onError: toastApiError,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {categories.isLoading ? (
          <Skeleton className="h-24" />
        ) : categories.data?.length ? (
          <ul className="divide-y">
            {categories.data.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                onSave={(draft) => save(category, draft)}
                onDelete={() => setDeleting(category)}
                isPending={updateCategory.isPending}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            add();
          }}
        >
          <Input
            aria-label={t("name")}
            placeholder={t("name")}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button
            type="submit"
            variant="outline"
            disabled={createCategory.isPending || !newName.trim()}
          >
            <Plus className="size-4" />
            {tCommon("add")}
          </Button>
        </form>
      </CardContent>
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={deleteCategory.isPending}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
