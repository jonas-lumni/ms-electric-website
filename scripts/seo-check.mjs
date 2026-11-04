/**
 * SEO/AIO check (docs/SEO-relatorio.md, "Guia de SEO e AIO" sections 1, 2, 3.1, 4, 5),
 * plus the automatable items of the UX audit (docs/UX-relatorio.md) and of the security
 * guide (docs/SEGURANCA.md: headers, CSP nonce, cookies, image optimizer, source maps).
 * Run after EVERY change to the site, against a production build:
 *
 *   npm run build && npm start        (in one terminal)
 *   npm run seo:check                 (in another; BASE=http://localhost:3000 by default)
 *   npm run seo:check -- new-page/    (also checks pages that aren't in the sitemap yet;
 *                                      no leading slash, so Git Bash doesn't rewrite it as a path)
 *
 * Exits with code 1 when any check fails. Warnings don't fail the run.
 */
import * as cheerio from "cheerio";

const BASE = (process.env.BASE ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://mandselectric.net";
const UA = "GPTBot"; // AI crawlers don't run JavaScript: everything checked here must be in the server HTML

const ALLOWED_META = new Set(["description", "keywords", "author", "viewport"]);
const FORBIDDEN_STRINGS = ["cistage", "hostingersite", "navajowhite"];
const NAP = {
  phoneHref: "tel:+18164275913",
  address: "3026 SW East US 40 Hwy, Blue Springs, MO 64015",
};
// Old URLs that must keep redirecting (next.config.mjs)
const REDIRECTS = { "/our-services/": "/services/", "/contact-us/": "/contact/", "/team/": "/about/", "/servicesss/": "/services/", "/about-us/": "/about/" };

let failures = 0;
let warnings = 0;
const fail = (where, msg) => { failures++; console.log(`  ✗ ${where}: ${msg}`); };
const warn = (where, msg) => { warnings++; console.log(`  ! ${where}: ${msg}`); };

async function get(path, opts = {}) {
  try {
    return await fetch(BASE + path, { redirect: "manual", headers: { "User-Agent": UA }, ...opts });
  } catch {
    console.error(`Can't reach ${BASE}. Start the site first (npm run build && npm start) or set BASE.`);
    process.exit(2);
  }
}

// ---------------------------------------------------------------- site-wide files

console.log(`SEO/AIO check on ${BASE}\n`);
console.log("# robots.txt / sitemap.xml / 404 / redirects");

const robots = await get("/robots.txt");
const robotsTxt = await robots.text();
if (robots.status !== 200 || !robots.headers.get("content-type")?.startsWith("text/plain")) fail("robots.txt", `status ${robots.status}, ${robots.headers.get("content-type")}`);
if (!robotsTxt.includes(`Sitemap: ${SITE}/sitemap.xml`)) fail("robots.txt", "missing Sitemap line");
for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "PerplexityBot", "GPTBot", "ClaudeBot"]) {
  if (!robotsTxt.includes(`User-Agent: ${bot}`)) fail("robots.txt", `no group for ${bot}`);
}
if (/Disallow: \/\s*$/m.test(robotsTxt)) fail("robots.txt", "a group disallows the whole site");

const sitemapRes = await get("/sitemap.xml");
const sitemapUrls = [...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (sitemapRes.status !== 200 || !sitemapUrls.length) fail("sitemap.xml", `status ${sitemapRes.status}, ${sitemapUrls.length} URLs`);

const notFound = await get("/this-page-does-not-exist-seo-check/");
if (notFound.status !== 404) fail("404", `unknown URL returned ${notFound.status}, expected 404`);

// Security guide CFG-02 / ENV-05: image optimizer closed to remote URLs, no public source maps
const remoteImg = await get("/_next/image/?url=https%3A%2F%2Fexample.com%2Fx.png&w=640&q=75");
if (remoteImg.status !== 400) fail("next/image", `remote URL returned ${remoteImg.status}, expected 400`);
const homeHtml = await (await get("/")).text();
const chunk = homeHtml.match(/\/_next\/static\/[^"]+\.js/)?.[0];
if (chunk && (await get(chunk + ".map")).status !== 404) fail("source maps", `${chunk}.map is public`);

for (const [from, to] of Object.entries(REDIRECTS)) {
  const r = await get(from);
  const loc = r.headers.get("location") ?? "";
  if (![301, 308].includes(r.status) || !loc.endsWith(to)) fail("redirect", `${from} -> ${r.status} ${loc} (expected 301/308 to ${to})`);
}

// ---------------------------------------------------------------- every page in the sitemap

const titles = new Map();
const descriptions = new Map();

// Extra paths can be passed as arguments (e.g. a new page not yet in the sitemap)
const extra = process.argv.slice(2).map((p) => SITE + (p.startsWith("/") ? p : "/" + p));
for (const url of [...sitemapUrls, ...extra.filter((u) => !sitemapUrls.includes(u))]) {
  if (!url.startsWith(SITE + "/")) { fail("sitemap", `${url} is not on ${SITE}`); continue; }
  const path = url.slice(SITE.length);
  console.log(`\n# ${path}`);
  const res = await get(path);
  if (res.status !== 200) { fail(path, `status ${res.status} (sitemap URLs must be 200)`); continue; }
  const html = await res.text();
  const $ = cheerio.load(html);

  // Security guide HDR-01/HDR-02/CFG-01: headers on every page
  const h = (k) => res.headers.get(k) ?? "";
  const csp = h("content-security-policy");
  if (!/'nonce-[^']+'/.test(csp) || !csp.includes("'strict-dynamic'")) fail(path, "Content-Security-Policy without nonce + 'strict-dynamic'");
  if (/script-src[^;]*'unsafe-inline'/.test(csp)) fail(path, "CSP allows 'unsafe-inline' scripts");
  if (!csp.includes("frame-ancestors 'none'")) fail(path, "CSP missing frame-ancestors 'none'");
  for (const [k, v] of [["strict-transport-security", "max-age="], ["x-content-type-options", "nosniff"], ["x-frame-options", "DENY"], ["referrer-policy", "strict-origin-when-cross-origin"], ["permissions-policy", "camera=()"]]) {
    if (!h(k).includes(v)) fail(path, `header ${k} missing or wrong ("${h(k)}")`);
  }
  if (h("x-powered-by")) fail(path, "X-Powered-By header exposed");
  if (h("set-cookie")) fail(path, "page sets a cookie: update the Cookies/Privacy policies first");
  const htmlScripts = [...html.matchAll(/<script(?![^>]*type="application\/ld\+json")[^>]*>/g)].map((m) => m[0]);
  if (htmlScripts.some((s) => !s.includes("nonce="))) fail(path, "<script> without the CSP nonce");

  // 1.3.4 language
  if ($("html").attr("lang") !== "en-US") fail(path, `<html lang> is "${$("html").attr("lang")}"`);

  // 2.1 / 2.2 title + description
  const title = $("head title").text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  // SEO guide: title ≤ 70, description ≤ 155. UX audit: title 50–60, description 140–160.
  if (!title) fail(path, "missing <title>");
  else if (title.length < 50 || title.length > 60) fail(path, `title has ${title.length} chars (50–60): ${title}`);
  if (!description) fail(path, "missing meta description");
  else if (description.length < 140 || description.length > 155) fail(path, `description has ${description.length} chars (140–155)`);
  if (titles.has(title)) fail(path, `title duplicates ${titles.get(title)}`);
  if (descriptions.has(description)) fail(path, `description duplicates ${descriptions.get(description)}`);
  titles.set(title, path);
  descriptions.set(description, path);

  // Rule 4: only title/description/keywords/author (+ charset, viewport), plus Open Graph and its
  // Twitter card fallback (exception approved by Lucas, 28/10/2026); no robots on indexable pages
  $("head meta").each((_, m) => {
    const a = m.attribs;
    if (a.charset !== undefined || a.charSet !== undefined) return;
    if (a.property?.startsWith("og:") || a.name?.startsWith("twitter:")) return;
    if (!a.name || !ALLOWED_META.has(a.name)) fail(path, `meta tag not allowed: ${$.html(m).slice(0, 90)}`);
  });
  // UX audit I6: complete Open Graph (title, description, url, image 1200x630, site_name)
  const og = (p) => $(`meta[property="og:${p}"]`).attr("content") ?? "";
  if (og("title") !== title) fail(path, `og:title "${og("title")}" differs from <title>`);
  if (og("description") !== description) fail(path, "og:description differs from the meta description");
  if (og("url") !== url) fail(path, `og:url is "${og("url")}", expected ${url}`);
  if (og("site_name") !== "M&S Electric") fail(path, "og:site_name must be M&S Electric");
  if (!og("image").startsWith(SITE + "/") || og("image:width") !== "1200" || og("image:height") !== "630") {
    fail(path, `og:image missing or not 1200x630 on ${SITE} (${og("image")})`);
  } else {
    const img = await get(og("image").slice(SITE.length));
    if (img.status !== 200 || !img.headers.get("content-type")?.startsWith("image/")) fail(path, `og:image returns ${img.status} (must be 200, no redirect)`);
  }
  const keywords = ($('meta[name="keywords"]').attr("content") ?? "").split(",").filter((k) => k.trim());
  if (keywords.length < 2 || keywords.length > 6) warn(path, `${keywords.length} keywords (guide: 3–6)`);
  if (!$('meta[name="author"]').attr("content")) fail(path, "missing meta author");

  // 1.3.1 canonical: absolute, self-referencing, canonical host
  const canonical = $('link[rel="canonical"]').attr("href");
  if (canonical !== url) fail(path, `canonical is "${canonical}", expected ${url}`);

  // 2.4 headings: exactly one H1, no skipped levels
  const levels = $("body h1, body h2, body h3, body h4, body h5, body h6").toArray().map((h) => Number(h.name[1]));
  const h1s = levels.filter((l) => l === 1).length;
  if (h1s !== 1) fail(path, `${h1s} <h1> tags (must be exactly 1)`);
  levels.forEach((l, i) => { if (i && l > levels[i - 1] + 1) fail(path, `heading jumps from h${levels[i - 1]} to h${l}`); });

  // 4.x structured data: valid JSON, no self-serving reviews
  const ld = $('script[type="application/ld+json"]').toArray();
  if (!ld.length) fail(path, "no JSON-LD");
  for (const s of ld) {
    try {
      const json = JSON.stringify(JSON.parse($(s).text()));
      if (/"@type":"(Review|AggregateRating)"/.test(json)) fail(path, "Review/AggregateRating markup is not allowed (self-serving)");
      if (json.includes("[CONFIRMAR")) fail(path, "JSON-LD contains a [CONFIRMAR] placeholder");
    } catch { fail(path, "invalid JSON-LD"); }
  }

  // 1.1.3 no staging / old hosts
  for (const s of FORBIDDEN_STRINGS) if (html.includes(s)) fail(path, `contains "${s}"`);
  if (/(src|href)="http:\/\//.test(html)) fail(path, "http:// link or resource (mixed content)");

  // 3.1.1 NAP consistency + 1.7.1 phone link
  const tels = new Set($('a[href^="tel:"]').toArray().map((a) => a.attribs.href));
  for (const t of tels) if (t !== NAP.phoneHref) fail(path, `phone link ${t} differs from ${NAP.phoneHref}`);
  if (!$("body").text().includes(NAP.address)) fail(path, `footer address "${NAP.address}" not found`);
  if (/Blue Spring,|US Highway 40/i.test($("body").text())) fail(path, "inconsistent address variant");
  // Client-confirmed facts (28/10/2026): services@ email, office hours until 5 PM, founded in 2011
  const visibleBody = $("body").clone();
  visibleBody.find("script, style, svg").remove(); // SVG path data and the RSC payload aren't copy
  const bodyText = visibleBody.text();
  if (/\bservice@mandselectric|info@mandselectric/.test(html)) fail(path, "old email (the official one is services@mandselectric.net)");
  if (/7(:00)? PM/.test(bodyText)) fail(path, "office hours must end at 5 PM");
  if (/since 2005|\b2005\b/.test(bodyText)) fail(path, "founding year must be 2011");

  // SEO guide 4.4: internal pages show a breadcrumb that matches the BreadcrumbList JSON-LD
  if (path !== "/") {
    const visible = $('nav[aria-label="Breadcrumb"] li').toArray().map((li) => $(li).text().trim());
    const ldTrail = ld.map((s) => { try { return JSON.parse($(s).text()); } catch { return {}; } })
      .flatMap((j) => j["@graph"] ?? [j]).find((n) => n["@type"] === "BreadcrumbList");
    const ldNames = ldTrail?.itemListElement?.map((i) => i.name) ?? [];
    if (!visible.length) fail(path, "no visible breadcrumb");
    else if (visible.join(">") !== ldNames.join(">")) fail(path, `breadcrumb (${visible.join(" > ")}) differs from BreadcrumbList (${ldNames.join(" > ")})`);
  }

  // 5.2.5 entity name
  if (/\bM and S Electric\b|\bMS Electric\b|\bM & S Electric\b/.test($("body").text())) fail(path, "entity name variant (always 'M&S Electric')");

  // 1.5.1 main content in server HTML
  const mainText = $("#brx-content").text().replace(/\s+/g, " ").trim();
  if (mainText.length < 200) warn(path, `only ${mainText.length} chars of main content in the HTML (thin page?)`);

  // 1.5.2 crawlable links + UX audit C3/I5: real destinations and descriptive link text
  $("a").each((_, a) => {
    const text = $(a).text().replace(/\s+/g, " ").trim();
    const name = a.attribs["aria-label"] || text || $(a).find("img[alt]").attr("alt") || "";
    const href = a.attribs.href;
    if (!href) fail(path, `<a> without href: "${text.slice(0, 40)}"`);
    else if (href === "#" || href.includes("page_id=")) fail(path, `placeholder link href="${href}" ("${text.slice(0, 40)}")`);
    if (!name) fail(path, `link to ${href} has no accessible name (text or aria-label)`);
    if (/^(learn more|read more|click here|more)$/i.test(name)) fail(path, `generic link text "${name}" to ${href}: add an aria-label with the item name`);
    if (/^https?:\/\//.test(text)) fail(path, `link text is a raw URL: ${text}`);
  });

  // UX audit: skip links, form labels, template phone number
  if (!$('a.skip-link[href="#brx-content"]').length) fail(path, "missing 'Skip to main content' link");
  $("form input:not([type=hidden]):not([type=submit]), form select, form textarea").each((_, c) => {
    const id = c.attribs.id;
    if (!id || !$(`label[for="${id}"]`).length) fail(path, `form field "${c.attribs.name}" has no visible <label for>`);
  });
  $('form input[type="email"], form input[type="tel"]').each((_, c) => {
    if (!c.attribs.autocomplete) fail(path, `form field "${c.attribs.name}" has no autocomplete`);
  });
  if (/855[\s)-]*233-5385/.test($("body").text())) fail(path, "template phone number (855) 233-5385");

  // 1.8.2 alt text + 1.8.3 lazy loading
  const imgs = $("#brx-content img").toArray().filter((i) => !i.attribs.class?.includes("emoji"));
  const noAlt = imgs.filter((i) => i.attribs.alt === undefined);
  const emptyAlt = imgs.filter((i) => i.attribs.alt === "");
  if (noAlt.length) fail(path, `${noAlt.length} <img> without an alt attribute`);
  if (emptyAlt.length) warn(path, `${emptyAlt.length} images with alt="" (fine only if decorative)`);
  const firstSectionImgs = new Set($("#brx-content > :first-child img").toArray());
  const eagerBelowFold = imgs.filter((i) => !firstSectionImgs.has(i) && i.attribs.loading !== "lazy");
  if (eagerBelowFold.length) warn(path, `${eagerBelowFold.length} below-the-fold images without loading="lazy"`);
  if ($("#brx-content > :first-child img[loading=lazy]").length) fail(path, "image in the first section is lazy (hurts LCP)");

  // Placeholder copy must not be published on indexable pages
  if (/lorem ipsum|\bJohn Doe\b|\[CONFIRMAR/i.test($("body").text())) fail(path, "placeholder text (Lorem ipsum / John Doe / [CONFIRMAR])");
}

// llms.txt (optional, 5.4.1): if it exists it must be valid
const llms = await get("/llms.txt");
if (llms.status === 200) {
  const txt = await llms.text();
  for (const [, link] of txt.matchAll(/\]\((https:\/\/mandselectric\.net[^)]*)\)/g)) {
    if (!sitemapUrls.includes(link)) fail("llms.txt", `links to ${link}, which isn't in the sitemap`);
  }
}

console.log(`\n${failures ? "✗" : "✓"} ${failures} failure(s), ${warnings} warning(s)`);
process.exit(failures ? 1 : 0);
