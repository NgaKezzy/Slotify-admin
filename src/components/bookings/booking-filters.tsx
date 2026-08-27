"use client";

/**
 * Filter bar of the bookings list: free-text search, status, staff and date
 * range. Fully controlled; the parent keeps the values in the URL.
 */
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { BookingStatus } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Staff } from "@/hooks/use-staff";

/** Sentinel value for "no filter" in the selects (Base UI treats "" as placeholder). */
export const ALL = "all";

/** Debounce for the search input before it reaches the URL/API (ms). */
const SEARCH_DEBOUNCE_MS = 300;

export const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
  "REJECTED",
];

export interface BookingFilterValues {
  q: string;
  status: string;
  staffId: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: BookingFilterValues = {
  q: "",
  status: ALL,
  staffId: ALL,
  from: "",
  to: "",
};

interface BookingFiltersProps {
  values: BookingFilterValues;
  staff: Staff[];
  onChange: (values: BookingFilterValues) => void;
}

export function BookingFilters({ values, staff, onChange }: BookingFiltersProps) {
  const t = useTranslations("bookings.filters");
  const tStatus = useTranslations("status.booking");
  const [search, setSearch] = useState(values.q);
  const [syncedQuery, setSyncedQuery] = useState(values.q);

  // Keep the local search text in sync when the URL changes externally (e.g. dashboard link).
  if (syncedQuery !== values.q) {
    setSyncedQuery(values.q);
    setSearch(values.q);
  }

  useEffect(() => {
    if (search === values.q) return;
    const handle = setTimeout(() => onChange({ ...values, q: search }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const set = (patch: Partial<BookingFilterValues>) => onChange({ ...values, ...patch });
  const isDirty = JSON.stringify(values) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="flex flex-wrap items-end gap-2">
      <Input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("search")}
        aria-label={t("search")}
        className="w-64"
      />
      <Select value={values.status} onValueChange={(v) => set({ status: v ?? ALL })}>
        <SelectTrigger aria-label={t("status")} className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStatuses")}</SelectItem>
          {BOOKING_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {tStatus(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={values.staffId} onValueChange={(v) => set({ staffId: v ?? ALL })}>
        <SelectTrigger aria-label={t("staff")} className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>{t("allStaff")}</SelectItem>
          {staff.map((member) => (
            <SelectItem key={member.id} value={String(member.id)}>
              {member.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={values.from}
        onChange={(e) => set({ from: e.target.value })}
        aria-label={t("from")}
        className="w-40"
      />
      <Input
        type="date"
        value={values.to}
        onChange={(e) => set({ to: e.target.value })}
        aria-label={t("to")}
        className="w-40"
      />
      {isDirty ? (
        <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <X className="size-4" />
          {t("reset")}
        </Button>
      ) : null}
    </div>
  );
}
