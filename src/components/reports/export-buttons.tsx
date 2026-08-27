"use client";

/**
 * Excel / PDF export menu for the three salon reports. Downloads go through
 * `downloadFile` (bearer token + blob) and use the current period.
 */
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReportPeriod } from "@/hooks/use-reports";
import { toApiError } from "@/lib/api-error";
import { downloadFile } from "@/lib/download";

type ExportType = "EXCEL" | "PDF";
type ExportReport = "REVENUE" | "BOOKINGS" | "STAFF";

const TYPES: { type: ExportType; extension: string; labelKey: "excel" | "pdf" }[] = [
  { type: "EXCEL", extension: "xlsx", labelKey: "excel" },
  { type: "PDF", extension: "pdf", labelKey: "pdf" },
];
const REPORTS: { report: ExportReport; labelKey: "revenue" | "bookings" | "staff" }[] = [
  { report: "REVENUE", labelKey: "revenue" },
  { report: "BOOKINGS", labelKey: "bookings" },
  { report: "STAFF", labelKey: "staff" },
];

interface ExportButtonsProps {
  salonId: number;
  period: ReportPeriod;
}

export function ExportButtons({ salonId, period }: ExportButtonsProps) {
  const t = useTranslations("reports.export");
  const [isPending, setIsPending] = useState(false);

  const run = async (type: ExportType, report: ExportReport, extension: string) => {
    setIsPending(true);
    try {
      await downloadFile(
        `/api/v1/admin/salons/${salonId}/reports/export`,
        { from: period.from, to: period.to, type, report },
        `${report.toLowerCase()}-report.${extension}`
      );
      toast.success(t("started"));
    } catch (error) {
      toast.error(toApiError(error).message || t("failed"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" disabled={isPending} />}>
        <Download />
        {t("title")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {TYPES.map(({ type, extension, labelKey }, index) => (
          <DropdownMenuGroup key={type}>
            {index > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel className="flex items-center gap-1.5">
              {type === "EXCEL" ? (
                <FileSpreadsheet className="size-3.5" />
              ) : (
                <FileText className="size-3.5" />
              )}
              {t(labelKey)}
            </DropdownMenuLabel>
            {REPORTS.map(({ report, labelKey: reportKey }) => (
              <DropdownMenuItem key={report} onClick={() => run(type, report, extension)}>
                {t(reportKey)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
