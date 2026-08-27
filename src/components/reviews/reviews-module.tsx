"use client";

/**
 * Reviews for the selected salon (\`/reviews\`).
 * Client boundary: the server page cannot pass the `RequireSalon` render
 * function itself, so this wrapper resolves the selected salon on the client.
 */
import { RequireSalon } from "@/components/common/no-salon";
import { ReviewsList } from "@/components/reviews/reviews-list";

export function ReviewsListModule() {
  return <RequireSalon>{(salonId) => <ReviewsList salonId={salonId} />}</RequireSalon>;
}
