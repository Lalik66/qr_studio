import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const disallow = ["/api/", "/dashboard", "/settings", "/system"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow,
      },
      // AI search and citation crawlers — allowed on public pages, kept off the
      // authenticated app surface (same disallow as everyone else).
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-Web",
          "Google-Extended",
        ],
        allow: "/",
        disallow,
      },
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl,
  };
}
