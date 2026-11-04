import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

// Guide 1.2.1. A crawler that finds a group with its own name ignores "*",
// so each named group repeats the disallow rules. (The WordPress-only /wp-admin/
// rules from the guide's template don't apply to this Next.js site.)
const DISALLOW = ["/?s=", "/search/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // AI search and citation
      {
        userAgent: ["OAI-SearchBot", "ChatGPT-User", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User"],
        allow: "/",
        disallow: DISALLOW,
      },
      // Model training (client decision; recommended default: allow)
      { userAgent: ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended"], allow: "/", disallow: DISALLOW },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
