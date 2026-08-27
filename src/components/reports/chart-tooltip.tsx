"use client";

/**
 * Theme-aware tooltip for Recharts charts. Recharts' default tooltip is styled
 * with inline colours, so this component re-renders the payload with the
 * popover tokens and lets the caller format values (money, counts, ...).
 */
import type { ReactNode } from "react";

interface ChartTooltipPayload {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: ReactNode;
  payload?: ChartTooltipPayload[];
  /** Formats the numeric value of one series (default: as-is). */
  formatValue?: (value: number, entry: ChartTooltipPayload) => ReactNode;
  /** Translates a series key into its label (default: the key). */
  formatName?: (name: string) => ReactNode;
}

export function ChartTooltip({
  active,
  label,
  payload,
  formatValue,
  formatName,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="grid min-w-32 gap-1 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md">
      {label !== undefined && label !== "" ? <p className="font-medium">{label}</p> : null}
      {payload.map((entry, index) => {
        const value = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
        const key = String(entry.dataKey ?? entry.name ?? index);
        return (
          <div key={key} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ background: entry.color }}
                aria-hidden
              />
              {formatName ? formatName(String(entry.name ?? key)) : String(entry.name ?? key)}
            </span>
            <span className="font-medium tabular-nums">
              {formatValue ? formatValue(value, entry) : value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
