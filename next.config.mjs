/**
 * 301/308 redirects (SEO guide 1.1.4–1.1.6).
 * KEEP THESE FOR AT LEAST 1 YEAR after launch: they carry the old mandselectric.net
 * URLs (and their links/rankings) to the new pages. Do not remove without checking
 * Search Console for traffic to the old URLs. Old URLs without an equivalent page
 * (WordPress theme demo content: /project/*, /events/*, /tag/*, ...) return 404 on purpose.
 */
const OLD_URLS = {
  // Old production site (mandselectric.net)
  "/home-page/": "/",
  "/our-services/": "/services/",
  "/builder-contractor-electrical-services/": "/services/",
  "/commercial-electrical-code-compliance/": "/services/",
  "/electrical-maintenance/": "/services/",
  "/retro-fit/": "/services/",
  "/contact-us/": "/contact/",
  "/team/": "/about/",
  "/testimonials/": "/",
  // Staging slug used while the site was rebuilt
  "/servicesss/": "/services/",
  // Our Story was merged into About (28/10/2026)
  "/about-us/": "/about/",
};

/**
 * Static security headers (security guide HDR-01). The Content-Security-Policy is set per
 * request, with a nonce, in src/proxy.ts; each header lives in exactly one place.
 * HSTS has no "preload" yet: add it (and submit to hstspreload.org) only once every
 * subdomain of mandselectric.net works over HTTPS.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Same URLs as the WordPress site (/about/, /contact/, ...)
  trailingSlash: true,

  // CFG-01: don't advertise the framework
  poweredByHeader: false,

  // CFG-02: the site doesn't use next/image; keep the optimizer closed to remote URLs and SVG
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: false,
    formats: ["image/webp"],
  },

  // CFG-03: smaller request bodies for Server Actions (for the future forms; default is 1 MB)
  experimental: {
    serverActions: { bodySizeLimit: "100kb" },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      // Single canonical host: www -> apex, keeping the trailing slash. (HTTP -> HTTPS is done by the hosting/CDN.)
      ...[
        ["/", "https://mandselectric.net/"],
        ["/:path+/", "https://mandselectric.net/:path+/"],
      ].map(([source, destination]) => ({
        source,
        has: [{ type: "host", value: "www.mandselectric.net" }],
        destination,
        permanent: true,
      })),
      // Next.js adds the trailing slash first, so "/our-services" reaches these as "/our-services/"
      ...Object.entries(OLD_URLS).map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
};

export default nextConfig;
