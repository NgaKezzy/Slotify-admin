/**
 * Left navigation of the SUPER_ADMIN platform area. Labels are translation
 * keys under `platform.nav.*`; consumed by `PlatformNav`.
 */
import type { Route } from "next";
import {
  ClipboardList,
  Landmark,
  LayoutDashboard,
  type LucideIcon,
  Sparkles,
  Store,
  Tags,
  Users,
} from "lucide-react";

export interface PlatformNavItem {
  /** Translation key under `platform.nav`; also used as React key. */
  key: string;
  href: Route;
  icon: LucideIcon;
}

export const PLATFORM_NAV_ITEMS: PlatformNavItem[] = [
  { key: "overview", href: "/platform", icon: LayoutDashboard },
  { key: "salons", href: "/platform/salons", icon: Store },
  { key: "users", href: "/platform/users", icon: Users },
  { key: "categories", href: "/platform/categories", icon: Tags },
  { key: "amenities", href: "/platform/amenities", icon: Sparkles },
  { key: "payouts", href: "/platform/payouts", icon: Landmark },
  { key: "auditLogs", href: "/platform/audit-logs", icon: ClipboardList },
];
