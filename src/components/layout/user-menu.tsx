/**
 * Avatar dropdown with the signed-in user's name and a sign-out action.
 * Reads the Auth.js session on the server; shows "Guest" when unauthenticated.
 * Used in `AppHeader`.
 */
import { LogOut, UserRound } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { logoutAction } from "@/app/(auth)/login/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { getInitials } from "@/lib/utils";

export async function UserMenu() {
  const t = await getTranslations();
  const session = await auth();
  const displayName = session?.user?.name ?? t("userMenu.guest");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label={t("userMenu.open")} />}
      >
        <Avatar className="size-7">
          {session?.user?.image ? <AvatarImage src={session.user.image} alt="" /> : null}
          <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="grid gap-0.5">
            <span className="truncate font-medium">{displayName}</span>
            {session?.user?.email ? (
              <span className="truncate text-xs font-normal text-muted-foreground">
                {session.user.email}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <UserRound />
          {t("userMenu.profile")}
        </DropdownMenuItem>
        <form action={logoutAction}>
          <DropdownMenuItem render={<button type="submit" className="w-full" />}>
            <LogOut />
            {t("auth.logout")}
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
