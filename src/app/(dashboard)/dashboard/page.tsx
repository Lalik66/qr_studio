import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { qrCode } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { AnimatedBlock, interactiveBlockClassName } from "@/components/animated-block";
import { QrGlyph } from "@/components/brand";
import { QrList } from "@/components/qr/qr-list";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireUser();
  const t = await getTranslations("dashboard");

  const codes = await db
    .select()
    .from(qrCode)
    .where(eq(qrCode.userId, user.id))
    .orderBy(desc(qrCode.createdAt));

  return (
    <div className="flex flex-col gap-8">
      <AnimatedBlock index={0}>
        <h1 className="text-2xl font-bold text-foreground">{t("heading")}</h1>
      </AnimatedBlock>

      {codes.length === 0 ? (
        <AnimatedBlock index={1}>
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-6 rounded-xl border border-border bg-card py-16 text-center",
              interactiveBlockClassName
            )}
          >
            <QrGlyph className="size-16 text-muted-foreground" />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-foreground">
                {t("emptyTitle")}
              </h2>
              <p className="max-w-sm text-muted-foreground">{t("emptyBody")}</p>
            </div>
            <Button render={<Link href="/dashboard/new" />}>
              <PlusIcon className="size-4" />
              {t("createButton")}
            </Button>
          </div>
        </AnimatedBlock>
      ) : (
        <QrList codes={codes} />
      )}
    </div>
  );
}
