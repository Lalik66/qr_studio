import { db } from "@/lib/db";
import { qrCode } from "@/lib/db/schema";
import { generateQrPng, generateQrSvg } from "@/lib/qr";
import { getSession } from "@/lib/session";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";

/**
 * Sanitize a title string for use as a filename.
 * Lowercase, replace non-alphanumeric with dashes, trim dashes, fallback to "qr-code".
 */
function sanitizeFilename(title: string): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return sanitized || "qr-code";
}

/**
 * Build a Content-Disposition value. The filename is already restricted to
 * [a-z0-9-] by sanitizeFilename; the RFC 5987 `filename*` form is added as
 * defense-in-depth so the header can never be broken even if that ever loosens.
 */
function contentDisposition(name: string, ext: string): string {
  const filename = `${name}.${ext}`;
  return `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Check authentication
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Owner-scoped fetch
  const [row] = await db
    .select()
    .from(qrCode)
    .where(and(eq(qrCode.id, id), eq(qrCode.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return new Response("Not found", { status: 404 });
  }

  // Determine format from query string
  const url = new URL(req.url);
  const format = url.searchParams.get("format") === "svg" ? "svg" : "png";

  // Build QR options from row
  const opts = {
    url: row.destinationUrl,
    foregroundColor: row.foregroundColor,
    backgroundColor: row.backgroundColor,
    size: row.size,
    logoUrl: row.logoUrl,
  };

  const safeFilename = sanitizeFilename(row.title);

  try {
    if (format === "svg") {
      const svg = await generateQrSvg(opts);
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": contentDisposition(safeFilename, "svg"),
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, no-store",
        },
      });
    }

    // PNG format
    const buf = await generateQrPng(opts);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": contentDisposition(safeFilename, "png"),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Could not generate that QR code, try again", {
      status: 500,
    });
  }
}
