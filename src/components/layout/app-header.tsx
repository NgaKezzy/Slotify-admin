/**
 * Sticky top bar of the dashboard: sidebar trigger, salon switcher,
 * language/theme toggles and the user menu.
 * Rendered by `src/app/(dashboard)/layout.tsx`.
 */
import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SalonSwitcher } from "@/components/layout/salon-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export async function AppHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur">
      <SidebarTrigger aria-label={t("toggleSidebar")} />
      <Separator orientation="vertical" className="mx-1 h-5!" />
      <SalonSwitcher />
      <div className="ml-auto flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
