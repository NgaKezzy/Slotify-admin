"use client";

/**
 * Announcement composer (`/platform/notifications`): title, message and
 * audience (customers / staff / all). Submits to the broadcast endpoint and
 * reports how many users were reached.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { Megaphone, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBroadcastNotification, type BroadcastInput } from "@/hooks/use-platform";
import { toApiError } from "@/lib/api-error";

const AUDIENCES = ["ALL", "CUSTOMERS", "STAFF"] as const;
type Audience = (typeof AUDIENCES)[number];

const TITLE_MAX = 150;
const BODY_MAX = 500;

const formSchema = z.object({
  title: z.string().trim().min(1, "titleRequired").max(TITLE_MAX, "titleTooLong"),
  body: z.string().trim().min(1, "bodyRequired").max(BODY_MAX, "bodyTooLong"),
  audience: z.enum(AUDIENCES),
});

type FormValues = z.infer<typeof formSchema>;
type ErrorKey = "titleRequired" | "titleTooLong" | "bodyRequired" | "bodyTooLong";

export function BroadcastForm() {
  const t = useTranslations("platform.notifications");
  const broadcast = useBroadcastNotification();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", body: "", audience: "ALL" },
  });

  const errorText = (key: string | undefined) => (key ? t(`errors.${key as ErrorKey}`) : undefined);
  const bodyLength = useWatch({ control, name: "body" }).length;

  const onSubmit = (values: FormValues) => {
    const input: BroadcastInput = {
      title: values.title,
      body: values.body,
      audience: values.audience,
    };
    broadcast.mutate(input, {
      onSuccess: (result) => {
        toast.success(t("sent", { count: result.recipients }));
        reset({ title: "", body: "", audience: values.audience });
      },
      onError: (error) => toast.error(toApiError(error).message),
    });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-5 text-primary" aria-hidden />
          {t("composeTitle")}
        </CardTitle>
        <CardDescription>{t("composeDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="broadcast-audience">{t("audience.label")}</FieldLabel>
              <Controller
                control={control}
                name="audience"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as Audience)}
                  >
                    <SelectTrigger id="broadcast-audience" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCES.map((audience) => (
                        <SelectItem key={audience} value={audience}>
                          {t(`audience.${audience}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field data-invalid={Boolean(errors.title)}>
              <FieldLabel htmlFor="broadcast-title">{t("titleLabel")}</FieldLabel>
              <Input
                id="broadcast-title"
                maxLength={TITLE_MAX}
                placeholder={t("titlePlaceholder")}
                aria-invalid={Boolean(errors.title)}
                {...register("title")}
              />
              <FieldError>{errorText(errors.title?.message)}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.body)}>
              <FieldLabel htmlFor="broadcast-body">{t("bodyLabel")}</FieldLabel>
              <Textarea
                id="broadcast-body"
                rows={5}
                maxLength={BODY_MAX}
                placeholder={t("bodyPlaceholder")}
                aria-invalid={Boolean(errors.body)}
                {...register("body")}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <FieldError>{errorText(errors.body?.message)}</FieldError>
                <span>
                  {bodyLength}/{BODY_MAX}
                </span>
              </div>
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={broadcast.isPending}>
                <Send className="size-4" aria-hidden />
                {broadcast.isPending ? t("sending") : t("send")}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
