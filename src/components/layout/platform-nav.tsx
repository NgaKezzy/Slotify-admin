"use client";

/**
 * Secondary navigation of the platform area (rendered by `(platform)/layout.tsx`
 * next to the page content): one link per platform screen plus a link back to
 * the salon dashboard.
 */
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { PLATFORM_NAV_ITEMS } from "@/components/layout/platform-nav-config";
import { cn } from "@/lib/utils";

export function PlatformNav() {
  const t = useTranslations("platform.nav");
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/platform" ? pathname === href : pathname.startsWith(href);

  return (
    <nav aria-label={t("overview")} className="flex flex-col gap-1 lg:w-52 lg:shrink-0">
      <ul className="flex flex-row flex-wrap gap-1 lg:flex-col">
        {PLATFORM_NAV_ITEMS.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted",
                isActive(item.href)
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-4" />
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/"
        className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t("backToDashboard")}
      </Link>
    </nav>
  );
}
