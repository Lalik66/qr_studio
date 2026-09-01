"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { setUserLocale } from "@/i18n/actions";
import { locales, localeLabels, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const active = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === active || isPending) return;
    startTransition(async () => {
      await setUserLocale(next);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t("languageLabel")}
      className="inline-flex items-center rounded-lg border border-border p-0.5"
    >
      {locales.map((locale) => {
        const isActive = locale === active;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => change(locale)}
            disabled={isPending}
            aria-pressed={isActive}
            className={cn(
              "rounded-md px-2 py-1 text-xs font-medium transition-colors disabled:opacity-60",
              isActive
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {localeLabels[locale]}
          </button>
        );
      })}
    </div>
  );
}
