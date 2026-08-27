/**
 * Avatar with initials fallback for a staff member; used in the list and detail header.
 */
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Staff } from "@/hooks/use-staff";
import { cn } from "@/lib/utils";

/** First letters of up to two words ("Leo Barber" -> "LB"). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function StaffAvatar({ staff, className }: { staff: Staff; className?: string }) {
  return (
    <Avatar className={cn("size-9", className)}>
      {staff.avatarUrl ? <AvatarImage src={staff.avatarUrl} alt={staff.displayName} /> : null}
      <AvatarFallback>{initials(staff.displayName)}</AvatarFallback>
    </Avatar>
  );
}
