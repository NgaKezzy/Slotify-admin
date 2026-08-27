"use client";

/**
 * Dialog to create, rename, recolour and delete the salon's customer tags.
 * Each row edits inline (name + native colour picker); deletion asks for confirmation.
 */
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DEFAULT_TAG_COLOR, TagChip } from "@/components/customers/tag-chip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCustomerTagMutations, useCustomerTags, type CustomerTag } from "@/hooks/use-customers";
import { toApiError } from "@/lib/api-error";

interface ManageTagsDialogProps {
  salonId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageTagsDialog({ salonId, open, onOpenChange }: ManageTagsDialogProps) {
  const t = useTranslations("customers.tags");
  const tCommon = useTranslations("common");
  const tags = useCustomerTags(salonId);
  const { create, update, remove } = useCustomerTagMutations(salonId);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(DEFAULT_TAG_COLOR);
  const [pendingDelete, setPendingDelete] = useState<CustomerTag | null>(null);

  const onError = (error: unknown) => toast.error(toApiError(error).message);

  const submitCreate = () => {
    const name = newName.trim();
    if (!name) return toast.error(t("nameRequired"));
    create.mutate(
      { name, color: newColor },
      {
        onSuccess: () => {
          toast.success(t("created"));
          setNewName("");
        },
        onError,
      }
    );
  };

  const submitUpdate = (tag: CustomerTag, patch: Partial<CustomerTag>) => {
    const name = (patch.name ?? tag.name).trim();
    if (!name) return toast.error(t("nameRequired"));
    if (name === tag.name && (patch.color ?? tag.color) === tag.color) return;
    update.mutate(
      { tagId: tag.id, name, color: patch.color ?? tag.color },
      { onSuccess: () => toast.success(t("updated")), onError }
    );
  };

  const submitDelete = () => {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setPendingDelete(null);
      },
      onError,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {(tags.data ?? []).map((tag) => (
            <TagRow
              key={tag.id}
              tag={tag}
              onSave={submitUpdate}
              onDelete={() => setPendingDelete(tag)}
            />
          ))}
          {tags.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noneDefined")}</p>
          ) : null}
        </div>
        <form
          className="flex items-center gap-2 border-t pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitCreate();
          }}
        >
          <input
            type="color"
            aria-label={t("color")}
            value={newColor}
            onChange={(event) => setNewColor(event.target.value)}
            className="size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
          />
          <Input
            aria-label={t("name")}
            placeholder={t("name")}
            value={newName}
            onChange={(event) => setNewName(event.target.value)}
          />
          <Button type="submit" disabled={create.isPending}>
            <Plus />
            {t("add")}
          </Button>
        </form>
        <ConfirmDialog
          open={pendingDelete !== null}
          onOpenChange={(value) => !value && setPendingDelete(null)}
          title={t("deleteTitle")}
          description={t("deleteDescription", { name: pendingDelete?.name ?? "" })}
          confirmLabel={tCommon("delete")}
          destructive
          isPending={remove.isPending}
          onConfirm={submitDelete}
        />
      </DialogContent>
    </Dialog>
  );
}

interface TagRowProps {
  tag: CustomerTag;
  onSave: (tag: CustomerTag, patch: Partial<CustomerTag>) => void;
  onDelete: () => void;
}

function TagRow({ tag, onSave, onDelete }: TagRowProps) {
  const t = useTranslations("customers.tags");
  const tCommon = useTranslations("common");
  const [name, setName] = useState(tag.name);
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={t("color")}
        value={tag.color || DEFAULT_TAG_COLOR}
        onChange={(event) => onSave(tag, { color: event.target.value })}
        className="size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
      />
      <Input
        aria-label={t("name")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => onSave(tag, { name })}
        onKeyDown={(event) => event.key === "Enter" && onSave(tag, { name })}
      />
      <TagChip
        tag={{ name: name || tag.name, color: tag.color }}
        className="hidden sm:inline-flex"
      />
      <Button variant="ghost" size="icon-sm" aria-label={tCommon("delete")} onClick={onDelete}>
        <Trash2 className="text-destructive" />
      </Button>
    </div>
  );
}
