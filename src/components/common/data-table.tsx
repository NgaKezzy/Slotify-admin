"use client";

/**
 * Generic table for server-paginated lists. The API already handles paging,
 * sorting and filtering, so this component only renders rows and a pager –
 * no client-side table library needed.
 *
 * Usage:
 * ```tsx
 * <DataTable columns={columns} rows={page.items} rowKey={(r) => r.id}
 *   pagination={{ page: page.page, totalPages: page.totalPages, onPageChange }}
 *   isLoading={query.isLoading} emptyMessage={t("empty")} />
 * ```
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface DataTableColumn<Row> {
  /** Unique key, also used as React key. */
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** Extra classes for the header and body cell (e.g. `text-right w-32`). */
  className?: string;
}

export interface DataTablePagination {
  /** Zero-based current page. */
  page: number;
  totalPages: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[] | undefined;
  rowKey: (row: Row) => string | number;
  isLoading?: boolean;
  emptyMessage?: ReactNode;
  emptyAction?: ReactNode;
  pagination?: DataTablePagination;
  onRowClick?: (row: Row) => void;
  /** Number of skeleton rows shown while loading. */
  skeletonRows?: number;
}

export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  isLoading = false,
  emptyMessage,
  emptyAction,
  pagination,
  onRowClick,
  skeletonRows = 6,
}: DataTableProps<Row>) {
  const t = useTranslations("common");
  const showEmpty = !isLoading && (rows?.length ?? 0) === 0;

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: skeletonRows }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        <Skeleton className="h-4 w-full max-w-40" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rows?.map((row) => (
                  <TableRow
                    key={rowKey(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      {showEmpty ? (
        <EmptyState title={emptyMessage ?? t("noResults")} action={emptyAction} compact />
      ) : null}
      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t px-4 py-2 text-sm">
          <span className="text-muted-foreground">
            {t("pageOf", { page: pagination.page + 1, total: pagination.totalPages })}
            {pagination.totalItems !== undefined
              ? ` · ${t("totalItems", { count: pagination.totalItems })}`
              : null}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("previous")}
              disabled={pagination.page === 0}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("next")}
              disabled={pagination.page + 1 >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
