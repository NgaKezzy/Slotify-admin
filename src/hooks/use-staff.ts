/**
 * TanStack Query hooks for the staff module: list/detail, weekly shifts,
 * shift overrides, time off and service assignment. Every mutation invalidates
 * the relevant `staffKeys` so lists and the detail page refresh automatically.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api, unwrap } from "@/lib/api-client";
import type { components } from "@/types/api";

export type Staff = components["schemas"]["StaffResponse"];
export type CreateStaffInput = components["schemas"]["CreateStaffRequest"];
export type UpdateStaffInput = components["schemas"]["UpdateStaffRequest"];
export type Shift = components["schemas"]["ShiftResponse"];
export type ShiftInput = components["schemas"]["ShiftRequest"];
export type DayOfWeek = ShiftInput["dayOfWeek"];
export type ShiftOverride = components["schemas"]["ShiftOverrideResponse"];
export type ShiftOverrideInput = components["schemas"]["ShiftOverrideRequest"];
export type TimeOff = components["schemas"]["TimeOffResponse"];
export type TimeOffInput = components["schemas"]["TimeOffRequest"];

/** Weekdays in display order (Monday first, as in the EU). */
export const DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

/** Query keys for the staff module. */
export const staffKeys = {
  all: (salonId: number) => ["staff", salonId] as const,
  list: (salonId: number) => [...staffKeys.all(salonId), "list"] as const,
  detail: (salonId: number, staffId: number) =>
    [...staffKeys.all(salonId), "detail", staffId] as const,
  shifts: (salonId: number, staffId: number) =>
    [...staffKeys.all(salonId), "shifts", staffId] as const,
  timeOff: (salonId: number, staffId: number) =>
    [...staffKeys.all(salonId), "timeOff", staffId] as const,
};

/** Path params shared by every staff-scoped call. */
const staffPath = (salonId: number, staffId: number) => ({ path: { salonId, staffId } });

/** Loads all staff members of a salon. */
export function useStaffList(salonId: number) {
  return useQuery({
    queryKey: staffKeys.list(salonId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/staff", { params: { path: { salonId } } })
      ),
  });
}

/** Loads one staff member. */
export function useStaff(salonId: number, staffId: number) {
  return useQuery({
    queryKey: staffKeys.detail(salonId, staffId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/staff/{staffId}", {
          params: staffPath(salonId, staffId),
        })
      ),
  });
}

/** Loads the weekly shifts of a staff member. */
export function useStaffShifts(salonId: number, staffId: number) {
  return useQuery({
    queryKey: staffKeys.shifts(salonId, staffId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/staff/{staffId}/shifts", {
          params: staffPath(salonId, staffId),
        })
      ),
  });
}

/** Loads the time-off entries of a staff member. */
export function useStaffTimeOff(salonId: number, staffId: number) {
  return useQuery({
    queryKey: staffKeys.timeOff(salonId, staffId),
    queryFn: async () =>
      unwrap(
        await api.GET("/api/v1/admin/salons/{salonId}/staff/{staffId}/time-off", {
          params: staffPath(salonId, staffId),
        })
      ),
  });
}

/** Invalidates every staff query of the salon after a mutation. */
function useInvalidateStaff(salonId: number) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: staffKeys.all(salonId) });
}

/** Creates a staff member (`POST .../staff`), optionally inviting them by email. */
export function useCreateStaff(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async (body: CreateStaffInput) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/staff", {
          params: { path: { salonId } },
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Updates profile fields and the active flag (`PUT .../staff/{id}`). */
export function useUpdateStaff(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, body }: { staffId: number; body: UpdateStaffInput }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/staff/{staffId}", {
          params: staffPath(salonId, staffId),
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Deletes a staff member (`DELETE .../staff/{id}`). */
export function useDeleteStaff(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async (staffId: number) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/staff/{staffId}", {
          params: staffPath(salonId, staffId),
        })
      ),
    onSuccess: invalidate,
  });
}

/** Replaces the services a staff member can perform (`PUT .../staff/{id}/services`). */
export function useReplaceStaffServices(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, serviceIds }: { staffId: number; serviceIds: number[] }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/staff/{staffId}/services", {
          params: staffPath(salonId, staffId),
          body: { serviceIds },
        })
      ),
    onSuccess: invalidate,
  });
}

/** Replaces the whole weekly schedule (`PUT .../staff/{id}/shifts`). */
export function useReplaceStaffShifts(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, shifts }: { staffId: number; shifts: ShiftInput[] }) =>
      unwrap(
        await api.PUT("/api/v1/admin/salons/{salonId}/staff/{staffId}/shifts", {
          params: staffPath(salonId, staffId),
          body: { shifts },
        })
      ),
    onSuccess: invalidate,
  });
}

/** Adds a one-day override (day off or custom window) (`POST .../shift-overrides`). */
export function useCreateShiftOverride(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, body }: { staffId: number; body: ShiftOverrideInput }) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/staff/{staffId}/shift-overrides", {
          params: staffPath(salonId, staffId),
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Removes a shift override (`DELETE .../shift-overrides/{overrideId}`). */
export function useDeleteShiftOverride(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, overrideId }: { staffId: number; overrideId: number }) =>
      unwrap(
        await api.DELETE(
          "/api/v1/admin/salons/{salonId}/staff/{staffId}/shift-overrides/{overrideId}",
          { params: { path: { salonId, staffId, overrideId } } }
        )
      ),
    onSuccess: invalidate,
  });
}

/** Adds a time-off entry (`POST .../time-off`). */
export function useCreateTimeOff(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, body }: { staffId: number; body: TimeOffInput }) =>
      unwrap(
        await api.POST("/api/v1/admin/salons/{salonId}/staff/{staffId}/time-off", {
          params: staffPath(salonId, staffId),
          body,
        })
      ),
    onSuccess: invalidate,
  });
}

/** Deletes a time-off entry (`DELETE .../time-off/{timeOffId}`). */
export function useDeleteTimeOff(salonId: number) {
  const invalidate = useInvalidateStaff(salonId);
  return useMutation({
    mutationFn: async ({ staffId, timeOffId }: { staffId: number; timeOffId: number }) =>
      unwrap(
        await api.DELETE("/api/v1/admin/salons/{salonId}/staff/{staffId}/time-off/{timeOffId}", {
          params: { path: { salonId, staffId, timeOffId } },
        })
      ),
    onSuccess: invalidate,
  });
}
