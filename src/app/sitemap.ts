import type { MetadataRoute } from "next";
import { SITEMAP_ROUTES } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

// Guide 1.2.3: only canonical, indexable, 200 URLs. lastModified is the build date;
// pages are static, so a rebuild is what changes their content.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return SITEMAP_ROUTES.map((route) => ({ url: absoluteUrl(route), lastModified }));
}
