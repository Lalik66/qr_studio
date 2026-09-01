"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  Grid2x2Icon,
  PencilIcon,
  ScanLineIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type FaqCategory = "basics" | "design" | "scanning";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_CATEGORIES: {
  id: FaqCategory;
  labelKey: string;
  itemsKey: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "basics",
    labelKey: "faqCategoryBasics",
    itemsKey: "faqBasics",
    icon: <Grid2x2Icon className="size-5 shrink-0" aria-hidden />,
  },
  {
    id: "design",
    labelKey: "faqCategoryDesign",
    itemsKey: "faqDesign",
    icon: <PencilIcon className="size-5 shrink-0" aria-hidden />,
  },
  {
    id: "scanning",
    labelKey: "faqCategoryScanning",
    itemsKey: "faqScanning",
    icon: <ScanLineIcon className="size-5 shrink-0" aria-hidden />,
  },
];

export function FaqSection() {
  const t = useTranslations("marketing");
  const [category, setCategory] = useState<FaqCategory>("design");
  const itemsKey =
    FAQ_CATEGORIES.find((c) => c.id === category)?.itemsKey ?? "faqDesign";
  const items = t.raw(itemsKey) as FaqItem[];

  return (
    <section
      className="relative z-10 border-t border-border px-4 py-16 md:px-16 md:py-24"
      aria-labelledby="faq-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          <h2
            id="faq-heading"
            className="text-3xl font-extrabold uppercase leading-tight tracking-tight md:text-4xl lg:text-5xl"
          >
            {t("faqHeading")}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("faqIntro")}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-16">
          <nav
            className="flex flex-col gap-3"
            aria-label="FAQ categories"
          >
            {FAQ_CATEGORIES.map(({ id, labelKey, icon }) => {
              const active = category === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setCategory(id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-full border px-4 py-3 text-left text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent"
                  )}
                >
                  <span
                    className={cn(
                      active ? "text-primary-foreground" : "text-primary"
                    )}
                  >
                    {icon}
                  </span>
                  <span className="flex-1 leading-snug">{t(labelKey)}</span>
                  {active ? (
                    <ArrowRightIcon
                      className="size-4 shrink-0"
                      aria-hidden
                    />
                  ) : (
                    <ArrowUpRightIcon
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <Accordion
            key={category}
            defaultValue={["0"]}
            className="border-t border-border"
          >
            {items.map((item, index) => (
              <AccordionItem
                key={item.question}
                value={String(index)}
                className="border-border"
              >
                <AccordionTrigger className="py-5 text-base font-medium text-foreground hover:no-underline md:text-lg">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground">
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
