import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@/styles/wordpress";
import "@/styles/seo-headings.css";
import "@/styles/ux.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteBehavior from "@/components/SiteBehavior";
import MobileCtaBar from "@/components/MobileCtaBar";
import { SITE } from "@/lib/site";

// Each page sets its title, description, keywords and canonical (src/lib/seo.ts).
// Only title/description/keywords/author meta tags are allowed (SEO guide, rule 4).
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  authors: [{ name: SITE.name }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Reading the request headers renders every page per request, which the CSP nonce
  // (src/proxy.ts) needs: Next.js adds the nonce to its scripts at render time.
  await headers();
  return (
    <html lang="en-US">
      <body className="page-template-default page wp-theme-bricks wp-child-theme-bricks-child brx-body bricks-is-frontend wp-embed-responsive">
        {/* Same skip links as the WordPress site (shown on keyboard focus by Bricks' .skip-link CSS) */}
        <a className="skip-link" href="#brx-content">
          Skip to main content
        </a>
        <a className="skip-link" href="#brx-footer">
          Skip to footer
        </a>
        <Header />
        {children}
        <Footer />
        <MobileCtaBar />
        <SiteBehavior />
      </body>
    </html>
  );
}
