import type { Route } from "@/lib/seo";

/**
 * Breadcrumb trail per page: shown by <Breadcrumbs /> and marked up as BreadcrumbList
 * in PageSchema (SEO guide 4.4: the JSON-LD must match the visible trail).
 * The last item is the current page (no link).
 */
export const BREADCRUMBS: Partial<Record<Route, { name: string; href?: string }[]>> = {
  "/about/": [{ name: "Home", href: "/" }, { name: "About" }],
  "/services/": [{ name: "Home", href: "/" }, { name: "Services" }],
  "/markets/": [{ name: "Home", href: "/" }, { name: "Markets" }],
  "/case-studies/": [{ name: "Home", href: "/" }, { name: "Case Studies" }],
  "/case-studies/kmg-hotels-hotel-development/": [{ name: "Home", href: "/" }, { name: "Case Studies", href: "/case-studies/" }, { name: "KMG Hotels" }],
  "/case-studies/construction-brokers-elevator-electrical/": [
    { name: "Home", href: "/" },
    { name: "Case Studies", href: "/case-studies/" },
    { name: "Construction Brokers Inc." },
  ],
  "/contact/": [{ name: "Home", href: "/" }, { name: "Contact" }],
  "/privacy-policy/": [{ name: "Home", href: "/" }, { name: "Privacy Policy" }],
  "/cookies-policy/": [{ name: "Home", href: "/" }, { name: "Cookies Policy" }],
};
