import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AnimatedBlock, interactiveBlockClassName } from "@/components/animated-block";
import { Brand, QrGlyph } from "@/components/brand";
import { FaqSection } from "@/components/marketing/faq-section";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("marketing");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      type: "website",
    },
  };
}

export default async function LandingPage() {
  const t = await getTranslations("marketing");
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="relative z-10 px-4 pt-8 md:px-16">
        <nav
          className="mx-auto flex max-w-[1200px] items-center justify-between gap-6"
          aria-label="Primary"
        >
          <Brand />
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="lg"
              className="rounded-full"
              render={<Link href="/sign-in" />}
            >
              {t("signIn")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full"
              render={<Link href="/sign-up" />}
            >
              {t("getStarted")}
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-4 pt-16 text-center md:px-16">
        <div className="mx-auto max-w-[1200px]">
          <AnimatedBlock index={0}>
            <h1 className="mx-auto text-4xl font-extrabold uppercase leading-none tracking-tight md:text-6xl lg:text-7xl">
              {t.rich("heroTitle", {
                accent: (chunks) => (
                  <span className="text-primary">{chunks}</span>
                ),
              })}
            </h1>
          </AnimatedBlock>
          <AnimatedBlock index={1}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              {t("heroSubtitle")}
            </p>
          </AnimatedBlock>
          <AnimatedBlock index={2}>
            <div className="mt-10">
              <Button
                size="lg"
                className="h-12 rounded-lg px-6 text-base"
                render={<Link href="/sign-up" />}
              >
                <QrGlyph className="size-5" />
                {t("heroCta")}
              </Button>
            </div>
          </AnimatedBlock>
        </div>
      </section>

      {/* How it works diagram with hero glow */}
      <section
        className="hero-glow relative z-10 mt-12 px-4 pb-16 md:px-16"
        aria-label="How it works"
      >
        <div className="mx-auto max-w-[1200px]">
          {/* Visual QR card */}
          <AnimatedBlock index={0} className="flex flex-col items-center">
            <div
              className={cn(
                "flex size-40 items-center justify-center rounded-lg border border-border bg-popover md:size-48",
                interactiveBlockClassName
              )}
            >
              <QrGlyph className="size-20 text-muted-foreground md:size-24" />
            </div>
            <span className="label-caps mt-4 text-sm text-foreground">
              {t("yourQrCode")}
            </span>
          </AnimatedBlock>

          {/* Steps */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3 md:gap-8">
            <StepCard
              index={1}
              number="1"
              title={t("step1Title")}
              description={t("step1Desc")}
            />
            <StepCard
              index={2}
              number="2"
              title={t("step2Title")}
              description={t("step2Desc")}
            />
            <StepCard
              index={3}
              number="3"
              title={t("step3Title")}
              description={t("step3Desc")}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 px-4 pb-16 md:px-16" aria-label="Features">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-center gap-4">
          <FeaturePill index={0} icon={<PaletteIcon />}>
            {t("feature1")}
          </FeaturePill>
          <FeaturePill index={1} icon={<ImageIcon />}>
            {t("feature2")}
          </FeaturePill>
          <FeaturePill index={2} icon={<DownloadIcon />}>
            {t("feature3")}
          </FeaturePill>
          <FeaturePill index={3} icon={<FolderIcon />}>
            {t("feature4")}
          </FeaturePill>
          <FeaturePill index={4} icon={<SearchIcon />}>
            {t("feature5")}
          </FeaturePill>
          <FeaturePill index={5} icon={<InfinityIcon />}>
            {t("feature6")}
          </FeaturePill>
        </div>
      </section>

      <FaqSection />

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-4 py-8 md:px-16">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-6 sm:flex-row">
          <Brand />
          <nav className="flex gap-6 text-sm text-muted-foreground" aria-label="Footer">
            <Link href="/privacy" className="hover:text-foreground">
              {t("footerPrivacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {t("footerTerms")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function StepCard({
  index,
  number,
  title,
  description,
}: {
  index: number;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <AnimatedBlock index={index}>
      <div
        className={cn(
          "flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center",
          interactiveBlockClassName
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
          {number}
        </span>
        <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </AnimatedBlock>
  );
}

function FeaturePill({
  index,
  icon,
  children,
}: {
  index: number;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AnimatedBlock index={index}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground",
          interactiveBlockClassName
        )}
      >
        <span className="text-primary">{icon}</span>
        <span>{children}</span>
      </div>
    </AnimatedBlock>
  );
}

/* Icons using currentColor for theming */

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <circle cx="12" cy="8" r="1.5" fill="currentColor" />
      <circle cx="16" cy="10" r="1.5" fill="currentColor" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M4 17l4.5-4 3.5 3 3-2.5L20 17"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <path
        d="M12 3v12M7.5 10.5 12 15l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <path
        d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M21 21l-4.35-4.35"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InfinityIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <path
        d="M12 12c-2-2.5-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.5 6-4zm0 0c2 2.5 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.5-6 4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
