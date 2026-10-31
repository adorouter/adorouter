import { env } from "@/lib/config/env";
import type { MetadataRoute } from "next";

// adorouter's public pages. Upstream's generated sitemap listed the blog, comparison
// and per-model pages, which adorouter doesn't have or doesn't need to list.
const PUBLIC_PATHS = ["", "/models", "/pricing", "/docs", "/status", "/terms", "/privacy", "/aup", "/refund"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${env.siteOrigin}/en${path}` }));
}
