"use client";

/**
 * Last-resort error page, used when the root layout itself fails (security guide CFG-05).
 * It replaces the whole document, so it carries its own minimal styling. No error details.
 */
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="en-US">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", background: "#1a1a1a", color: "#fff" }}>
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "120px 24px" }}>
          <h1 style={{ fontSize: 40, margin: "0 0 16px" }}>Something went wrong</h1>
          <p style={{ fontSize: 18, lineHeight: 1.5 }}>
            M&amp;S Electric: please try again later, or call us at{" "}
            <a href="tel:+18164275913" style={{ color: "#fff" }}>
              (816) 427-5913
            </a>
            .
          </p>
          {error.digest && <p style={{ opacity: 0.7, fontSize: 14 }}>Reference: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
