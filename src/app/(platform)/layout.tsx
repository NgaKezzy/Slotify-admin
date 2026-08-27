/**
 * Platform (SUPER_ADMIN) shell: the dashboard chrome plus a secondary left
 * navigation for the platform screens. `src/proxy.ts` already redirects
 * non-admins; the role check here is the server-side belt and braces.
 */
import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { PlatformNav } from "@/components/layout/platform-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";

export default async function PlatformLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  if (!session || session.error) redirect("/login");
  if (session.user.role !== "SUPER_ADMIN") redirect("/");

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className="flex flex-1 flex-col gap-6 p-6 lg:flex-row">
          <PlatformNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
