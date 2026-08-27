"use client";

/**
 * Dialog to write or edit the owner's public reply to a review.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useReplyReviewMutation, type Review } from "@/hooks/use-reviews";
import { toApiError } from "@/lib/api-error";

interface ReplyReviewDialogProps {
  salonId: number;
  review: Review | null;
  onOpenChange: (open: boolean) => void;
}

export function ReplyReviewDialog({ salonId, review, onOpenChange }: ReplyReviewDialogProps) {
  return (
    <Dialog open={review !== null} onOpenChange={onOpenChange}>
      {review ? (
        // Keyed by review id so the textarea resets when another review is opened.
        <ReplyForm key={review.id} salonId={salonId} review={review} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

interface ReplyFormProps {
  salonId: number;
  review: Review;
  onOpenChange: (open: boolean) => void;
}

function ReplyForm({ salonId, review, onOpenChange }: ReplyFormProps) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const reply = useReplyReviewMutation(salonId);
  const [text, setText] = useState(review.reply ?? "");

  const submit = () => {
    const value = text.trim();
    if (!value) return toast.error(t("replyDialog.required"));
    reply.mutate(
      { reviewId: review.id, reply: value },
      {
        onSuccess: () => {
          toast.success(t("replied"));
          onOpenChange(false);
        },
        onError: (error) => toast.error(toApiError(error).message),
      }
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("replyDialog.title")}</DialogTitle>
        <DialogDescription>{t("replyDialog.description")}</DialogDescription>
      </DialogHeader>
      <blockquote className="rounded-lg border-l-4 border-warning bg-muted/50 p-3 text-sm">
        <span className="font-medium">{review.customerName}</span>
        <p className="mt-1 text-muted-foreground">{review.comment}</p>
      </blockquote>
      <Textarea
        aria-label={t("replyDialog.title")}
        placeholder={t("replyDialog.placeholder")}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
      />
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={reply.isPending}>
          {tCommon("cancel")}
        </Button>
        <Button onClick={submit} disabled={reply.isPending}>
          {t("replyDialog.submit")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
