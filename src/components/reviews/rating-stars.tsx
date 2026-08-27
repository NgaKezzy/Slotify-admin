/**
 * Five-star rating display (filled stars use the `warning` token so they read
 * well in both themes). Purely presentational; the accessible label is supplied by the caller.
 */
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

const MAX_RATING = 5;

interface RatingStarsProps {
  rating: number;
  label: string;
  className?: string;
}

export function RatingStars({ rating, label, className }: RatingStarsProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={label}
    >
      {Array.from({ length: MAX_RATING }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < Math.round(rating) ? "fill-warning text-warning" : "text-muted-foreground/40"
          )}
        />
      ))}
    </span>
  );
}
