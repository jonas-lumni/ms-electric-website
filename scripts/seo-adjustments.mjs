/**
 * SEO adjustments applied by clone-wordpress.mjs on top of the cloned WordPress markup
 * (see docs/SEO-relatorio.md for the before/after changelog).
 */

/** Internal URL renames: old path -> new path (the old path gets a 301 in next.config.mjs). */
export const LINK_RENAMES = {
  "/servicesss/": "/services/",
  "/about-us/": "/about/", // Our Story merged into About
};

/** Menu items (by link text) removed from the header and footer menus. */
export const MENU_REMOVE = ["Our Story"];

/**
 * Heading hierarchy: one <h1> per page, <h2> for section titles, <h3> below that.
 * The WordPress pages use <h3> for everything. Eyebrow labels, stats and testimonial
 * names become <p> so the outline has no skipped levels. Selectors run inside the page.
 */
const SHARED_HEADINGS = {
  // "Testimonials" block
  ".brxe-ymnirt": "p",
  ".brxe-kbcqgi": "h2",
  ".brxe-xoruob, .brxe-keoafl, .brxe-oemrqe, .brxe-yulbbf, .brxe-xvwsog, .brxe-pfmhtl": "p",
  // "Who we serve" block
  ".brxe-bkyxeu": "p",
  ".brxe-lllvzc": "h2",
  // "Services" block
  ".brxe-jtdjyr": "p",
  ".brxe-kvzehi": "h2",
  // Call-to-action + form block
  ".brxe-aztxgl, .brxe-qisnvg": "h2",
};

export const HEADINGS = {
  "/": {
    "#brxe-gghxhb": "h1",
    "#brxe-ksxlcy, #brxe-zsgdlr, #brxe-hovnxe, #brxe-holphv, #brxe-gzffxb": "p",
    // "Recent projects" slider: category tags are labels, project names are titles
    ".portfolio-item-header-container > .brxe-heading": "p",
    ".portfolio-item-info-details > .brxe-heading": "h2",
    // "Why M&S is Different"
    "#brxe-sqnhgd": "h2",
    "#brxe-pkeabi, #brxe-ocqfgm": "p",
  },
  // About = About hero + the Our Story sections (see clone-wordpress.mjs, appendFrom)
  "/about/": {
    "#brxe-ieducg": "h1",
    "#brxe-hjhyfr, #brxe-iwsypk": "p",
    "#brxe-xclzpq": "h2",
    "#brxe-jvtkti": "h1", // Our Story hero: dropped when the pages are merged
    "#brxe-abhdvt, #brxe-zixgvh, #brxe-cjheom": "p",
    ".timeline-13__content-heading": "h2",
    "#brxe-xuxsgi, #brxe-ndmqgw": "h2",
    // team member roles
    "#brxe-owndoi, #brxe-lvwdeu, #brxe-oxutyf, #brxe-vuvhvc, #brxe-csgfiw, #brxe-ddsuvx, #brxe-frnpgy, #brxe-pqwauj": "p",
  },
  "/services/": {
    "#brxe-spnimd": "h1",
    "#brxe-hdibhn": "p",
    "#brxe-yyqytm, #brxe-kbskhy, #brxe-xcpyyl, #brxe-gzboni, #brxe-cvwlme": "h2",
  },
  "/markets/": {
    "#brxe-lsegdm": "h1",
    "#brxe-fvmqqf": "p",
    "#brxe-zsojwi, #brxe-eedyhh, #brxe-vdyqgt, #brxe-alenfn, #brxe-knjvop, #brxe-criqnj, #brxe-dnqslz": "h2",
  },
  "/contact/": {
    "#brxe-anvriw": "h1",
    "#brxe-gwgbvd": "h2",
  },
  // Template page with placeholder copy: only gets its H1 until real content exists
  "/single-service/": {
    "#brxe-ymthme": "h1",
  },
};
for (const route of Object.keys(HEADINGS)) {
  if (!["/contact/", "/single-service/"].includes(route)) HEADINGS[route] = { ...SHARED_HEADINGS, ...HEADINGS[route] };
}

export const FOOTER_HEADINGS = {
  "#brxe-rkzkxq": "h2",
};

/** NAP and entity fixes (guide 3.1.1, 1.1.3, 1.7.1, 1.8.2, 5.2.5) and copy fixes (UX audit I8). */
export const TEXT_FIXES = [
  ["3026 SW East US 40 hwy, Blue Spring, Mo 64015, US", "3026 SW East US 40 Hwy, Blue Springs, MO 64015"],
  ["Our website address is: https://mse.cistage.com.", "Our website address is: https://mandselectric.net."],
  [" long-term relationship ", " long-term relationships "],
  // Confirmed by the client (28/10/2026): founded in 2011, hours until 5 PM, email services@
  ["contractor since 2005", "contractor since 2011"],
  ["Mon – Fri, 8 AM – 7 PM", "Mon – Fri, 8 AM – 5 PM"],
  ["Monday – Friday, 8:00 AM – 7:00 PM", "Monday – Friday, 8:00 AM – 5:00 PM"],
  ["service@mandselectric.net", "services@mandselectric.net"],
];

/** Whole-text replacements (the text node must match exactly). */
export const EXACT_TEXT_FIXES = [
  ["Hotel", "Hotels"], // UX audit I8: singular among plurals
  ["2005", "2011"], // home stats: "KC Commercial & Institutional Since" (client: founded in 2011)
  // SEO guide 2.4 / UX audit C6: H1 with topic and location (approved by Lucas)
  ["From groundbreaking to long-term operations", "Commercial Electrical Contractor in Kansas City"],
];

/**
 * UX audit C3/I5: the WordPress links pointed to an unpublished draft (?page_id=1183).
 * Each one now goes to the matching section of an existing page, with an accessible name that
 * says where it goes; links with no real destination yet (projects/case studies) are removed
 * until those pages exist. Selectors run on the whole page; `pages` limits a rule to some routes.
 */
const SERVICE_ANCHORS = {
  "Commercial Electrical": "/services/#brxe-yyqytm",
  "Fire Alarm Systems": "/services/#brxe-kbskhy",
  "Low Voltage": "/services/#brxe-xcpyyl",
  "Maintenance & Service": "/services/#brxe-gzboni",
  "Specialty Services": "/services/#brxe-cvwlme",
};
const MARKET_ANCHORS = {
  "Shopping Centers": "/markets/#brxe-zsojwi",
  Hotels: "/markets/#brxe-eedyhh",
  "Multi-Family": "/markets/#brxe-vdyqgt",
  Medical: "/markets/#brxe-alenfn",
  "Senior Living": "/markets/#brxe-alenfn",
  Office: "/markets/#brxe-knjvop",
  "Data Center": "/markets/#brxe-criqnj",
  Government: "/markets/#brxe-dnqslz",
};
export const LINK_FIXES = [
  // "Services" slider (home, markets)
  ...Object.entries({
    ".brxe-deyiom": "Commercial Electrical",
    ".brxe-cjlxwn": "Fire Alarm Systems",
    ".brxe-ftiukl": "Low Voltage",
    ".brxe-kkfqnv": "Maintenance & Service",
    ".brxe-sujuxp": "Specialty Services",
  }).map(([selector, name]) => ({ selector, href: SERVICE_ANCHORS[name], label: `Learn more about ${name}` })),
  // "Who we serve" slider (home, services)
  ...Object.entries({
    ".brxe-wgdhmf": "Shopping Centers",
    ".brxe-pgjpyf": "Hotels",
    ".brxe-jgwuke": "Multi-Family",
    ".brxe-wytffm": "Medical",
    ".brxe-nspsov": "Senior Living",
    ".brxe-rhnlcw": "Office",
    ".brxe-ydvhzh": "Data Center",
    ".brxe-uskikx": "Government",
  }).map(([selector, name]) => ({ selector, href: MARKET_ANCHORS[name], label: `Learn more about ${name} electrical work` })),
  // "Why M&S is Different" icon links (no visible text)
  { selector: "#brxe-vbqaxu", href: SERVICE_ANCHORS["Fire Alarm Systems"], label: "Learn about our open-platform fire alarm systems" },
  { selector: "#brxe-vmrxiz", href: SERVICE_ANCHORS["Maintenance & Service"], label: "Learn about our maintenance and service relationships" },
  // Cards on /services/ and /markets/ already are the content; their "Learn more" pointed nowhere
  { selector: "#brxe-curntg, #brxe-xjvexm, #brxe-befbhm, #brxe-amllaa, #brxe-dbfyds", remove: true },
  { selector: "#brxe-ywzmea, #brxe-kgkqoa, #brxe-clohjf, #brxe-megszs, #brxe-xuwldj, #brxe-jauyue, #brxe-coydlr", remove: true },
  // No projects page yet: "View Case Study", "View All Case Studies", "View Our Projects"
  { selector: "#brxe-guyejq, #brxe-nxlehk, #brxe-texfbo, #brxe-drbabg, #brxe-outhvu, #brxe-jooygt, #brxe-gpddob", remove: true },
];

/** Elements removed from the page. */
export const REMOVE = [
  // UX audit I3: "5.0 ⭐" badges with no source on testimonials
  ".brxe-jcnliz", ".brxe-ssvpai", ".brxe-hxfsxk",
  // Home "Recent Projects" slider: the client confirmed the case study data is not real
  "#brxe-qmmwrg",
];

/** UX audit C7: the phone number in the call-to-action block was plain text. */
export const PHONE_TEXT = { selector: ".brxe-sehvkq", href: "tel:+18164275913" };

/**
 * UX audit I1: quote form. Visible <label for> above every field, autocomplete, an optional
 * Company field and all the property types listed in "Who we serve".
 */
export const FORM = {
  autocomplete: { Name: "name", Email: "email", Phone: "tel", Company: "organization" },
  required: ["Name", "Email"],
  propertyTypes: ["Shopping Center", "Hotel", "Multi-Family", "Medical", "Senior Living", "Office", "Data Center", "Government", "Other"],
  addCompanyAfter: "Name",
  // UX audit I1: next step after sending (response time confirmed by the client)
  note: "We'll get back to you within 24 hours.",
};

export const ATTRIBUTE_FIXES = [
  // Header phone link dialed a different number than the one displayed (816-427-5913)
  { selector: 'a[href="tel:+18165998562"]', attr: "href", value: "tel:+18164275913" },
  // Footer map link: directions from an unrelated origin, with the wrong ZIP (64014)
  {
    selector: 'a[href^="https://www.google.com/maps/dir/"]',
    attr: "href",
    value: "https://www.google.com/maps/search/?api=1&query=3026+SW+East+US+40+Hwy%2C+Blue+Springs%2C+MO+64015",
  },
  // Logo alt was the WordPress install name
  { selector: "img.bricks-site-logo", attr: "alt", value: "M&S Electric" },
  // Client-confirmed email
  { selector: 'a[href="mailto:service@mandselectric.net"]', attr: "href", value: "mailto:services@mandselectric.net" },
];

/** Elements inserted after an existing one (selector -> HTML). */
export const INSERT_AFTER = [
  // Trust signals in the footer (SEO guide 3.5.1 / UX audit I2), confirmed by the client
  {
    selector: "#brxe-iebhrk",
    html: `<div class="brxe-text-basic paragraph paragraph-light seo-credentials">Kansas City, MO Electrical Contractor Class I License #954634 · 2026 ABC Heart of America STEP Platinum Safety Award</div>`,
  },
  // Market/service cards link to the matching case study (case study research: two-way internal links)
  {
    selector: "#brxe-twluvl",
    html: `<a class="seo-case-link" href="/case-studies/kmg-hotels-hotel-development/">Case study: KMG Hotels</a>`,
  },
  {
    selector: "#brxe-iscfve",
    html: `<a class="seo-case-link" href="/case-studies/construction-brokers-elevator-electrical/">Case study: Construction Brokers Inc.</a>`,
  },
];

/**
 * Alt text for content photos that had alt="" in WordPress (SEO guide 1.8.2), keyed by a piece of the
 * file name. Describes only what is visible (no city or project we can't confirm). The sample client
 * logos (logo-*.png) stay decorative until the real ones arrive.
 */
export const ALT_TEXT = {
  // Team (names from the text next to each photo)
  "Shawn-Ryan": "Shawn Ryan, Owner and Director of Operations",
  "BenRyan": "Ben Ryan, Owner and Director of Estimating",
  "Erica-Caples": "Erica Caples, Financial Controller",
  "Shawn-Cline": "Shawn Cline, Service Manager",
  "NateHardesty": "Nate Hardesty, Project Estimator",
  "AdamRohner": "Adam Rohner, Senior Fire Alarm Project Manager",
  "RobbiCauthen": "Robbi Cauthen, Assistant Project Manager",
  // Our Story timeline
  "mands-1": "Four men in safety vests reviewing plans on a job site",
  "mands-2": "Woman reviewing printed plans at a kitchen table at night",
  "mands-3": "Electricians working on electrical panels in a building under construction",
  "mands-4": "Two men shaking hands over a barbecue lunch",
  "mands-5": "Contractor in a hard hat and safety vest holding plans on a construction site",
  "mands-6": "Man in a work truck talking on the phone",
  // Services
  "commercial-electrical": "Electrician in a hard hat working from a ladder",
  "IMG_5724": "Fire alarm control panel and fire alarm documents box mounted on a wall",
  "6A8A6961-1": "Finished office with a pendant light over a round meeting table",
  "6A8A6992": "M&S Electric electrician wiring a commercial electrical panel",
  "elevators-2": "Elevator machine room with motor, controllers and electrical disconnects",
  // Markets and testimonials
  "54th-street-outside": "Brick retail building with a restaurant storefront",
  "hotels-2": "Element by Westin hotel exterior with lit façade at dusk",
  "hotels-1024": "Hilton Garden Inn exterior and porte-cochère at night",
  "multi-family": "Four-story multi-family apartment building",
  "medical-1024": "Medical exam room with exam table and equipment",
  "6A8A7024": "Open office with workstations and suspended acoustic lighting panels",
  "6A8A6912-Edit": "Ceiling with recessed lights around a circular decorative fixture",
  "Clay-County-Sheriff": "Clay County Sheriff's Department lobby and reception desk",
  "elegant-highrise-building": "Modern high-rise office building",
  // Illustrations on the About page
  "tight-headshot-portrait-of-an-electrician": "Portrait of an electrician",
  "portrait-of-an-electrician-at-work": "Electrician at work",
  "electrician-talking-on-thei": "Electrician talking on the phone",
};

/** Menu items added to the header and footer menus (cloned from the item named in `after`). */
export const MENU_ADD = [{ after: "Markets", label: "Case Studies", href: "/case-studies/" }];

/** Pages with a visible breadcrumb above the hero title (and BreadcrumbList JSON-LD). */
export const BREADCRUMB_ROUTES = ["/about/", "/services/", "/markets/", "/contact/"];
