"use client";

/**
 * Create / edit dialog for a staff member. Without `staff` it creates
 * (`POST .../staff`, optional invite email); with `staff` it updates
 * (`PUT .../staff/{id}`, including the active flag).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ImageUpload } from "@/components/common/image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStaff, useUpdateStaff, type Staff } from "@/hooks/use-staff";
import { applyApiError } from "@/lib/form-errors";
import { UploadFolders } from "@/lib/upload";
import { optionalEmail, optionalString, requiredString, useFieldError } from "@/lib/validation";

const formSchema = z.object({
  displayName: requiredString,
  title: optionalString,
  bio: optionalString,
  avatarUrl: z.string().optional(),
  inviteEmail: optionalEmail,
  active: z.boolean(),
});

type FormInput = z.input<typeof formSchema>;
type FormValues = z.output<typeof formSchema>;

interface StaffFormDialogProps {
  salonId: number;
  staff?: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function defaultsFor(staff?: Staff): FormInput {
  return {
    displayName: staff?.displayName ?? "",
    title: staff?.title ?? "",
    bio: staff?.bio ?? "",
    avatarUrl: staff?.avatarUrl ?? undefined,
    inviteEmail: "",
    active: staff?.active ?? true,
  };
}

export function StaffFormDialog({ salonId, staff, open, onOpenChange }: StaffFormDialogProps) {
  const t = useTranslations("staff.form");
  const tCommon = useTranslations("common");
  const fieldError = useFieldError();
  const createStaff = useCreateStaff(salonId);
  const updateStaff = useUpdateStaff(salonId);
  const isEdit = staff !== undefined;
  const isPending = createStaff.isPending || updateStaff.isPending;

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultsFor(staff),
  });
  const { register, control, handleSubmit, reset, setError, formState } = form;

  // Reload defaults whenever the dialog opens for a different member.
  useEffect(() => {
    if (open) reset(defaultsFor(staff));
  }, [open, staff, reset]);

  const onSubmit = (values: FormValues) => {
    const onError = (error: unknown) => applyApiError(error, setError);
    if (isEdit) {
      updateStaff.mutate(
        {
          staffId: staff.id,
          body: {
            displayName: values.displayName,
            title: values.title,
            bio: values.bio,
            avatarUrl: values.avatarUrl,
            active: values.active,
          },
        },
        {
          onSuccess: () => {
            toast.success(t("updated"));
            onOpenChange(false);
          },
          onError,
        }
      );
      return;
    }
    createStaff.mutate(
      {
        displayName: values.displayName,
        title: values.title,
        bio: values.bio,
        avatarUrl: values.avatarUrl,
        inviteEmail: values.inviteEmail,
      },
      {
        onSuccess: () => {
          toast.success(t("created"));
          onOpenChange(false);
        },
        onError,
      }
    );
  };

  const { errors } = formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editTitle") : t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel>{t("avatar")}</FieldLabel>
              <Controller
                control={control}
                name="avatarUrl"
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    folder={UploadFolders.avatars}
                    shape="square"
                    disabled={isPending}
                  />
                )}
              />
            </Field>
            <Field data-invalid={Boolean(errors.displayName)}>
              <FieldLabel htmlFor="staff-displayName">{t("displayName")}</FieldLabel>
              <Input
                id="staff-displayName"
                aria-invalid={Boolean(errors.displayName)}
                {...register("displayName")}
              />
              <FieldError>{fieldError(errors.displayName?.message)}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="staff-title">{t("jobTitle")}</FieldLabel>
              <Input id="staff-title" {...register("title")} />
              <FieldError>{fieldError(errors.title?.message)}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.bio)}>
              <FieldLabel htmlFor="staff-bio">{t("bio")}</FieldLabel>
              <Textarea id="staff-bio" rows={3} {...register("bio")} />
              <FieldError>{fieldError(errors.bio?.message)}</FieldError>
            </Field>
            {isEdit ? (
              <Field orientation="horizontal">
                <Controller
                  control={control}
                  name="active"
                  render={({ field }) => (
                    <Switch
                      id="staff-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <FieldLabel htmlFor="staff-active">{t("active")}</FieldLabel>
              </Field>
            ) : (
              <Field data-invalid={Boolean(errors.inviteEmail)}>
                <FieldLabel htmlFor="staff-inviteEmail">
                  {t("inviteEmail")}{" "}
                  <span className="text-muted-foreground">({tCommon("optional")})</span>
                </FieldLabel>
                <Input
                  id="staff-inviteEmail"
                  type="email"
                  autoComplete="off"
                  aria-invalid={Boolean(errors.inviteEmail)}
                  {...register("inviteEmail")}
                />
                <FieldDescription>{t("inviteHint")}</FieldDescription>
                <FieldError>{fieldError(errors.inviteEmail?.message)}</FieldError>
              </Field>
            )}
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
