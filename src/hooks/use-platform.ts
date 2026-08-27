/**
 * TanStack Query hooks for the SUPER_ADMIN platform area: overview KPIs,
 * salon approval/suspension/commission, user management, payouts report and
 * audit logs. Categories and amenities live in `use-platform-catalog.ts`.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type PlatformOverview = components["schemas"]["PlatformOverviewResponse"];
export type PlatformSalon = components["schemas"]["SalonSummaryResponse"];
export type PlatformSalonStatus = PlatformSalon["status"];
export type PlatformUser = components["schemas"]["PlatformUserResponse"];
export type PlatformUserRole = PlatformUser["role"];
export type PlatformUserStatus = PlatformUser["status"];
export type AuditLog = components["schemas"]["AuditLogResponse"];
export type AuditAction = AuditLog["action"];

/** One salon line of the payouts report (online revenue minus commission = payout). */
export type PayoutRow = components["schemas"]["PayoutsReportResponseRow"];

/** Payouts report: one row per active salon for the period. */
export type PayoutsReport = components["schemas"]["PayoutsReportResponse"];

export interface PlatformUsersParams {
  q?: string;
  role?: PlatformUserRole;
  page?: number;
  size?: number;
}

export interface AuditLogsParams {
  entity?: string;
  action?: AuditAction;
  page?: number;
  size?: number;
}

export interface PayoutsParams {
  from?: string;
  to?: string;
}

/** Query keys for the platform area. */
export const platformKeys = {
  all: ["platform"] as const,
  overview: () => [...platformKeys.all, "overview"] as const,
  salons: (status?: PlatformSalonStatus) =>
    [...platformKeys.all, "salons", status ?? "ALL"] as const,
  users: (params: PlatformUsersParams) => [...platformKeys.all, "users", params] as const,
  payouts: (params: PayoutsParams) => [...platformKeys.all, "payouts", params] as const,
  auditLogs: (params: AuditLogsParams) => [...platformKeys.all, "audit-logs", params] as const,
};

/** Platform-wide KPIs: salons by status, users by role, last-30-day bookings/revenue, top salons. */
export function usePlatformOverview() {
  return useQuery({
    queryKey: platformKeys.overview(),
    queryFn: async () => unwrap(await api.GET("/api/v1/admin/platform/reports/overview", {})),
  });
}

/** All salons, optionally filtered by status. */
export function usePlatformSalons(status?: PlatformSalonStatus) {
  return useQuery({
    queryKey: platformKeys.salons(status),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/platform/salons", {
          params: { query: status ? { status } : {} },
        })
      ),
  });
}

/** Approve / suspend / set commission for a salon. */
export function usePlatformSalonMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: platformKeys.all });

  const approve = useMutation({
    mutationFn: async (salonId: number) =>
      unwrap(
        await api.POST("/api/v1/admin/platform/salons/{salonId}/approve", {
          params: { path: { salonId } },
        })
      ),
    onSuccess: invalidate,
  });
  const suspend = useMutation({
    mutationFn: async (salonId: number) =>
      unwrap(
        await api.POST("/api/v1/admin/platform/salons/{salonId}/suspend", {
          params: { path: { salonId } },
        })
      ),
    onSuccess: invalidate,
  });
  const setCommission = useMutation({
    mutationFn: async ({
      salonId,
      commissionPercent,
    }: {
      salonId: number;
      commissionPercent: number;
    }) =>
      unwrap(
        await api.PUT("/api/v1/admin/platform/salons/{salonId}/commission", {
          params: { path: { salonId } },
          body: { commissionPercent },
        })
      ),
    onSuccess: invalidate,
  });
  return { approve, suspend, setCommission };
}

/** Paginated user directory with search and role filter. */
export function usePlatformUsers(params: PlatformUsersParams = {}) {
  return useQuery({
    queryKey: platformKeys.users(params),
    queryFn: async () =>
      unwrap(await api.GET("/api/v1/admin/platform/users", { params: { query: params } })),
  });
}

/** Change a user's status (suspend/activate) or role. */
export function usePlatformUserMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: platformKeys.all });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: PlatformUserStatus }) =>
      unwrap(
        await api.PUT("/api/v1/admin/platform/users/{id}/status", {
          params: { path: { id } },
          body: { status },
        })
      ),
    onSuccess: invalidate,
  });
  const setRole = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: PlatformUserRole }) =>
      unwrap(
        await api.PUT("/api/v1/admin/platform/users/{id}/role", {
          params: { path: { id } },
          body: { role },
        })
      ),
    onSuccess: invalidate,
  });
  return { setStatus, setRole };
}

/** Per-salon online revenue, commission and payout for a period. */
export function usePayoutsReport(params: PayoutsParams = {}) {
  return useQuery({
    queryKey: platformKeys.payouts(params),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/platform/reports/payouts", { params: { query: params } })
      ),
  });
}

/** Paginated audit trail with entity/action filters. */
export function useAuditLogs(params: AuditLogsParams = {}) {
  return useQuery({
    queryKey: platformKeys.auditLogs(params),
    queryFn: async () =>
      unwrap(await api.GET("/api/v1/admin/platform/audit-logs", { params: { query: params } })),
  });
}

export type BroadcastInput = components["schemas"]["BroadcastRequest"];
export type BroadcastResult = components["schemas"]["BroadcastResponse"];

/** Sends a platform announcement (in-app + push) to customers, staff or both. */
export function useBroadcastNotification() {
  return useMutation({
    mutationFn: async (body: BroadcastInput) =>
      unwrap(await api.POST("/api/v1/admin/platform/notifications/broadcast", { body })),
  });
}
