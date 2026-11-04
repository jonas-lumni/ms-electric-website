/**
 * Clones the current WordPress (Bricks) site into this Next.js project.
 *
 * - Downloads every page's HTML from the source site
 * - Converts header, footer and each page body into JSX components
 * - Downloads images and fonts into /public (mirroring /wp-content) and the theme CSS into src/styles
 *
 * Usage: node scripts/clone-wordpress.mjs
 * Re-running overwrites the generated files (src/components/Header.tsx, Footer.tsx,
 * src/app/**\/page.tsx, src/styles/pages/*, public/wp-content, public/fonts).
 */
import * as cheerio from "cheerio";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  LINK_RENAMES, HEADINGS, FOOTER_HEADINGS, TEXT_FIXES, EXACT_TEXT_FIXES, ATTRIBUTE_FIXES,
  LINK_FIXES, REMOVE, PHONE_TEXT, FORM, INSERT_AFTER, BREADCRUMB_ROUTES, MENU_REMOVE, MENU_ADD, ALT_TEXT,
} from "./seo-adjustments.mjs";

const SOURCE = "https://mse.cistage.com";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = path.join(ROOT, "public");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// route ("" = home) -> source slug. Order matters only for the report.
const PAGES = [
  { route: "", slug: "", name: "Home" },
  // About and Our Story are one page (Lucas, 28/10/2026): the About hero followed by the
  // sections of Our Story (timeline, values, team, form). /about-us/ redirects to /about/.
  { route: "about", slug: "about", name: "About", appendFrom: "about-us" },
  { route: "services", slug: "servicesss", name: "Services" },
  // Template with placeholder copy: not published (Lucas, 28/10/2026). The "_" folder is private
  // in the App Router, so the page is kept in the code but has no URL.
  { route: "single-service", slug: "single-service", name: "SingleService", outDir: "_templates/single-service" },
  { route: "markets", slug: "markets", name: "Markets" },
  { route: "contact", slug: "contact", name: "Contact" },
  // Rewritten by hand (security guide PRV-01/PRV-03): the generator keeps their CSS but not their page.tsx
  { route: "privacy-policy", slug: "privacy-policy", name: "PrivacyPolicy", handWritten: true },
  { route: "cookies-policy", slug: "cookies-policy", name: "CookiesPolicy", handWritten: true },
];

// Links to unpublished WordPress drafts. They 404 on the source site, so they point nowhere here.
const DEAD_LINKS = ["/?page_id=1183"];

const assets = new Set(); // absolute source URLs to download
const emojis = new Set(); // Twemoji codepoints (hex) used in the content

// Same image set the WordPress emoji script loads (version from the source site)
const EMOJI_BASE = "https://s.w.org/images/core/emoji/17.0.2/svg/";
// ©, ® and ™ are "pictographic" in Unicode but WordPress leaves them as text
const EMOJI_SEQ = "(?![\\u00A9\\u00AE\\u2122])\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic})*";
const EMOJI = new RegExp(EMOJI_SEQ, "u");
const EMOJI_ALL = new RegExp(EMOJI_SEQ, "gu");

// ---------------------------------------------------------------- fetching

/** fetch with a few retries: the staging server occasionally resets connections. */
async function get(url, tries = 4) {
  for (let i = 1; ; i++) {
    try {
      return await fetch(url, { headers: { "User-Agent": UA } });
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

async function fetchText(url) {
  const res = await get(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function download(url, dest) {
  if (fs.existsSync(dest)) return;
  const res = await get(url);
  if (!res.ok) {
    console.warn(`  ! ${res.status} ${url}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

// ---------------------------------------------------------------- URL rewriting

/** Turns a source-site URL into a local one and registers assets for download. */
function localUrl(raw) {
  if (!raw) return raw;
  let url = raw.trim();
  if (url.startsWith("//")) url = "https:" + url;
  if (url.startsWith(SOURCE)) url = url.slice(SOURCE.length) || "/";
  if (!url.startsWith("/")) return raw; // external, mailto:, tel:, data:, #...
  if (DEAD_LINKS.includes(url)) return "#";
  if (url.startsWith("/wp-content/") || url.startsWith("/wp-includes/")) {
    const clean = url.split(/[?#]/)[0];
    assets.add(SOURCE + clean);
    return clean;
  }
  return LINK_RENAMES[url] ?? url;
}

function rewriteSrcset(value) {
  return value
    .split(",")
    .map((part) => {
      const [u, ...rest] = part.trim().split(/\s+/);
      return [localUrl(u), ...rest].join(" ");
    })
    .join(", ");
}

/**
 * Removes declarations with a malformed var() such as `var(--x 1em, ...)` (missing comma,
 * found in Automatic.css). Browsers already drop them as invalid, so the page looks the same,
 * but Next.js 16's CSS parser (Lightning CSS) refuses to build with them.
 */
function dropInvalidDeclarations(css) {
  return css.replace(/[a-z-]+\s*:[^;{}]*var\(--[\w-]+\s+[^,)\s][^;{}]*;?/g, "");
}

/** Rewrites url(...) references inside CSS. `base` resolves relative urls. */
function rewriteCss(css, base) {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
    if (u.startsWith("data:") || u.startsWith("#")) return m;
    const abs = base ? new URL(u, base).href : u;
    if (!abs.startsWith(SOURCE) && !abs.startsWith("/")) return m;
    return `url(${q}${localUrl(abs)}${q})`;
  });
}

// ---------------------------------------------------------------- HTML cleanup

function normalize($, root) {
  root.find("script, noscript").remove();
  root.find("*").each((_, el) => {
    const $el = $(el);
    const a = el.attribs;
    // Bricks lazy loading -> real attributes
    if (a["data-src"]) { $el.attr("src", a["data-src"]); $el.removeAttr("data-src"); }
    if (a["data-srcset"]) { $el.attr("srcset", a["data-srcset"]); $el.removeAttr("data-srcset"); }
    if (a["data-sizes"]) { $el.attr("sizes", a["data-sizes"]); $el.removeAttr("data-sizes"); }
    if (a["data-style"]) {
      $el.attr("style", [a.style, a["data-style"]].filter(Boolean).join(";"));
      $el.removeAttr("data-style");
    }
    if (a["data-type"] === "string") $el.removeAttr("data-type");
    $el.removeClass("bricks-lazy-hidden");
    if (a.class === "") $el.removeAttr("class");

    if (a.src) $el.attr("src", localUrl(a.src));
    if (a.href) $el.attr("href", localUrl(a.href));
    if (a.srcset) $el.attr("srcset", rewriteSrcset(a.srcset));
    if (a.poster) $el.attr("poster", localUrl(a.poster));
    if (a.style) $el.attr("style", rewriteCss(a.style));

    // Active menu state is computed client-side (see NavState.tsx)
    if (el.name === "a") $el.removeAttr("aria-current");
    $el.removeClass("current-menu-item current_page_item current-menu-ancestor current-menu-parent current_page_parent current_page_ancestor");
  });
  // WordPress swaps emoji for Twemoji images (wp-emoji script); do the same with local copies
  root.find("*").contents().each((_, node) => {
    if (node.type !== "text" || !EMOJI.test(node.data) || ["style", "script", "title"].includes(node.parent?.name)) return;
    const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let html = "";
    let last = 0;
    for (const m of node.data.matchAll(EMOJI_ALL)) {
      const hex = [...m[0]].map((c) => c.codePointAt(0).toString(16)).filter((h) => h !== "fe0f").join("-");
      emojis.add(hex);
      html += esc(node.data.slice(last, m.index)) +
        `<img draggable="false" role="img" class="emoji" alt="${m[0]}" src="/emoji/${hex}.svg">`;
      last = m.index + m[0].length;
    }
    $(node).replaceWith(html + esc(node.data.slice(last)));
  });
  // inline <style> elements inside the body
  root.find("style").each((_, el) => {
    $(el).text(rewriteCss($(el).text()));
  });
}

/**
 * Quote forms (UX audit I1): visible <label for> above each field, required/optional marked,
 * autocomplete, an optional Company field and the full list of property types.
 */
function enhanceForms($, body) {
  body.find("form.brxe-form").each((f, form) => {
    const groups = $(form).find(".form-group").toArray();
    const controlOf = (g) => $(g).find("input, select, textarea").first();

    // Optional Company field, cloned from the Name field so it gets the same styling
    const nameGroup = groups.find((g) => controlOf(g).attr("aria-label") === FORM.addCompanyAfter);
    if (nameGroup && !$(form).find('[aria-label="Company"]').length) {
      const company = $(nameGroup).clone();
      controlOf(company).attr({ name: `form-field-company-${f}`, id: null, "aria-label": "Company", placeholder: "Your Company" });
      $(nameGroup).after(company);
    }

    $(form).find(".form-group").each((_, group) => {
      const control = controlOf(group);
      const label = control.attr("aria-label");
      if (!label || control.attr("type") === "hidden") return;
      const id = control.attr("id") || `${control.attr("name")}-${f}`;
      control.attr("id", id);
      if (FORM.autocomplete[label]) control.attr("autocomplete", FORM.autocomplete[label]);
      const required = FORM.required.includes(label) || control.attr("required") !== undefined;
      if (required) control.attr("required", "");
      if (label === "Property Type") {
        control.find("option:not(.placeholder)").remove();
        control.append(FORM.propertyTypes.map((t) => `<option value="${t}">${t}</option>`).join(""));
      }
      $(group).prepend(
        `<label for="${id}" class="seo-form-label">${label} <span class="seo-form-hint">${required ? "(required)" : "(optional)"}</span></label>`,
      );
    });

    if (FORM.note && !$(form).find(".seo-form-note").length) {
      $(form).find(".submit-button-wrapper").after(`<p class="seo-form-note">${FORM.note}</p>`);
    }
  });
}

/** SEO adjustments from seo-adjustments.mjs: NAP fixes, heading hierarchy, image loading. */
function applySeoAdjustments($, body, route) {
  body.find("*").contents().each((_, node) => {
    if (node.type !== "text") return;
    for (const [from, to] of TEXT_FIXES) if (node.data.includes(from)) node.data = node.data.split(from).join(to);
    for (const [from, to] of EXACT_TEXT_FIXES) if (node.data.trim() === from) node.data = node.data.replace(from, to);
  });
  for (const { selector, attr, value } of ATTRIBUTE_FIXES) body.find(selector).attr(attr, value);

  // Alt text for content photos (SEO guide 1.8.2)
  body.find('img[alt=""]').each((_, img) => {
    const key = Object.keys(ALT_TEXT).find((k) => (img.attribs.src ?? "").includes(k));
    if (key) img.attribs.alt = ALT_TEXT[key];
  });

  // Placeholder links -> real destinations, or removed (UX audit C3/I5)
  for (const { selector, href, label, remove } of LINK_FIXES) {
    body.find(selector).each((_, a) => {
      if (remove) return void $(a).remove();
      $(a).attr("href", href);
      if (label) $(a).attr("aria-label", label);
    });
  }
  body.find(REMOVE.join(", ")).remove();
  for (const { selector, html } of INSERT_AFTER) body.find(selector).after(html);

  // Menu items for pages that no longer exist; a dropdown left empty becomes a plain link
  body.find("li.menu-item").each((_, li) => {
    const own = $(li).find("> a, > .brx-submenu-toggle > a").first();
    if (MENU_REMOVE.includes(own.text().trim())) $(li).remove();
  });
  for (const { after, label, href } of MENU_ADD) {
    body.find("li.menu-item").each((_, li) => {
      const own = $(li).find("> a").first();
      if (own.text().trim() !== after) return;
      const item = $(li).clone().removeAttr("id");
      item.find("> a").text(label).attr("href", href);
      $(li).after(item);
    });
  }
  body.find("li.menu-item-has-children").each((_, li) => {
    if ($(li).find("> .sub-menu > li").length) return;
    $(li).find("> .sub-menu").remove();
    const toggle = $(li).find("> .brx-submenu-toggle");
    toggle.replaceWith(toggle.find("> a"));
    $(li).removeClass("menu-item-has-children");
  });

  // Plain-text phone numbers become tel: links (UX audit C7)
  body.find(PHONE_TEXT.selector).each((_, el) => {
    if (!$(el).find("a").length) $(el).html(`<a class="seo-tel-link" href="${PHONE_TEXT.href}">${$(el).html()}</a>`);
  });

  enhanceForms($, body);

  const retag = (scope, map) => {
    for (const [selector, tag] of Object.entries(map)) {
      scope.find(selector).each((_, el) => {
        // Former headings turned into <p> keep their heading look (src/styles/seo-headings.css)
        if (tag === "p" && /^h[1-6]$/.test(el.name)) $(el).addClass("seo-heading-text");
        el.name = tag;
      });
    }
  };
  retag($("#brx-content"), HEADINGS[route] ?? {});
  retag($("#brx-footer"), FOOTER_HEADINGS);

  // Visible breadcrumb at the top of the hero title's block (rendered by <Breadcrumbs />)
  if (BREADCRUMB_ROUTES.includes(route)) $("#brx-content h1").first().parent().prepend("<breadcrumbs-slot></breadcrumbs-slot>");

  // Images below the fold load lazily (Bricks did this with its own JS); the first section and header stay eager
  $("#brx-content > :not(:first-child) img, #brx-footer img").each((_, img) => {
    if (!img.attribs.loading) img.attribs.loading = "lazy";
  });
}

// ---------------------------------------------------------------- HTML -> JSX

const ATTR_MAP = {
  class: "className", for: "htmlFor", tabindex: "tabIndex", srcset: "srcSet", readonly: "readOnly",
  maxlength: "maxLength", minlength: "minLength", autocomplete: "autoComplete", autofocus: "autoFocus",
  enctype: "encType", novalidate: "noValidate", contenteditable: "contentEditable", crossorigin: "crossOrigin",
  allowfullscreen: "allowFullScreen", frameborder: "frameBorder", fetchpriority: "fetchPriority",
  colspan: "colSpan", rowspan: "rowSpan", playsinline: "playsInline", referrerpolicy: "referrerPolicy",
  datetime: "dateTime", inputmode: "inputMode", spellcheck: "spellCheck", usemap: "useMap",
  "xlink:href": "xlinkHref", "xmlns:xlink": "xmlnsXlink", "xml:space": "xmlSpace", viewbox: "viewBox",
  "accept-charset": "acceptCharset", "http-equiv": "httpEquiv", srcdoc: "srcDoc", formnovalidate: "formNoValidate",
};
const BOOLEAN_ATTRS = new Set([
  "required", "disabled", "checked", "multiple", "readonly", "autofocus", "hidden", "novalidate",
  "allowfullscreen", "playsinline", "muted", "loop", "autoplay", "controls", "selected", "open", "async", "defer",
]);
const NUMERIC_ATTRS = new Set(["maxLength", "minLength", "tabIndex", "colSpan", "rowSpan", "rows", "cols", "size", "span"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

function splitDeclarations(style) {
  const out = [];
  let depth = 0, quote = null, cur = "";
  for (const ch of style) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === ";" && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((d) => d.trim()).filter(Boolean);
}

function styleToObject(style) {
  const parts = [];
  for (const decl of splitDeclarations(style)) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const value = decl.slice(i + 1).trim();
    let key;
    if (prop.startsWith("--")) key = JSON.stringify(prop);
    else if (prop.startsWith("-ms-")) key = camel(prop.slice(1));
    else if (prop.startsWith("-")) key = camel(prop.slice(1)).replace(/^./, (c) => c.toUpperCase());
    else key = camel(prop.toLowerCase());
    parts.push(`${key}: ${JSON.stringify(value)}`);
  }
  return `{{ ${parts.join(", ")} }}`;
}

function jsxAttrs(el) {
  const out = [];
  const a = { ...el.attribs };
  if (el.name === "input" && "value" in a && a.type !== "submit" && a.type !== "button" && a.type !== "hidden") {
    a.defaultValue = a.value; delete a.value;
  }
  if (el.name === "input" && "checked" in a) { a.defaultChecked = ""; delete a.checked; }
  if (el.name === "option") delete a.selected; // handled on <select> as defaultValue
  for (const [name, value] of Object.entries(a)) {
    if (name === "style") { out.push(`style=${styleToObject(value)}`); continue; }
    if (name.startsWith("on")) continue; // inline handlers are not used
    if (value === "http://www.w3.org/1999/xlink") continue; // xmlns:xlink, not needed in React
    let key = ATTR_MAP[name] ?? name;
    if (!ATTR_MAP[name] && name.includes("-") && !name.startsWith("data-") && !name.startsWith("aria-")) key = camel(name);
    if (name === "defaultChecked") { out.push("defaultChecked"); continue; }
    if (BOOLEAN_ATTRS.has(name) && (value === "" || value === name)) { out.push(key); continue; }
    if (NUMERIC_ATTRS.has(key) && /^-?\d+$/.test(value)) { out.push(`${key}={${value}}`); continue; }
    // JSX string attributes can't hold escapes and decode HTML entities, so use an expression then
    out.push(/["\\&\n]/.test(value) ? `${key}={${JSON.stringify(value)}}` : `${key}="${value}"`);
  }
  if (el.name === "select") {
    const sel = el.children.find((c) => c.name === "option" && c.attribs && "selected" in c.attribs);
    if (sel) out.push(`defaultValue=${JSON.stringify(sel.attribs.value ?? cheerio.load(sel).text())}`);
  }
  return out.length ? " " + out.join(" ") : "";
}

function jsxText(text) {
  if (!text) return "";
  if (/^[^{}<>& \n\r\t"']+$/.test(text) && text.trim() === text) return text;
  return `{${JSON.stringify(text)}}`;
}

const BLOCK = new Set(["address", "article", "aside", "blockquote", "div", "dl", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "header", "hr", "li", "main", "nav", "ol", "p", "pre", "section", "table", "ul", "style"]);
const isBlockBoundary = (n) => !n || (n.type !== "text" && (n.type !== "tag" || BLOCK.has(n.name)));

/**
 * Internal links stay plain <a> (full page loads, like WordPress). Each page imports its own
 * Bricks CSS, and Next.js never unloads CSS on client-side navigation, so <Link> would let one
 * page's styles leak into the next.
 */
const isInternalPageLink = () => false;

function toJsx(node, indent, used) {
  const pad = "  ".repeat(indent);
  if (node.type === "text") {
    let text = node.data;
    if (!["pre", "textarea"].includes(node.parent?.name)) {
      text = text.replace(/[ \t\r\n]+/g, " ");
      if (text === " " && isBlockBoundary(node.prev) && isBlockBoundary(node.next)) return "";
    }
    const t = jsxText(text);
    return t ? pad + t : "";
  }
  if (node.type === "comment" || node.type === "directive") return "";
  if (node.type !== "tag" && node.type !== "style" && node.type !== "script") return "";
  const el = node;
  if (el.name === "style") {
    const css = el.children.map((c) => c.data).join("");
    return `${pad}<style dangerouslySetInnerHTML={{ __html: ${JSON.stringify(css)} }} />`;
  }
  let tag = el.name;
  if (isInternalPageLink(el)) { tag = "Link"; used.add("Link"); }
  const attrs = jsxAttrs(el);
  if (VOID.has(el.name)) return `${pad}<${tag}${attrs} />`;
  if (el.name === "textarea") {
    const val = el.children.map((c) => c.data ?? "").join("");
    return `${pad}<textarea${attrs}${val ? ` defaultValue=${JSON.stringify(val)}` : ""} />`;
  }
  const kids = el.children.map((c) => toJsx(c, indent + 1, used)).filter(Boolean);
  if (!kids.length) return `${pad}<${tag}${attrs}></${tag}>`;
  // keep short text-only elements on one line
  if (kids.length === 1 && el.children.length === 1 && el.children[0].type === "text" && kids[0].length < 100) {
    return `${pad}<${tag}${attrs}>${kids[0].trim()}</${tag}>`;
  }
  return `${pad}<${tag}${attrs}>\n${kids.join("\n")}\n${pad}</${tag}>`;
}

function componentFile({ name, rootHtml, $, head = "", wrap }) {
  const used = new Set();
  const nodes = $(rootHtml).toArray();
  const jsx = nodes.map((n) => toJsx(n, 2, used)).join("\n");
  const imports = [];
  if (used.has("Link")) imports.push(`import Link from "next/link";`);
  return `${head}${imports.join("\n")}${imports.length ? "\n\n" : ""}${wrap(name, jsx)}`;
}

// ---------------------------------------------------------------- main

const write = (rel, content) => {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
  console.log("  wrote", rel);
};

const decode = (s) => cheerio.load(`<p>${s}</p>`)("p").text();

// WordPress stylesheet handles in the order WordPress prints them in <head>.
// "inline:*" entries are <style> blocks printed between the <link> tags.
const CSS_ORDER = [
  "inline:wp-emoji-styles-inline-css",
  "inline:classic-theme-styles-inline-css",
  "automaticcss-core-css",
  "automaticcss-gutenberg-css",
  "inline:global-styles-inline-css",
  "bricks-frontend-css",
  "bricks-child-css",
  "bricks-font-awesome-6-css",
  "bricks-ionicons-css",
  "bricks-default-content-css",
  "automaticcss-bricks-css",
  "color-scheme-switcher-frontend-css",
  "bricks-google-fonts-css",
  "bricks-splide-css",
];
const stylesheets = {}; // handle -> href, or css text for inline blocks
const pageHandles = []; // per page: the stylesheet handles WordPress loads on it
const pendingPages = [];
const report = [];
let headerDone = false;

for (const page of PAGES) {
  console.log(`\n# ${page.name} (/${page.route})`);
  const html = await fetchText(`${SOURCE}/${page.slug ? page.slug + "/" : ""}`);
  const $ = cheerio.load(html, { decodeEntities: true });

  const title = $("title").first().text();
  const description = $('meta[name="description"]').attr("content") ?? null;
  report.push({ route: "/" + page.route, title, description });

  const handles = new Set();
  $('link[rel="stylesheet"]').each((_, l) => {
    stylesheets[$(l).attr("id")] ??= $(l).attr("href");
    handles.add($(l).attr("id"));
  });
  for (const h of CSS_ORDER.filter((h) => h.startsWith("inline:"))) {
    stylesheets[h] ??= $("#" + h.slice(7)).text();
    handles.add(h);
  }
  pageHandles.push(handles);

  // Page-specific CSS generated by Bricks (includes header/footer element styles)
  const pageCss = rewriteCss($("#bricks-frontend-inline-inline-css").text());
  write(`src/styles/pages/${page.route || "home"}.css`, pageCss);


  const body = $("body");
  const routePath = page.route ? `/${page.route}/` : "/";
  normalize($, body);
  applySeoAdjustments($, body, routePath);

  // Merged page: keep this page's hero, then every section of the other page after its hero
  const extraCss = [];
  if (page.appendFrom) {
    const $2 = cheerio.load(await fetchText(`${SOURCE}/${page.appendFrom}/`), { decodeEntities: true });
    $2('link[rel="stylesheet"]').each((_, l) => {
      stylesheets[$2(l).attr("id")] ??= $2(l).attr("href");
      handles.add($2(l).attr("id"));
    });
    write(`src/styles/pages/${page.appendFrom}.css`, rewriteCss($2("#bricks-frontend-inline-inline-css").text()));
    extraCss.push(page.appendFrom);
    normalize($2, $2("body"));
    applySeoAdjustments($2, $2("body"), routePath);
    $("#brx-content").children().slice(1).remove();
    $("#brx-content").append($2("#brx-content").children().slice(1).toArray().map((n) => $2.html(n)).join(""));
  }

  if (!headerDone) {
    const wrap = (tag) => (name, jsx) =>
      `export default function ${name}() {\n  return (\n    <${tag} id="brx-${tag}">\n${jsx}\n    </${tag}>\n  );\n}\n`;
    write("src/components/Header.tsx", componentFile({ name: "Header", rootHtml: $("#brx-header").html(), $, wrap: wrap("header") }));
    write("src/components/Footer.tsx", componentFile({ name: "Footer", rootHtml: $("#brx-footer").html(), $, wrap: wrap("footer") }));
    headerDone = true;
  }

  // Most pages use <main>, the policy pages use <article class="wordpress ...">
  const mainEl = $("#brx-content").get(0);
  const mainTag = mainEl.name;
  const mainAttrs = jsxAttrs(mainEl);
  // Title, description, keywords and canonical live in src/lib/seo.ts; JSON-LD in PageSchema
  const wrapPage = (name, jsx) =>
    `export const metadata: Metadata = pageMetadata(${JSON.stringify(routePath)});\n\n` +
    `export default function ${name}Page() {\n  return (\n    <>\n      <${mainTag}${mainAttrs}>\n${jsx}\n      </${mainTag}>\n` +
    `      <PageSchema route=${JSON.stringify(routePath)} />\n    </>\n  );\n}\n`;
  // Written once we know which theme stylesheets are global and which are page-only
  pendingPages.push((themeImports) => {
    if (page.handWritten) return;
    const head =
      `import type { Metadata } from "next";\n` +
      `import { pageMetadata } from "@/lib/seo";\n` +
      `import PageSchema from "@/components/PageSchema";\n` +
      themeImports.map((f) => `import "@/styles/wordpress/${f}";\n`).join("") +
      `import "@/styles/pages/${page.route || "home"}.css";\n` +
      extraCss.map((c) => `import "@/styles/pages/${c}.css";\n`).join("") +
      "\n";
    let file = componentFile({ name: page.name, rootHtml: $("#brx-content").html(), $, head, wrap: wrapPage });
    if (file.includes("<breadcrumbs-slot></breadcrumbs-slot>")) {
      file = file
        .replace("<breadcrumbs-slot></breadcrumbs-slot>", `<Breadcrumbs route=${JSON.stringify(routePath)} />`)
        .replace(`import PageSchema from "@/components/PageSchema";\n`, `import PageSchema from "@/components/PageSchema";\nimport Breadcrumbs from "@/components/Breadcrumbs";\n`);
    }
    const dir = page.outDir ?? page.route;
    write(`src/app/${dir ? dir + "/" : ""}page.tsx`, file);
  });
}

// ---------------------------------------------------------------- stylesheets & fonts

console.log("\n# Stylesheets");
const unknown = Object.keys(stylesheets).filter((h) => !CSS_ORDER.includes(h));
if (unknown.length) console.warn("  ! stylesheets not in CSS_ORDER (skipped):", unknown);
const imports = [];
const pageOnly = {}; // handle -> file
for (const [i, handle] of CSS_ORDER.entries()) {
  if (!(handle in stylesheets)) continue;
  const file = `${String(i + 1).padStart(2, "0")}-${handle.replace(/^inline:/, "").replace(/(-inline)?-css$/, "")}.css`;
  let css;
  if (handle.startsWith("inline:")) {
    css = rewriteCss(stylesheets[handle]);
  } else {
    const url = decode(stylesheets[handle]);
    css = await fetchText(url);
    if (url.startsWith("https://fonts.googleapis.com")) {
      // Self-host Google Fonts
      for (const f of new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]))) {
        const local = "/fonts/" + f.split("/").pop();
        await download(f, path.join(PUBLIC, local));
        css = css.split(f).join(local);
      }
    } else {
      css = rewriteCss(css, url.split("?")[0]);
    }
  }
  write(`src/styles/wordpress/${file}`, dropInvalidDeclarations(css));
  // Stylesheets WordPress loads on every page are global; the rest are imported by the pages that use them
  if (pageHandles.every((h) => h.has(handle))) imports.push(`import "./${file}";`);
  else pageOnly[handle] = file;
}
write(
  "src/styles/wordpress/index.ts",
  "// Generated by scripts/clone-wordpress.mjs: WordPress/Bricks theme CSS loaded on every page, in the original <head> order.\n" +
    imports.join("\n") + "\n",
);
pendingPages.forEach((writePage, i) =>
  writePage(Object.keys(pageOnly).filter((h) => pageHandles[i].has(h)).map((h) => pageOnly[h])),
);

for (const hex of emojis) await download(`${EMOJI_BASE}${hex}.svg`, path.join(PUBLIC, "emoji", `${hex}.svg`));

console.log(`\n# Downloading ${assets.size} assets`);
const list = [...assets];
for (let i = 0; i < list.length; i += 8) {
  await Promise.all(list.slice(i, i + 8).map((u) => download(u, path.join(PUBLIC, decodeURI(u.slice(SOURCE.length))))));
}

write("scripts/seo-report.json", JSON.stringify(report, null, 2));
console.log("\nDone.");
