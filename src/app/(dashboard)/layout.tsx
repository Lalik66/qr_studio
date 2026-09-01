import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/qr/sign-out-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav";
import { PlusIcon } from "lucide-react";

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Button
      render={<Link href={href} />}
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className={active ? "bg-accent text-foreground" : ""}
    >
      <span className="label-caps text-xs">{children}</span>
    </Button>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const t = await getTranslations("nav");

  const navItems = [
    { href: "/dashboard", label: t("dashboard") },
    { href: "/settings", label: t("settings") },
    ...(user.role === "admin"
      ? [{ href: "/system", label: t("system") }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <DashboardMobileNav items={navItems} triggerLabel={t("menu")} />
            <Brand />
            <nav className="hidden items-center gap-1 sm:flex">
              {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <SignOutButton />
            <Button
              variant="secondary"
              render={<Link href="/dashboard/new" />}
            >
              <PlusIcon className="size-4" />
              {t("createQr")}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
