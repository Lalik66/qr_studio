import { site, siteUrl, publicPages } from "@/lib/site";

// Render per-request so the absolute URLs reflect the runtime host (APP_URL),
// rather than baking in whatever env was present at build time.
export const dynamic = "force-dynamic";

export function GET() {
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## What this app does",
    "",
    "QR Studio lets you generate QR codes from any URL, style them with custom colors, sizes, and a center logo, then manage, search, edit, download (PNG or SVG), and delete your codes. User accounts are free and unlimited.",
    "",
    "## Public pages",
    "",
    ...publicPages.map((path) => `- ${new URL(path, siteUrl).toString()}`),
    "",
  ];

  const body = lines.join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
