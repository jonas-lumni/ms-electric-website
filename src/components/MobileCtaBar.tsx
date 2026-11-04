/**
 * UX audit I9: fixed Call / Get a Quote bar on phones (hidden from 768px up, see src/styles/ux.css).
 * The page gets matching bottom padding so the bar never covers content or the focused element.
 */
export default function MobileCtaBar() {
  return (
    <nav className="mobile-cta-bar" aria-label="Quick contact">
      <a className="mobile-cta-bar__call" href="tel:+18164275913">
        Call (816) 427-5913
      </a>
      <a className="mobile-cta-bar__quote" href="/contact/">
        Get a Quote
      </a>
    </nav>
  );
}
