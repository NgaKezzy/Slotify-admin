/**
 * Dashboard shell shared by all salon-owner pages: fixed sidebar, sticky
 * header (salon switcher, theme toggle, user menu) and a scrollable content area.
 * Requires a session (the proxy already redirects anonymous users; this is the
 * server-side belt and braces) and mounts the real-time bridge.
 */
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { RealtimeBridge } from "@/components/layout/realtime-bridge";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session || session.error) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <RealtimeBridge />
        <div className="flex-1 p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
