import { NextResponse, type NextRequest } from "next/server";

/**
 * Content-Security-Policy with a per-request nonce (security guide HDR-02).
 *
 * Next.js reads the nonce from the request's CSP header and adds it to its own scripts; the
 * root layout reads headers(), so every page renders per request (no static HTML/ISR).
 * This proxy only sets headers: it is not a security barrier (DEP-07). Any check on future
 * forms (validation, anti-spam, rate limit) belongs inside the Server Action / Route Handler.
 *
 * Today the site loads nothing from third parties. When GoHighLevel, GTM/GA4 or Turnstile are
 * added, extend the lists below with the exact domains from the security guide (HDR-02, GHL-01)
 * and test with CSP_REPORT_ONLY=1 first.
 */
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";
  const isHttps = request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Bricks/WordPress markup uses inline styles and <style> blocks; Splide sets styles from JS
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    // Only over HTTPS: on http://localhost it would rewrite every asset to https and break the page
    ...(isHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

  const header = process.env.CSP_REPORT_ONLY === "1" ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(header, csp);
  return response;
}

export const config = {
  matcher: [
    {
      // Pages only: static files, images and metadata files don't execute scripts
      source: "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|wp-content|images|fonts|emoji).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
