import { Brand } from "@/components/brand";
import { LanguageSwitcher } from "@/components/language-switcher";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="hero-glow relative flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <div className="mb-10">
        <Brand />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
