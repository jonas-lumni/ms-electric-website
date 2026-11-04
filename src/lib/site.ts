/**
 * Business facts (NAP) used by metadata, JSON-LD, robots.txt and the sitemap.
 * Keep identical to the footer, the contact page and the Google Business Profile.
 * Only data that is visible on the site and confirmed by the client (28/10/2026) is listed here;
 * see docs/SEO-relatorio.md for the items still waiting on the client.
 */
export const SITE = {
  url: "https://mandselectric.net",
  name: "M&S Electric",
  description:
    "Commercial electrical contractor serving the Kansas City metro: commercial electrical, fire alarm systems, low voltage, maintenance and service, and specialty electrical work.",
  telephone: "+1-816-427-5913",
  email: "services@mandselectric.net",
  address: {
    streetAddress: "3026 SW East US 40 Hwy",
    addressLocality: "Blue Springs",
    addressRegion: "MO",
    postalCode: "64015",
    addressCountry: "US",
  },
  // As shown in the footer and on /contact/ (Monday – Friday, 8:00 AM – 5:00 PM).
  // 24/7 emergency service exists (client) and stays separate from the office hours.
  openingHours: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "17:00" },
  foundingDate: "2011",
  areaServed: "Kansas City metropolitan area",
  logo: "/wp-content/uploads/2026/02/image-14.webp",
  founders: [
    { name: "Shawn Ryan", jobTitle: "Owner and Director of Operations" },
    { name: "Ben Ryan", jobTitle: "Owner and Director of Estimating" },
  ],
  // Shown in the footer
  license: { name: "Kansas City, MO Electrical Contractor Class I License", identifier: "954634" },
  award: "2026 ABC Heart of America STEP Platinum Safety Award",
  // Only profile linked from the site (the production site links none)
  sameAs: ["https://www.linkedin.com/company/m-s-electric-kc/"],
} as const;

export const absoluteUrl = (path: string) => new URL(path, SITE.url).toString();
