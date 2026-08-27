"use client";

/**
 * Refund dialog: amount in major units (defaults to the refundable balance)
 * plus a mandatory reason. Posts to `.../payments/{id}/refund`.
 */
import { useLocale, useTranslations } from "next-intl";
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { refundableMinor, useRefundMutation, type Payment } from "@/hooks/use-payments";
import { toApiError } from "@/lib/api-error";
import { formatMoney } from "@/lib/format";

/** Minor units per major unit (cents per euro/dollar). */
const MINOR_PER_MAJOR = 100;

interface RefundDialogProps {
  salonId: number;
  payment: Payment | null;
  onOpenChange: (open: boolean) => void;
}

export function RefundDialog({ salonId, payment, onOpenChange }: RefundDialogProps) {
  return (
    <Dialog open={payment !== null} onOpenChange={onOpenChange}>
      {payment ? (
        // Keyed by payment id so the form starts fresh for every payment.
        <RefundForm
          key={payment.id}
          salonId={salonId}
          payment={payment}
          onOpenChange={onOpenChange}
        />
      ) : null}
    </Dialog>
  );
}

interface RefundFormProps {
  salonId: number;
  payment: Payment;
  onOpenChange: (open: boolean) => void;
}

function RefundForm({ salonId, payment, onOpenChange }: RefundFormProps) {
  const t = useTranslations("payments");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const refund = useRefundMutation(salonId);
  const maxMinor = refundableMinor(payment);
  const maxMajor = maxMinor / MINOR_PER_MAJOR;
  const [amount, setAmount] = useState(maxMajor.toFixed(2));
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});

  const submit = () => {
    const amountMinor = Math.round(Number(amount) * MINOR_PER_MAJOR);
    const nextErrors: typeof errors = {};
    if (!Number.isFinite(amountMinor) || amountMinor <= 0 || amountMinor > maxMinor) {
      nextErrors.amount = t("refundDialog.amountInvalid", { max: maxMajor.toFixed(2) });
    }
    if (!reason.trim()) nextErrors.reason = t("refundDialog.reasonRequired");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    refund.mutate(
      { paymentId: payment.id, amountMinor, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(t("refunded"));
          onOpenChange(false);
        },
        onError: (error) => toast.error(toApiError(error).message),
      }
    );
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{t("refundDialog.title")}</DialogTitle>
        <DialogDescription>
          {t("refundDialog.description", {
            code: payment.bookingCode,
            amount: formatMoney(maxMinor, payment.currency, locale),
          })}
        </DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.amount)}>
          <FieldLabel htmlFor="refund-amount">
            {t("refundDialog.amount")} ({payment.currency})
          </FieldLabel>
          <Input
            id="refund-amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            max={maxMajor}
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={Boolean(errors.amount)}
          />
          <FieldError>{errors.amount}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.reason)}>
          <FieldLabel htmlFor="refund-reason">{t("refundDialog.reason")}</FieldLabel>
          <Textarea
            id="refund-reason"
            rows={3}
            placeholder={t("refundDialog.reasonPlaceholder")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-invalid={Boolean(errors.reason)}
          />
          <FieldError>{errors.reason}</FieldError>
        </Field>
      </FieldGroup>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={refund.isPending}>
          {tCommon("cancel")}
        </Button>
        <Button variant="destructive" onClick={submit} disabled={refund.isPending}>
          {t("refundDialog.submit")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
