"use client";

/**
 * "Create a salon" page body (`/settings/new`). Posts the profile form to
 * `POST /admin/salons`, selects the new salon and explains that it is pending
 * approval. A CUSTOMER account becomes SALON_OWNER on the API, so the session
 * JWT must be refreshed: the user is signed out and asked to sign in again.
 */
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { SalonProfileForm } from "@/components/settings/salon-profile-form";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentSalon } from "@/hooks/use-salons";
import { useCreateSalon } from "@/hooks/use-settings";
import { applyApiError } from "@/lib/form-errors";

/** How long the re-login toast stays visible before signing out (ms). */
const SIGN_OUT_DELAY_MS = 3_000;

export function NewSalon() {
  const t = useTranslations("settings.newSalon");
  const router = useRouter();
  const { data: session } = useSession();
  const { setSalonId } = useCurrentSalon();
  const create = useCreateSalon();

  return (
    <div className="grid gap-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Card>
        <CardContent>
          <SalonProfileForm
            submitLabel={t("submit")}
            isPending={create.isPending}
            onSubmit={(body, setError) =>
              create.mutate(body, {
                onSuccess: (salon) => {
                  setSalonId(salon.id);
                  toast.success(t("created"));
                  if (session?.user.role === "CUSTOMER") {
                    toast.info(t("reloginNotice"), { duration: SIGN_OUT_DELAY_MS });
                    setTimeout(() => void signOut({ callbackUrl: "/login" }), SIGN_OUT_DELAY_MS);
                    return;
                  }
                  router.push("/settings");
                },
                onError: (error) => applyApiError(error, setError),
              })
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
