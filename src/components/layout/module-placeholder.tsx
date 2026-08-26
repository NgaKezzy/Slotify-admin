/**
 * Placeholder body for modules that are scaffolded but not yet implemented.
 * Reads title/description from `modules.<moduleKey>` in the message bundle.
 * Remove the usage once the module gets real content.
 */
import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ModulePlaceholderProps {
  /** Key under `modules` in `src/messages/*.json`. */
  moduleKey: string;
}

export async function ModulePlaceholder({ moduleKey }: ModulePlaceholderProps) {
  const t = await getTranslations();

  return (
    <div className="grid gap-6">
      <PageHeader
        title={t(`modules.${moduleKey}.title`)}
        description={t(`modules.${moduleKey}.description`)}
      />
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Construction className="size-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t("common.comingSoon")}</p>
          <Badge variant="secondary">{t(`modules.${moduleKey}.title`)}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
