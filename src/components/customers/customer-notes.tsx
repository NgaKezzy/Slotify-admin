"use client";

/**
 * Private notes about a customer: list (author + date), add form and delete
 * with confirmation. Notes are only visible to the salon team.
 */
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DateTime } from "@/components/common/date-time";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCustomerNoteMutations, type CustomerNote } from "@/hooks/use-customers";
import { toApiError } from "@/lib/api-error";

interface CustomerNotesProps {
  salonId: number;
  customerId: number;
  notes: CustomerNote[];
}

export function CustomerNotes({ salonId, customerId, notes }: CustomerNotesProps) {
  const t = useTranslations("customers.notes");
  const tCommon = useTranslations("common");
  const { add, remove } = useCustomerNoteMutations(salonId, customerId);
  const [draft, setDraft] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CustomerNote | null>(null);

  const submit = () => {
    const note = draft.trim();
    if (!note) return;
    add.mutate(note, {
      onSuccess: () => {
        toast.success(t("added"));
        setDraft("");
      },
      onError: (error) => toast.error(toApiError(error).message),
    });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    remove.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(t("deleted"));
        setPendingDelete(null);
      },
      onError: (error) => toast.error(toApiError(error).message),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="grid gap-3">
            {notes.map((note) => (
              <li key={note.id} className="flex items-start gap-3 rounded-lg border p-3">
                <div className="grid flex-1 gap-1">
                  <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  <p className="text-xs text-muted-foreground">
                    {t("by", { author: note.authorName })} · <DateTime iso={note.createdAt} />
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={tCommon("delete")}
                  onClick={() => setPendingDelete(note)}
                >
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <Textarea
            aria-label={t("title")}
            placeholder={t("placeholder")}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
          />
          <Button
            type="submit"
            className="justify-self-end"
            disabled={add.isPending || !draft.trim()}
          >
            {t("add")}
          </Button>
        </form>
      </CardContent>
      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(value) => !value && setPendingDelete(null)}
        title={t("deleteTitle")}
        description={t("deleteDescription")}
        confirmLabel={tCommon("delete")}
        destructive
        isPending={remove.isPending}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
