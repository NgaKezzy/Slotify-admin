"use client";

/**
 * Header of the reviews page: average rating, total count and a 1–5 star
 * distribution with proportional bars (from the public summary endpoint).
 */
import { useLocale, useTranslations } from "next-intl";

import { RatingStars } from "@/components/reviews/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewSummary } from "@/hooks/use-reviews";

const STAR_LEVELS = [5, 4, 3, 2, 1];

export function ReviewsSummary({ salonId }: { salonId: number }) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  const summary = useReviewSummary(salonId);

  if (summary.isLoading) return <Skeleton className="h-40" />;
  if (!summary.data) return null;

  const { average, count, distribution } = summary.data;
  const averageText = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(average);

  return (
    <Card>
      <CardContent className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="grid justify-items-center gap-1 text-center sm:px-6">
          <span className="text-5xl font-semibold tracking-tight tabular-nums">{averageText}</span>
          <RatingStars rating={average} label={t("rating", { rating: averageText })} />
          <span className="text-sm text-muted-foreground">{t("summary.count", { count })}</span>
        </div>
        <div className="grid gap-1.5" aria-label={t("summary.distribution")}>
          {STAR_LEVELS.map((level) => {
            const value = distribution[String(level)] ?? 0;
            const percent = count === 0 ? 0 : Math.round((value / count) * 100);
            return (
              <div key={level} className="flex items-center gap-3 text-sm">
                <span className="w-14 text-muted-foreground">
                  {t("summary.stars", { count: level })}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-warning transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-8 text-right tabular-nums">{value}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
