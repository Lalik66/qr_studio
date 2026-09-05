import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { AnimatedBlock } from "@/components/animated-block";
import { SettingsTabs } from "./settings-tabs";

export default async function SettingsPage() {
  const user = await requireUser();
  const t = await getTranslations("settings");

  return (
    <div className="flex flex-col gap-8">
      <AnimatedBlock index={0}>
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
      </AnimatedBlock>
      <AnimatedBlock index={1}>
        <SettingsTabs
          initialUser={{
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
          }}
        />
      </AnimatedBlock>
    </div>
  );
}
