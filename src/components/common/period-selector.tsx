"use client";

/**
 * Date-range picker for report pages: quick presets (last 7/30 days, this/last
 * month) plus editable from/to inputs and an optional granularity switch.
 * Dates are `YYYY-MM-DD` strings computed in the given timezone.
 */
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportGranularity, ReportPeriod } from "@/hooks/use-reports";
import { toIsoDate } from "@/lib/format";

export type PeriodPreset = "last7" | "last30" | "thisMonth" | "lastMonth" | "custom";

const PRESETS: PeriodPreset[] = ["last7", "last30", "thisMonth", "lastMonth", "custom"];
const GRANULARITIES: ReportGranularity[] = ["DAY", "WEEK", "MONTH"];
const MS_PER_DAY = 86_400_000;

/**
 * Resolves a preset into a concrete period.
 * @param preset Preset name (`custom` returns the current period unchanged).
 * @param timeZone Salon timezone used to determine "today".
 * @param current Period to keep for `custom`.
 */
export function periodForPreset(
  preset: PeriodPreset,
  timeZone: string,
  current: ReportPeriod
): ReportPeriod {
  const now = new Date();
  const today = toIsoDate(now, timeZone);
  const daysAgo = (days: number) =>
    toIsoDate(new Date(now.getTime() - days * MS_PER_DAY), timeZone);
  const [year, month] = today.split("-").map(Number) as [number, number];
  const firstOfMonth = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}-01`;
  const lastOfMonth = (y: number, m: number) => toIsoDate(new Date(Date.UTC(y, m, 0, 12)), "UTC");

  switch (preset) {
    case "last7":
      return { from: daysAgo(6), to: today };
    case "last30":
      return { from: daysAgo(29), to: today };
    case "thisMonth":
      return { from: firstOfMonth(year, month), to: today };
    case "lastMonth": {
      const prevYear = month === 1 ? year - 1 : year;
      const prevMonth = month === 1 ? 12 : month - 1;
      return { from: firstOfMonth(prevYear, prevMonth), to: lastOfMonth(prevYear, prevMonth) };
    }
    default:
      return current;
  }
}

interface PeriodSelectorProps {
  period: ReportPeriod;
  preset: PeriodPreset;
  timeZone: string;
  onChange: (period: ReportPeriod, preset: PeriodPreset) => void;
  granularity?: ReportGranularity;
  onGranularityChange?: (granularity: ReportGranularity) => void;
}

export function PeriodSelector({
  period,
  preset,
  timeZone,
  onChange,
  granularity,
  onGranularityChange,
}: PeriodSelectorProps) {
  const t = useTranslations("reports.period");
  const tCommon = useTranslations("common");

  const setDate = (key: keyof ReportPeriod, value: string) => {
    if (!value) return;
    onChange({ ...period, [key]: value }, "custom");
  };

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="grid gap-1">
        <Label htmlFor="period-preset">{t("label")}</Label>
        <Select
          value={preset}
          onValueChange={(value) => {
            const next = value as PeriodPreset;
            onChange(periodForPreset(next, timeZone, period), next);
          }}
        >
          <SelectTrigger id="period-preset" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`presets.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="period-from">{tCommon("from")}</Label>
        <Input
          id="period-from"
          type="date"
          value={period.from}
          max={period.to}
          onChange={(event) => setDate("from", event.target.value)}
          className="w-40"
        />
      </div>
      <div className="grid gap-1">
        <Label htmlFor="period-to">{tCommon("to")}</Label>
        <Input
          id="period-to"
          type="date"
          value={period.to}
          min={period.from}
          onChange={(event) => setDate("to", event.target.value)}
          className="w-40"
        />
      </div>
      {granularity && onGranularityChange ? (
        <div className="grid gap-1">
          <Label htmlFor="period-granularity">{t("granularity")}</Label>
          <Select
            value={granularity}
            onValueChange={(value) => onGranularityChange(value as ReportGranularity)}
          >
            <SelectTrigger id="period-granularity" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GRANULARITIES.map((item) => (
                <SelectItem key={item} value={item}>
                  {t(item)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
