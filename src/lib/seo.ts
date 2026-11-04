import type { Metadata } from "next";

/**
 * Per-page SEO (SEO guide 2.1–2.3 + UX audit): title 50–60 chars, description 140–155 chars,
 * 3–6 keywords. Paths match the routes, with the trailing slash.
 */
export const PAGE_SEO = {
  "/": {
    title: "Commercial Electrician in Kansas City | M&S Electric",
    description:
      "Commercial electrical contractor in Kansas City: new construction, tenant improvements, fire alarm, low voltage and service. Call 816-427-5913.",
    keywords: ["commercial electrician Kansas City", "commercial electrical contractor", "fire alarm contractor", "low voltage contractor"],
  },
  // About + Our Story (merged)
  "/about/": {
    title: "About M&S Electric | Kansas City Electrical Contractor",
    description:
      "Founded in 2011 by father and son Shawn and Ben Ryan, M&S Electric is a Kansas City commercial electrical contractor. Our story, values and team.",
    keywords: ["about M&S Electric", "Kansas City electrical contractor", "Shawn Ryan", "Ben Ryan", "commercial electrician team"],
  },
  "/services/": {
    title: "Commercial Electrical Services in Kansas City | M&S Electric",
    description:
      "Commercial electrical, open-platform fire alarm, low voltage, maintenance and specialty services for Kansas City buildings, all from one team.",
    keywords: ["commercial electrical services Kansas City", "fire alarm installation", "low voltage contractor", "electrical maintenance"],
  },
  "/markets/": {
    title: "Markets We Serve | Commercial Electrical in Kansas City",
    description:
      "Electrical, fire alarm and low voltage for shopping centers, hotels, multi-family, medical, senior living, office, data center and government buildings.",
    keywords: ["hotel electrical contractor", "multifamily electrical contractor", "data center electrical contractor", "retail electrical contractor"],
  },
  "/contact/": {
    title: "Contact M&S Electric | Commercial Electrician in Kansas City",
    description:
      "Call 816-427-5913 or email services@mandselectric.net. M&S Electric, 3026 SW East US 40 Hwy, Blue Springs, MO 64015. Monday–Friday, 8 AM–5 PM.",
    keywords: ["contact M&S Electric", "commercial electrician Blue Springs MO", "Kansas City electrician quote"],
  },
  "/privacy-policy/": {
    title: "Privacy Policy | M&S Electric, Kansas City Electrician",
    description:
      "Privacy policy for the M&S Electric website: what personal data we collect, how we use and share it, and how to review or correct your information.",
    keywords: ["M&S Electric privacy policy", "website privacy"],
  },
  "/cookies-policy/": {
    title: "Cookies Policy | M&S Electric, Kansas City Electrician",
    description:
      "Cookies policy for the M&S Electric website: the site sets no tracking or advertising cookies, and you can manage cookies in your browser settings.",
    keywords: ["M&S Electric cookies policy", "website cookies"],
  },
  "/case-studies/": {
    title: "Kansas City Electrical Case Studies | M&S Electric",
    description:
      "How general contractors and hotel owners in Missouri and Kansas work with M&S Electric: real partnerships, told by KMG Hotels and Construction Brokers.",
    keywords: ["electrical contractor case studies", "Kansas City electrical contractor", "hotel electrical contractor", "elevator electrical work"],
  },
  "/case-studies/kmg-hotels-hotel-development/": {
    title: "KMG Hotels: Hotel Electrical Case Study | M&S Electric",
    description:
      "How M&S Electric helps KMG Hotels build to its standard and to its budget: design-stage support, open pricing and change orders worked down, for 12 years.",
    keywords: ["hotel electrical contractor", "KMG Hotels", "hotel construction electrical", "design-stage electrical support"],
  },
  "/case-studies/construction-brokers-elevator-electrical/": {
    title: "Construction Brokers: Elevator Case Study | M&S Electric",
    description:
      "Since 2012, a dedicated M&S Electric PM and 5–6 specialist technicians have handled elevator electrical work for Construction Brokers Inc. in MO and KS.",
    keywords: ["elevator electrical contractor", "Construction Brokers Inc", "specialty electrical work", "Missouri Kansas electrician"],
  },
  // Template page with placeholder copy: not published (src/app/_templates), kept for future service pages
  "/single-service/": {
    title: "Service | M&S Electric",
    description: "Commercial electrical service by M&S Electric in the Kansas City metro.",
    keywords: ["commercial electrical service", "Kansas City"],
  },
} satisfies Record<string, { title: string; description: string; keywords: string[] }>;

export type Route = keyof typeof PAGE_SEO;

/** Pages listed in the sitemap (indexable, status 200, self-canonical). */
export const SITEMAP_ROUTES: Route[] = ["/", "/about/", "/services/", "/markets/", "/case-studies/", "/case-studies/kmg-hotels-hotel-development/", "/case-studies/construction-brokers-elevator-electrical/", "/contact/", "/privacy-policy/", "/cookies-policy/"];

const SHARE_IMAGE = {
  url: "/opengraph-image/", // with the trailing slash: no redirect for social crawlers
  width: 1200,
  height: 630,
  alt: "M&S Electric, commercial electrical contractor in Kansas City",
};

/** `shareImage`: a page-specific 1200x630 image (e.g. a case study photo) instead of the default one. */
export function pageMetadata(route: Route, shareImage?: { url: string; alt: string }): Metadata {
  const { title, description, keywords } = PAGE_SEO[route];
  const image = shareImage ? { ...shareImage, width: 1200, height: 630 } : SHARE_IMAGE;
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: route },
    // Open Graph (approved by Lucas, 28/10/2026). A page-level openGraph replaces the inherited
    // one, so the share image (src/app/opengraph-image.tsx) is listed explicitly.
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "M&S Electric",
      title,
      description,
      url: route,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
