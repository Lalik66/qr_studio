export const siteUrl =
  process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const site = {
  name: "QR Studio",
  title: "QR Studio — Make QR codes easy",
  description:
    "Generate branded QR codes from any link, style them with your colors and logo, and download them as PNG or SVG. Free and unlimited.",
  url: siteUrl,
};

// The only pages crawlers should index (everything else is auth-gated or an API):
export const publicPages = ["/", "/privacy", "/terms"] as const;
