"use client";

/**
 * Create/edit dialog shared by the categories and amenities lists. Renders a
 * name field plus the extra fields the caller declares (icon URL, sort order, ...).
 */
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

/** Extra text/number field rendered below the name. */
export interface CatalogField {
  key: string;
  label: string;
  type?: "text" | "number";
}

/** Values keyed by field key; `name` is always present. */
export type CatalogValues = Record<string, string>;

interface CatalogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Changes whenever a different item (or "new") is edited so the form remounts. */
  formKey: string;
  title: string;
  fields: CatalogField[];
  initialValues: CatalogValues;
  isPending: boolean;
  onSubmit: (values: CatalogValues) => void;
}

export function CatalogDialog({ open, onOpenChange, formKey, ...formProps }: CatalogDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? <CatalogForm key={formKey} onOpenChange={onOpenChange} {...formProps} /> : null}
    </Dialog>
  );
}

type CatalogFormProps = Omit<CatalogDialogProps, "open" | "formKey">;

function CatalogForm({
  onOpenChange,
  title,
  fields,
  initialValues,
  isPending,
  onSubmit,
}: CatalogFormProps) {
  const t = useTranslations("platform.catalog");
  const tCommon = useTranslations("common");
  const [values, setValues] = useState<CatalogValues>(initialValues);
  const [nameError, setNameError] = useState<string>();

  const submit = () => {
    if (!values.name?.trim()) {
      setNameError(t("nameRequired"));
      toast.error(t("nameRequired"));
      return;
    }
    onSubmit({ ...values, name: values.name.trim() });
  };

  return (
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <FieldGroup>
          {fields.map((field) => {
            const isName = field.key === "name";
            return (
              <Field key={field.key} data-invalid={isName && Boolean(nameError)}>
                <FieldLabel htmlFor={`catalog-${field.key}`}>{field.label}</FieldLabel>
                <Input
                  id={`catalog-${field.key}`}
                  type={field.type ?? "text"}
                  value={values[field.key] ?? ""}
                  onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                  aria-invalid={isName && Boolean(nameError)}
                />
                {isName ? <FieldError>{nameError}</FieldError> : null}
              </Field>
            );
          })}
        </FieldGroup>
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" disabled={isPending}>
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
