import Link from "next/link";
import { cn } from "@/lib/utils";

/** QR Studio wordmark — the modular QR glyph plus the name. */
export function Brand({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label="QR Studio home"
      className={cn("inline-flex items-center gap-3", className)}
    >
      <QrGlyph className="size-9 text-primary" />
      <span className="flex flex-col leading-none">
        <span className="text-sm font-medium text-muted-foreground">Online</span>
        <span className="text-lg font-bold tracking-tight text-foreground">
          QR Studio
        </span>
      </span>
    </Link>
  );
}

/** The QR mark on its own, for favicons, hero art and empty states. */
export function QrGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5" y="5" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="14" y="2" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="17" y="5" width="2" height="2" rx="0.5" fill="currentColor" />
      <rect x="2" y="14" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <rect x="5" y="17" width="2" height="2" rx="0.5" fill="currentColor" />
      <path
        d="M14 14h3v3M20 14h2v2M14 20h2v2M20 19v3M18 18h0.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
