"use client";

/**
 * Dialog to set the platform commission percentage of one salon.
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { usePlatformSalonMutations, type PlatformSalon } from "@/hooks/use-platform";
import { toApiError } from "@/lib/api-error";

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

interface CommissionDialogProps {
  salon: PlatformSalon | null;
  onOpenChange: (open: boolean) => void;
}

export function CommissionDialog({ salon, onOpenChange }: CommissionDialogProps) {
  return (
    <Dialog open={salon !== null} onOpenChange={onOpenChange}>
      {salon ? (
        // Keyed by salon id so the input resets for every salon.
        <CommissionForm key={salon.id} salon={salon} onOpenChange={onOpenChange} />
      ) : null}
    </Dialog>
  );
}

interface CommissionFormProps {
  salon: PlatformSalon;
  onOpenChange: (open: boolean) => void;
}

function CommissionForm({ salon, onOpenChange }: CommissionFormProps) {
  const t = useTranslations("platform.salons.commissionDialog");
  const tCommon = useTranslations("common");
  const { setCommission } = usePlatformSalonMutations();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();

  const submit = () => {
    const percent = Number(value);
    if (
      value === "" ||
      !Number.isFinite(percent) ||
      percent < MIN_PERCENT ||
      percent > MAX_PERCENT
    ) {
      setError(t("invalid"));
      return;
    }
    setCommission.mutate(
      { salonId: salon.id, commissionPercent: percent },
      {
        onSuccess: () => {
          toast.success(t("saved"));
          onOpenChange(false);
        },
        onError: (mutationError) => toast.error(toApiError(mutationError).message),
      }
    );
  };

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>{t("title")}</DialogTitle>
        <DialogDescription>{t("description", { name: salon.name })}</DialogDescription>
      </DialogHeader>
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor="commission-percent">{t("percent")}</FieldLabel>
        <Input
          id="commission-percent"
          type="number"
          inputMode="decimal"
          min={MIN_PERCENT}
          max={MAX_PERCENT}
          step="0.5"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={Boolean(error)}
        />
        <FieldError>{error}</FieldError>
      </Field>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={setCommission.isPending}
        >
          {tCommon("cancel")}
        </Button>
        <Button onClick={submit} disabled={setCommission.isPending}>
          {tCommon("save")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
