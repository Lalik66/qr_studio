"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export function SignOutButton() {
  const router = useRouter();
  const t = useTranslations("nav");

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <Button variant="outline" onClick={handleSignOut}>
      <LogOutIcon />
      {t("signOut")}
    </Button>
  );
}
