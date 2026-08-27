"use client";

/**
 * Reviews page body: summary header, visible/hidden filter tabs, paginated
 * review cards and the reply dialog.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ReplyReviewDialog } from "@/components/reviews/reply-review-dialog";
import { ReviewCard } from "@/components/reviews/review-card";
import { ReviewsSummary } from "@/components/reviews/reviews-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useReviews, type Review } from "@/hooks/use-reviews";

type VisibilityFilter = "all" | "visible" | "hidden";
const FILTERS: VisibilityFilter[] = ["all", "visible", "hidden"];
const PAGE_SIZE = 10;

export function ReviewsList({ salonId }: { salonId: number }) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(0);
  const [replyTarget, setReplyTarget] = useState<Review | null>(null);

  const visible = filter === "all" ? undefined : filter === "visible";
  const reviews = useReviews(salonId, { visible, page, size: PAGE_SIZE });
  const data = reviews.data;

  return (
    <div className="grid gap-6">
      <ReviewsSummary salonId={salonId} />
      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(value as VisibilityFilter);
          setPage(0);
        }}
      >
        <TabsList>
          {FILTERS.map((item) => (
            <TabsTrigger key={item} value={item}>
              {t(`filter.${item}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {reviews.isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <div className="grid gap-3">
          {data.items.map((review) => (
            <ReviewCard
              key={review.id}
              salonId={salonId}
              review={review}
              onReply={setReplyTarget}
            />
          ))}
        </div>
      ) : (
        <EmptyState title={t("empty")} />
      )}
      {data && data.totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {tCommon("pageOf", { page: data.page + 1, total: data.totalPages })}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label={tCommon("previous")}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={tCommon("next")}
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
      <ReplyReviewDialog
        salonId={salonId}
        review={replyTarget}
        onOpenChange={(open) => !open && setReplyTarget(null)}
      />
    </div>
  );
}
