// Resolve the public site URL from env, tolerating empty strings, missing
// protocols and bad values so the production build never crashes on `new URL()`.
// `||` (not `??`) is deliberate: an env var set to "" must fall through.
function resolveSiteUrl(): string {
  const candidate =
    process.env.APP_URL ||
    process.env.BETTER_AUTH_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";
  const trimmed = candidate.trim();
  if (!trimmed) return "http://localhost:3000";
  // Vercel's own URL vars are bare hostnames — add a scheme if none is present.
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export const siteUrl = resolveSiteUrl();

export const site = {
  name: "QR Studio",
  title: "QR Studio — Make QR codes easy",
  description:
    "Generate branded QR codes from any link, style them with your colors and logo, and download them as PNG or SVG. Free and unlimited.",
  url: siteUrl,
};

// The only pages crawlers should index (everything else is auth-gated or an API):
export const publicPages = ["/", "/privacy", "/terms"] as const;
