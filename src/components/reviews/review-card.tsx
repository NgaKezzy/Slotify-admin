"use client";

/**
 * One review: stars, comment, customer, staff, booking code, date, visibility
 * badge, the owner's reply and the reply / hide / show actions.
 */
import { Eye, EyeOff, MessageSquareReply } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { DateTime } from "@/components/common/date-time";
import { RatingStars } from "@/components/reviews/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useReviewVisibilityMutation, type Review } from "@/hooks/use-reviews";
import { toApiError } from "@/lib/api-error";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  salonId: number;
  review: Review;
  onReply: (review: Review) => void;
}

export function ReviewCard({ salonId, review, onReply }: ReviewCardProps) {
  const t = useTranslations("reviews");
  const visibility = useReviewVisibilityMutation(salonId);

  const toggleVisibility = () =>
    visibility.mutate(
      { reviewId: review.id, visible: !review.visible },
      {
        onSuccess: (updated) => toast.success(updated.visible ? t("shownToast") : t("hiddenToast")),
        onError: (error) => toast.error(toApiError(error).message),
      }
    );

  return (
    <Card className={cn(!review.visible && "opacity-75")}>
      <CardContent className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <RatingStars rating={review.rating} label={t("rating", { rating: review.rating })} />
            <span className="font-medium">{review.customerName}</span>
            <Badge
              variant="outline"
              className={cn(
                "font-medium",
                review.visible
                  ? "border-success/30 bg-success/15 text-success"
                  : "border-status-cancelled/30 bg-status-cancelled/15 text-status-cancelled"
              )}
            >
              {review.visible ? t("visible") : t("hidden")}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => onReply(review)}>
              <MessageSquareReply />
              {review.reply ? t("editReply") : t("reply")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleVisibility}
              disabled={visibility.isPending}
            >
              {review.visible ? <EyeOff /> : <Eye />}
              {review.visible ? t("hide") : t("show")}
            </Button>
          </div>
        </div>
        {review.comment ? <p className="text-sm">{review.comment}</p> : null}
        <p className="text-xs text-muted-foreground">
          {review.staff ? `${t("staff", { name: review.staff.displayName })} · ` : null}
          {t("booking", { code: review.bookingCode })} · <DateTime iso={review.createdAt} />
        </p>
        {review.reply ? (
          <div className="rounded-lg border-l-4 border-primary bg-muted/50 p-3 text-sm">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              {t("ownerReply")}
              {review.repliedAt ? (
                <>
                  {" · "}
                  <DateTime iso={review.repliedAt} />
                </>
              ) : null}
            </p>
            <p>{review.reply}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
