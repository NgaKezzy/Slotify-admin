/**
 * Coloured chip for a customer tag. The tag colour comes from the API (hex);
 * the chip tints its background and border with it and keeps the label in the
 * theme foreground colour so it stays readable in light and dark mode.
 */
import { X } from "lucide-react";
import type { CSSProperties } from "react";

import type { CustomerTag } from "@/hooks/use-customers";
import { cn } from "@/lib/utils";

/** Used when a tag has no colour stored. */
export const DEFAULT_TAG_COLOR = "#8b5cf6";

interface TagChipProps {
  tag: Pick<CustomerTag, "name" | "color">;
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
}

export function TagChip({ tag, onRemove, removeLabel, className }: TagChipProps) {
  const color = tag.color || DEFAULT_TAG_COLOR;
  const style = { "--tag-color": color } as CSSProperties;
  return (
    <span
      style={style}
      className={cn(
        "inline-flex h-5 items-center gap-1 rounded-full border border-(--tag-color)/40 bg-(--tag-color)/15 px-2 text-xs font-medium whitespace-nowrap text-foreground",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-(--tag-color)" aria-hidden />
      {tag.name}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="-mr-1 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
