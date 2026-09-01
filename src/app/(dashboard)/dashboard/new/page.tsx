import { getTranslations } from "next-intl/server";
import { QrForm } from "@/components/qr/qr-form";

export default async function NewQrCodePage() {
  const t = await getTranslations("form");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {t("createTitle")}
        </h1>
        <p className="mt-1 text-muted-foreground">{t("createSubtitle")}</p>
      </div>
      <QrForm mode="create" />
    </div>
  );
}
