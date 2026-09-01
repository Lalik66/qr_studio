import "server-only";
import QRCode from "qrcode";
import sharp from "sharp";

export type QrOptions = {
  url: string;
  foregroundColor: string; // hex like "#000000"
  backgroundColor: string; // hex like "#FFFFFF"
  size: number; // output width in px, e.g. 512
  logoUrl?: string | null; // optional center logo; a local "/uploads/..." path or a Vercel Blob https URL
};

// Shared QR geometry — one source of truth for both the PNG and SVG renderers.
const MARGIN = 4; // quiet-zone width in modules
const LOGO_RATIO = 0.24; // logo covers ~24% of the code width (keeps level-H scannable)
const MAX_LOGO_BYTES = 2 * 1024 * 1024; // cap on fetched logo bytes
const FETCH_TIMEOUT_MS = 5000;

/**
 * Guard against SSRF/LFI: a logo reference is only trusted if it points at our
 * own storage — a local "/uploads/..." path (no traversal) or a Vercel Blob
 * https host. Anything else (arbitrary http(s) hosts, internal IPs, other
 * schemes) is rejected so a user-supplied value can never make the server fetch
 * an internal address or read an arbitrary file.
 */
export function isSafeLogoRef(logoUrl: string): boolean {
  if (logoUrl.startsWith("/uploads/")) {
    return !logoUrl.includes("..");
  }
  try {
    const u = new URL(logoUrl);
    // Match the public Blob host exactly — the same host allowed in
    // next.config.ts remotePatterns — not any *.vercel-storage.com subdomain.
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}

/**
 * Load logo bytes from our own storage only. Local paths are confined to
 * public/uploads; remote reads are limited to the Blob host with a timeout,
 * no redirects and a size cap.
 */
async function loadLogoBytes(logoUrl: string): Promise<Buffer> {
  if (!isSafeLogoRef(logoUrl)) {
    throw new Error("Unsupported logo source");
  }

  if (logoUrl.startsWith("/uploads/")) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const uploadsRoot = path.resolve(process.cwd(), "public", "uploads");
    const resolved = path.resolve(
      process.cwd(),
      "public",
      logoUrl.replace(/^\//, ""),
    );
    if (resolved !== uploadsRoot && !resolved.startsWith(uploadsRoot + path.sep)) {
      throw new Error("Invalid logo path");
    }
    return fs.readFile(resolved);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(logoUrl, { redirect: "error", signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Logo fetch failed with status ${res.status}`);
    }
    const arr = await res.arrayBuffer();
    if (arr.byteLength > MAX_LOGO_BYTES) {
      throw new Error("Logo exceeds maximum size");
    }
    return Buffer.from(arr);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resize a logo to a square PNG buffer. Returns null if the logo cannot be
 * loaded or processed, so callers degrade gracefully to a logo-less code
 * instead of failing the whole download.
 */
async function loadLogoPng(logoUrl: string, px: number): Promise<Buffer | null> {
  try {
    const bytes = await loadLogoBytes(logoUrl);
    return await sharp(bytes).resize(px, px, { fit: "inside" }).png().toBuffer();
  } catch {
    return null;
  }
}

/** Escape a value for safe interpolation into SVG markup. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Clamp size to a sane range.
 */
function clampSize(size: number): number {
  return Math.min(Math.max(size, 128), 2000);
}

/**
 * Generate a QR code as PNG Buffer.
 * If a valid logo is provided, it is composited at the center; a logo that
 * cannot be loaded is skipped rather than failing the request.
 */
export async function generateQrPng(opts: QrOptions): Promise<Buffer> {
  const size = clampSize(opts.size);

  const base = await QRCode.toBuffer(opts.url, {
    errorCorrectionLevel: "H",
    width: size,
    margin: MARGIN,
    color: {
      dark: opts.foregroundColor,
      light: opts.backgroundColor,
    },
  });

  if (opts.logoUrl) {
    const logoSize = Math.round(size * LOGO_RATIO);
    const resizedLogo = await loadLogoPng(opts.logoUrl, logoSize);
    if (resizedLogo) {
      return sharp(base)
        .composite([{ input: resizedLogo, gravity: "centre" }])
        .png()
        .toBuffer();
    }
  }

  return base;
}

/**
 * Generate a QR code as an SVG string sized exactly to `opts.size`.
 * The viewBox is expressed in module units so the width/height match the
 * requested pixel size regardless of the module count. If a valid logo is
 * provided, a centered knockout region is cleared and the logo is embedded as
 * base64; a logo that cannot be loaded is skipped.
 */
export async function generateQrSvg(opts: QrOptions): Promise<string> {
  const size = clampSize(opts.size);

  const qr = QRCode.create(opts.url, { errorCorrectionLevel: "H" });
  const modules = qr.modules;
  const count = modules.size;
  const total = count + MARGIN * 2; // grid size in module units, incl. quiet zone

  // Prepare logo + knockout region (all in module units, centered on the grid).
  let logoBase64 = "";
  let logoModules = 0;
  let knockoutMin = -1;
  let knockoutMax = -1;

  if (opts.logoUrl) {
    const logoPx = Math.max(64, Math.round(size * LOGO_RATIO));
    const resizedLogo = await loadLogoPng(opts.logoUrl, logoPx);
    if (resizedLogo) {
      logoBase64 = resizedLogo.toString("base64");
      logoModules = Math.round(count * LOGO_RATIO);
      const knockoutModules = logoModules % 2 === 0 ? logoModules : logoModules + 1;
      const center = count / 2;
      knockoutMin = center - knockoutModules / 2;
      knockoutMax = center + knockoutModules / 2;
    }
  }

  const hasLogo = logoBase64.length > 0;
  const fg = escapeXml(opts.foregroundColor);
  const bg = escapeXml(opts.backgroundColor);

  const parts: string[] = [];
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">`,
  );
  parts.push(`<rect width="${total}" height="${total}" fill="${bg}"/>`);

  const inKnockout = (col: number, row: number): boolean => {
    const cx = col + 0.5;
    const cy = row + 0.5;
    return (
      cx >= knockoutMin && cx < knockoutMax && cy >= knockoutMin && cy < knockoutMax
    );
  };

  // Dark modules, horizontal run-length encoded, in module units.
  for (let row = 0; row < count; row++) {
    let col = 0;
    while (col < count) {
      const idx = row * count + col;
      if (modules.data[idx] && !(hasLogo && inKnockout(col, row))) {
        const runStart = col;
        col++;
        while (col < count) {
          const nextIdx = row * count + col;
          if (!modules.data[nextIdx]) break;
          if (hasLogo && inKnockout(col, row)) break;
          col++;
        }
        const runLength = col - runStart;
        const x = MARGIN + runStart;
        const y = MARGIN + row;
        parts.push(
          `<rect x="${x}" y="${y}" width="${runLength}" height="1" fill="${fg}"/>`,
        );
      } else {
        col++;
      }
    }
  }

  if (hasLogo) {
    const logoX = (total - logoModules) / 2;
    const logoY = (total - logoModules) / 2;
    parts.push(
      `<image href="data:image/png;base64,${logoBase64}" x="${logoX}" y="${logoY}" width="${logoModules}" height="${logoModules}" preserveAspectRatio="xMidYMid meet"/>`,
    );
  }

  parts.push("</svg>");

  return parts.join("");
}
