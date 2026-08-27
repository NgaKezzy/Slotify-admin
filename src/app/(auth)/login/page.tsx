/**
 * Login page (`/login`). Centered card with the email/password form.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/app/(auth)/login/login-form";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return { title: t("title") };
}

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden bg-background p-6">
      {/* Decorative background: soft brand-coloured blobs over a faint grid. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div
          className="absolute -top-32 -left-24 size-[28rem] rounded-full blur-3xl"
          style={{ background: "var(--brand-primary)", opacity: 0.22 }}
        />
        <div
          className="absolute -right-24 -bottom-32 size-[26rem] rounded-full blur-3xl"
          style={{ background: "var(--brand-secondary)", opacity: 0.2 }}
        />
      </div>
      <Card className="relative w-full max-w-sm border-border/60 bg-card/90 shadow-xl shadow-primary/10 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
            <BrandLogo className="size-7" />
          </div>
          <p className="text-sm font-semibold text-primary">{t("app.name")}</p>
          <CardTitle className="text-xl">{t("auth.login.title")}</CardTitle>
          <CardDescription>{t("auth.login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
