"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const t = useTranslations("auth");
  const params = useSearchParams();
  const token = params.get("token");
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{t("resetExpiredTitle")}</CardTitle>
          <CardDescription>{t("resetExpiredSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/forgot-password" className={buttonVariants({ size: "lg", className: "w-full" })}>
            {t("resetRequestNew")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (password.length < 8) {
      toast.error(t("resetPasswordTooShort"));
      return;
    }
    if (password !== confirm) {
      toast.error(t("resetPasswordsNoMatch"));
      return;
    }

    setPending(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token: token! });
    setPending(false);

    if (error) {
      toast.error(error.message ?? t("resetError"));
      return;
    }
    toast.success(t("resetSuccess"));
    router.push("/sign-in");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t("resetTitle")}</CardTitle>
        <CardDescription>{t("resetSubtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t("resetNewPassword")}</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required placeholder={t("resetNewPasswordPlaceholder")} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm">{t("resetConfirmPassword")}</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required placeholder={t("resetConfirmPlaceholder")} />
          </div>
          <Button type="submit" size="lg" className="mt-2 w-full" disabled={pending}>
            {pending ? t("resetSubmitting") : t("resetSubmit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
