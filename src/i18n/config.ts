export const locales = ["en", "az"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const LOCALE_COOKIE = "locale";

/** The label shown on the language switcher for each locale. */
export const localeLabels: Record<Locale, string> = {
  en: "EN",
  az: "AZ",
};

/** Narrow an untrusted cookie value to a supported locale, falling back to the default. */
export function resolveLocale(value: string | undefined | null): Locale {
  return locales.includes((value ?? "") as Locale)
    ? (value as Locale)
    : defaultLocale;
}
