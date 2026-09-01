import type { MetadataRoute } from "next";
import { siteUrl, publicPages } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPages.map((path) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1.0 : 0.5,
  }));
}
