"use client";

/**
 * Fixed left navigation for the dashboard, built on the shadcn Sidebar.
 * Highlights the active route and collapses to icons on narrow screens.
 * The "Administration" group is only shown to SUPER_ADMIN users.
 * Rendered by `src/app/(dashboard)/layout.tsx` and `src/app/(platform)/layout.tsx`.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { NAV_GROUPS } from "@/components/layout/nav-config";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

/** Key of the nav group reserved for SUPER_ADMIN (see `nav-config.ts`). */
const ADMIN_GROUP_KEY = "admin";

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSuperAdmin = session?.user.role === "SUPER_ADMIN";
  const groups = NAV_GROUPS.filter((group) => group.key !== ADMIN_GROUP_KEY || isSuperAdmin);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BrandLogo className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{t("app.name")}</span>
                <span className="truncate text-xs text-muted-foreground">{t("app.tagline")}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.key}>
            <SidebarGroupLabel>{t(`nav.groups.${group.key}`)}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      isActive={isActive(item.href)}
                      tooltip={t(`nav.${item.key}`)}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{t(`nav.${item.key}`)}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
