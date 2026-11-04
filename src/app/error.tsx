"use client";

/**
 * Generic error page (security guide CFG-05 / FRM-07): no stack trace or error message is
 * shown; error.digest is the ID to look up in the server logs.
 */
const light = { color: "var(--white)" };

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="brx-content">
      <section className="brxe-section" style={{ background: "var(--neutral-ultra-dark, #1a1a1a)", paddingTop: "220px", paddingBottom: "120px" }}>
        <div className="brxe-container" style={{ rowGap: "24px", alignItems: "flex-start" }}>
          <h1 className="brxe-heading h1-headline headline headline-light" style={light}>
            Something went wrong
          </h1>
          <p className="brxe-text-basic paragraph paragraph-light" style={light}>
            Please try again, or call us at{" "}
            <a href="tel:+18164275913" style={{ ...light, textDecoration: "underline" }}>
              (816) 427-5913
            </a>
            .
          </p>
          {error.digest && (
            <p className="brxe-text-basic paragraph paragraph-light" style={{ ...light, opacity: 0.7, fontSize: "14px" }}>
              Reference: {error.digest}
            </p>
          )}
          <button type="button" onClick={reset} className="brxe-button primary-button bricks-button bricks-background-primary">
            Try again
          </button>
        </div>
      </section>
    </main>
  );
}
