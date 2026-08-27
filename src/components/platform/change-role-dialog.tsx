"use client";

/**
 * Dialog to change a platform user's role.
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePlatformUserMutations,
  type PlatformUser,
  type PlatformUserRole,
} from "@/hooks/use-platform";
import { toApiError } from "@/lib/api-error";

export const USER_ROLES: PlatformUserRole[] = ["SUPER_ADMIN", "SALON_OWNER", "STAFF", "CUSTOMER"];

interface ChangeRoleDialogProps {
  user: PlatformUser | null;
  onOpenChange: (open: boolean) => void;
}

export function ChangeRoleDialog({ user, onOpenChange }: ChangeRoleDialogProps) {
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      {user ? (
        // Keyed by user id so the select starts from that user's current role.
        <ChangeRoleForm key={user.id} user={user} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

interface ChangeRoleFormProps {
  user: PlatformUser;
  onOpenChange: (open: boolean) => void;
}

function ChangeRoleForm({ user, onOpenChange }: ChangeRoleFormProps) {
  const t = useTranslations("platform.users");
  const tCommon = useTranslations("common");
  const { setRole } = usePlatformUserMutations();
  const [role, setRoleValue] = useState<PlatformUserRole>(user.role);

  const submit = () => {
    setRole.mutate(
      { id: user.id, role },
      {
        onSuccess: () => {
          toast.success(t("roleDialog.saved"));
          onOpenChange(false);
        },
        onError: (error) => toast.error(toApiError(error).message),
      }
    );
  };

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>{t("roleDialog.title")}</DialogTitle>
        <DialogDescription>
          {t("roleDialog.description", { name: user.fullName })}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-1">
        <Label htmlFor="user-role">{t("roleDialog.role")}</Label>
        <Select value={role} onValueChange={(value) => setRoleValue(value as PlatformUserRole)}>
          <SelectTrigger id="user-role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {USER_ROLES.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`role.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={setRole.isPending}>
          {tCommon("cancel")}
        </Button>
        <Button onClick={submit} disabled={setRole.isPending || role === user.role}>
          {tCommon("save")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
