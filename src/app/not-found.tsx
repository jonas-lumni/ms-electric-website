import type { Metadata } from "next";
import "@/styles/pages/contact.css";

// Guide 1.3.3: unknown URLs return a real 404 (Next.js sets the status and a noindex robots tag),
// with navigation, the phone number and links to the services.
export const metadata: Metadata = {
  title: { absolute: "Page Not Found | M&S Electric" },
  description: "The page you are looking for does not exist. Find M&S Electric's commercial electrical services or call 816-427-5913.",
};

const LINKS = [
  { href: "/services/", label: "Commercial electrical services" },
  { href: "/markets/", label: "Markets we serve" },
  { href: "/about/", label: "About M&S Electric" },
  { href: "/contact/", label: "Contact us" },
];

const light = { color: "var(--white)" };

export default function NotFound() {
  return (
    <main id="brx-content">
      {/* Dark like the other pages' heroes: the header is transparent with white text */}
      <section className="brxe-section" style={{ background: "var(--neutral-ultra-dark, #1a1a1a)", paddingTop: "220px", paddingBottom: "120px" }}>
        <div className="brxe-container" style={{ rowGap: "24px", alignItems: "flex-start" }}>
          <p className="seo-heading-text" style={{ fontSize: "14px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", color: "var(--accent)" }}>
            Error 404
          </p>
          <h1 className="brxe-heading h1-headline headline headline-light" style={light}>
            Page not found
          </h1>
          <p className="brxe-text-basic paragraph paragraph-light" style={light}>
            The page you are looking for doesn&apos;t exist or has moved. Call us at{" "}
            <a href="tel:+18164275913" style={{ ...light, textDecoration: "underline" }}>
              (816) 427-5913
            </a>{" "}
            or use the links below.
          </p>
          <ul style={{ display: "grid", gap: "12px", paddingLeft: "20px", ...light }}>
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} style={{ ...light, textDecoration: "underline" }}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="/" className="brxe-button primary-button bricks-button bricks-background-primary">
            Back to home
          </a>
        </div>
      </section>
    </main>
  );
}
