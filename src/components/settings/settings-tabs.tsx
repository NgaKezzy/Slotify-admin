"use client";

/**
 * Settings page body (`/settings`): tabs Profile / Opening hours /
 * Booking & payments / Gallery for the selected salon.
 */
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { RequireSalon } from "@/components/common/no-salon";
import { PageSkeleton } from "@/components/common/page-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { BookingRulesForm } from "@/components/settings/booking-rules-form";
import { GalleryEditor } from "@/components/settings/gallery-editor";
import { OpeningHoursForm } from "@/components/settings/opening-hours-form";
import { SalonProfileForm } from "@/components/settings/salon-profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentSalon, useSalonDetail, type SalonDetail } from "@/hooks/use-salons";
import { useUpdateSalon } from "@/hooks/use-settings";
import { applyApiError } from "@/lib/form-errors";

export function SettingsTabs() {
  return <RequireSalon>{(salonId) => <SettingsBody salonId={salonId} />}</RequireSalon>;
}

function SettingsBody({ salonId }: { salonId: number }) {
  const t = useTranslations("settings");
  const detail = useSalonDetail(salonId);
  if (!detail.data) return <PageSkeleton />;
  const salon = detail.data;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Badge variant={salon.status === "ACTIVE" ? "secondary" : "outline"}>
            {t(`profile.statusValues.${salon.status}`)}
          </Badge>
        }
      />
      {salon.status === "PENDING" ? (
        <p className="rounded-lg border border-status-pending/30 bg-status-pending/10 px-4 py-3 text-sm">
          {t("newSalon.pendingNotice")}
        </p>
      ) : null}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">{t("tabs.profile")}</TabsTrigger>
          <TabsTrigger value="hours">{t("tabs.hours")}</TabsTrigger>
          <TabsTrigger value="rules">{t("tabs.rules")}</TabsTrigger>
          <TabsTrigger value="gallery">{t("tabs.gallery")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4">
          <ProfileTab salon={salon} />
        </TabsContent>
        <TabsContent value="hours" className="mt-4">
          <OpeningHoursForm salon={salon} />
        </TabsContent>
        <TabsContent value="rules" className="mt-4">
          <BookingRulesForm salon={salon} />
        </TabsContent>
        <TabsContent value="gallery" className="mt-4">
          <GalleryEditor salon={salon} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileTab({ salon }: { salon: SalonDetail }) {
  const t = useTranslations("settings.profile");
  const tCommon = useTranslations("common");
  const update = useUpdateSalon(salon.id);
  // Keep the header switcher in sync if the name changes.
  useCurrentSalon();

  return (
    <Card>
      <CardContent>
        <p className="mb-6 text-sm text-muted-foreground">{t("description")}</p>
        <SalonProfileForm
          salon={salon}
          submitLabel={tCommon("save")}
          isPending={update.isPending}
          onSubmit={(body, setError) =>
            update.mutate(body, {
              onSuccess: () => toast.success(t("saved")),
              onError: (error) => applyApiError(error, setError),
            })
          }
        />
      </CardContent>
    </Card>
  );
}
