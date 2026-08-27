"use client";

/**
 * Tags card on the customer detail page: shows assigned tags as chips, lets the
 * owner toggle tags from the salon's catalogue (saved immediately) and opens the
 * manage-tags dialog to create/edit/delete tags.
 */
import { Check, Plus, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { ManageTagsDialog } from "@/components/customers/manage-tags-dialog";
import { TagChip } from "@/components/customers/tag-chip";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAssignTagsMutation, useCustomerTags, type CustomerTag } from "@/hooks/use-customers";
import { toApiError } from "@/lib/api-error";

interface CustomerTagsEditorProps {
  salonId: number;
  customerId: number;
  assigned: CustomerTag[];
}

export function CustomerTagsEditor({ salonId, customerId, assigned }: CustomerTagsEditorProps) {
  const t = useTranslations("customers.tags");
  const tags = useCustomerTags(salonId);
  const assign = useAssignTagsMutation(salonId, customerId);
  const [manageOpen, setManageOpen] = useState(false);
  const assignedIds = new Set(assigned.map((tag) => tag.id));

  const save = (tagIds: number[]) =>
    assign.mutate(tagIds, {
      onSuccess: () => toast.success(t("assigned")),
      onError: (error) => toast.error(toApiError(error).message),
    });

  const toggle = (tagId: number) => {
    const next = assignedIds.has(tagId)
      ? [...assignedIds].filter((id) => id !== tagId)
      : [...assignedIds, tagId];
    save(next);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardAction className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" disabled={assign.isPending} />}
            >
              <Plus />
              {t("assign")}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {(tags.data ?? []).map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={assignedIds.has(tag.id)}
                  onCheckedChange={() => toggle(tag.id)}
                >
                  <TagChip tag={tag} />
                </DropdownMenuCheckboxItem>
              ))}
              {tags.data?.length === 0 ? (
                <p className="px-2 py-1.5 text-xs text-muted-foreground">{t("noneDefined")}</p>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("manage")}
            onClick={() => setManageOpen(true)}
          >
            <Settings2 />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {assigned.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noTags")}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {assigned.map((tag) => (
              <TagChip
                key={tag.id}
                tag={tag}
                onRemove={() => toggle(tag.id)}
                removeLabel={`${t("title")}: ${tag.name}`}
              />
            ))}
          </div>
        )}
        {assign.isPending ? <Check className="sr-only" /> : null}
      </CardContent>
      <ManageTagsDialog salonId={salonId} open={manageOpen} onOpenChange={setManageOpen} />
    </Card>
  );
}
