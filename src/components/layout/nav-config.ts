/**
 * Sidebar navigation definition. Labels are translation keys under `nav.*`
 * (see `src/messages/en.json`); icons come from lucide-react.
 * Consumed by `AppSidebar`.
 */
import type { Route } from "next";
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  type LucideIcon,
  Scissors,
  Settings,
  ShieldCheck,
  Star,
  Ticket,
  Users,
  UsersRound,
} from "lucide-react";

export interface NavItem {
  /** Translation key under `nav`; also used as React key. */
  key: string;
  href: Route;
  icon: LucideIcon;
}

export interface NavGroup {
  /** Translation key under `nav.groups`. */
  key: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    key: "salon",
    items: [
      { key: "dashboard", href: "/", icon: LayoutDashboard },
      { key: "bookings", href: "/bookings", icon: ClipboardList },
      { key: "calendar", href: "/calendar", icon: CalendarDays },
    ],
  },
  {
    key: "management",
    items: [
      { key: "staff", href: "/staff", icon: UsersRound },
      { key: "services", href: "/services", icon: Scissors },
      { key: "customers", href: "/customers", icon: Users },
      { key: "promotions", href: "/promotions", icon: Ticket },
      { key: "reviews", href: "/reviews", icon: Star },
      { key: "payments", href: "/payments", icon: CreditCard },
      { key: "reports", href: "/reports", icon: BarChart3 },
      { key: "settings", href: "/settings", icon: Settings },
    ],
  },
  {
    key: "admin",
    items: [{ key: "platform", href: "/platform", icon: ShieldCheck }],
  },
];
