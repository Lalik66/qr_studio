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
    title: t("privacyMetaTitle"),
    description: t("privacyMetaDescription", { app: legal.appName }),
  };
}

export default async function PrivacyPage() {
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
            {t("privacyTitle")}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {t("lastUpdated", { date: legal.lastUpdated })}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("whoWeAreTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("whoWeAreBody", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("whatWeCollectTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("whatWeCollectIntro")}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t.rich("collectAccount", values)}</li>
              <li>{t.rich("collectQr", values)}</li>
              <li>{t.rich("collectEmailLog", values)}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("whyWeCollectTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("whyWeCollectIntro", values)}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t("whyAccount")}</li>
              <li>{t("whyQr")}</li>
              <li>{t("whyEmail")}</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("cookiesTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("cookiesBody1", values)}
            </p>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("cookiesBody2")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("subProcessorsTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("subProcessorsIntro", values)}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t.rich("subResend", values)}</li>
              <li>{t.rich("subBlob", values)}</li>
              <li>{t.rich("subPostgres", values)}</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("subProcessorsOutro")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("transactionalTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("transactionalBody")}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("yourRightsTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("yourRightsIntro")}
            </p>
            <ul className="mb-4 list-inside list-disc space-y-2 text-muted-foreground">
              <li>{t("rightsView")}</li>
              <li>{t("rightsDelete")}</li>
            </ul>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("yourRightsOutro", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("governingLawTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t.rich("privacyGoverningLawBody", values)}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              {t("changesTitle")}
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {t("privacyChangesBody")}
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
            href="/terms"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("termsOfService")}
          </Link>
        </div>
      </footer>
    </div>
  );
}
