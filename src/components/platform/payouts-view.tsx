"use client";

/**
 * Payouts report (`/platform/payouts`): period selector, per-salon online
 * revenue / commission / payout / cash table and an Excel export.
 */
import { Download } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { DataTable, type DataTableColumn } from "@/components/common/data-table";
import {
  PeriodSelector,
  periodForPreset,
  type PeriodPreset,
} from "@/components/common/period-selector";
import { Button } from "@/components/ui/button";
import { usePayoutsReport, type PayoutRow } from "@/hooks/use-platform";
import type { ReportPeriod } from "@/hooks/use-reports";
import { toApiError } from "@/lib/api-error";
import { downloadFile } from "@/lib/download";
import { formatMoney, formatPercent } from "@/lib/format";

const DEFAULT_PRESET: PeriodPreset = "last30";
/** The platform report is computed in UTC. */
const REPORT_TIME_ZONE = "UTC";

export function PayoutsView() {
  const t = useTranslations("platform.payouts");
  const tExport = useTranslations("reports.export");
  const locale = useLocale();
  const [preset, setPreset] = useState<PeriodPreset>(DEFAULT_PRESET);
  const [period, setPeriod] = useState<ReportPeriod>(() =>
    periodForPreset(DEFAULT_PRESET, REPORT_TIME_ZONE, { from: "", to: "" })
  );
  const [isExporting, setIsExporting] = useState(false);
  const payouts = usePayoutsReport(period);

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      await downloadFile(
        "/api/v1/admin/platform/reports/payouts/export",
        { from: period.from, to: period.to, type: "EXCEL" },
        "payouts-report.xlsx"
      );
      toast.success(tExport("started"));
    } catch (error) {
      toast.error(toApiError(error).message || tExport("failed"));
    } finally {
      setIsExporting(false);
    }
  };

  const money = (row: PayoutRow, minor: number) => formatMoney(minor, row.currency, locale);
  const columns: DataTableColumn<PayoutRow>[] = [
    {
      key: "salon",
      header: t("columns.salon"),
      cell: (row) => <span className="font-medium">{row.salonName}</span>,
    },
    {
      key: "commissionPercent",
      header: t("columns.commission"),
      className: "text-right tabular-nums",
      cell: (row) => formatPercent(row.commissionPercent, locale),
    },
    {
      key: "online",
      header: t("columns.onlineRevenue"),
      className: "text-right tabular-nums",
      cell: (row) => money(row, row.onlineRevenueMinor),
    },
    {
      key: "commission",
      header: t("columns.commissionAmount"),
      className: "text-right tabular-nums",
      cell: (row) => money(row, row.commissionMinor),
    },
    {
      key: "payout",
      header: t("columns.payout"),
      className: "text-right font-medium tabular-nums",
      cell: (row) => money(row, row.payoutMinor),
    },
    {
      key: "cash",
      header: t("columns.cash"),
      className: "text-right tabular-nums text-muted-foreground",
      cell: (row) => money(row, row.cashRevenueMinor),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PeriodSelector
          period={period}
          preset={preset}
          timeZone={REPORT_TIME_ZONE}
          onChange={(next, nextPreset) => {
            setPeriod(next);
            setPreset(nextPreset);
          }}
        />
        <Button variant="outline" onClick={exportExcel} disabled={isExporting}>
          <Download />
          {t("export")}
        </Button>
      </div>
      <DataTable
        columns={columns}
        rows={payouts.data?.rows}
        rowKey={(row) => row.salonId}
        isLoading={payouts.isLoading}
        emptyMessage={t("empty")}
      />
    </div>
  );
}
