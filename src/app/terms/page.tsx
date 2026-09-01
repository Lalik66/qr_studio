import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Brand } from "@/components/brand";
import { LegalField } from "@/components/legal-blank";
import { legal } from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");
  return {
    title: t("termsMetaTitle"),
    description: t("termsMetaDescription", { app: legal.appName }),
  };
}

export default async function TermsPage() {
  const t = await getTranslations("legal");

  const values = {
    app: legal.appName,
    b: (chunks: ReactNode) => (
      <strong className="text-foreground">{chunks}</strong>
    ),
    entity: () => <LegalField value={legal.entity} label="legal entity name" />,
    email: () => <LegalField value={legal.contactEmail} label="contact email" />,
    jurisdiction: () => (
      <LegalField value={legal.jurisdiction} label="jurisdiction" />
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Brand />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <article className="prose-legal">
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            {t("termsTitle")}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {t("lastUpdated", { date: legal.lastUpdated })}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("acceptanceTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("acceptanceBody", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("descriptionTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("descriptionIntro", values)}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t("descGenerate")}</li>
              <li>{t("descStyle")}</li>
              <li>{t("descManage")}</li>
              <li>{t("descDownload")}</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("descriptionOutro")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("howTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("howBody")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("acceptableUseTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("acceptableUseIntro", values)}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t("useIllegal")}</li>
              <li>{t("useMalware")}</li>
              <li>{t("useIp")}</li>
              <li>{t("useAbusive")}</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("acceptableUseOutro")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("yourAccountTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("yourAccountBody")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("terminationTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("terminationIntro")}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t("termDeleteCodes")}</li>
              <li>{t("termDeleteLogos")}</li>
              <li>{t("termDeleteAccount")}</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("terminationOutro")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("noWarrantyTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("noWarrantyBody", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("liabilityTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("liabilityBody", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("termsChangesTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("termsChangesBody")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("governingLawTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("termsGoverningLawBody", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("contactTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("contactBody", values)}
            </p>
          </section>

          {/* Disclaimer */}
          <aside className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">
                {t("disclaimerLabel")}
              </strong>{" "}
              {t("disclaimer")}
            </p>
          </aside>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-6 px-6 py-6">
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("home")}
          </Link>
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("privacyPolicy")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
