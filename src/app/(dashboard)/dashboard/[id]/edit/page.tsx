import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import { qrCode } from "@/lib/db/schema";
import { AnimatedBlock } from "@/components/animated-block";
import { QrForm } from "@/components/qr/qr-form";

export default async function EditQrCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getTranslations("form");

  const codes = await db
    .select()
    .from(qrCode)
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, user.id)))
    .limit(1);

  if (codes.length === 0) {
    notFound();
  }

  const code = codes[0];

  return (
    <div className="flex flex-col gap-6">
      <AnimatedBlock index={0}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("editTitle")}
          </h1>
          <p className="mt-1 text-muted-foreground">{t("editSubtitle")}</p>
        </div>
      </AnimatedBlock>
      <AnimatedBlock index={1}>
        <QrForm
          mode="edit"
          initialData={{
            id: code.id,
            title: code.title,
            destinationUrl: code.destinationUrl,
            foregroundColor: code.foregroundColor,
            backgroundColor: code.backgroundColor,
            size: code.size,
            logoUrl: code.logoUrl,
            logoPath: code.logoPath,
          }}
        />
      </AnimatedBlock>
    </div>
  );
}
