import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./config";

// The catalog is split across two files per locale: the app UI/marketing/auth
// strings, and the longer legal copy, merged into one message tree. Import
// specifiers are fully static (one entry per locale) so the bundler resolves
// them directly rather than building a dynamic-import context.
const catalogs: Record<Locale, () => Promise<Record<string, unknown>>> = {
  en: async () => ({
    ...(await import("../../messages/en.json")).default,
    ...(await import("../../messages/en.legal.json")).default,
  }),
  az: async () => ({
    ...(await import("../../messages/az.json")).default,
    ...(await import("../../messages/az.legal.json")).default,
  }),
};

// Cookie-based locale (no URL routing): the active language is read from the
// `locale` cookie on every request. The language switcher writes that cookie.
export default getRequestConfig(async () => {
  const store = await cookies();
  const locale = resolveLocale(store.get(LOCALE_COOKIE)?.value);

  return {
    locale,
    messages: await catalogs[locale](),
  };
});
