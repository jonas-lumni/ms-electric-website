/**
 * Case studies (structure from "Estudos de caso da M&S Electric: pesquisa de concorrentes").
 *
 * Copy comes from the approved documents sent by Breandan (docs/cases-originais). Rules:
 * - Client first, then M&S Electric (Breandan).
 * - Never invent numbers, cities, photos or quotes; a field without data is omitted, not "N/A".
 * - The CBI text includes Breandan's 22/10 changes (no mention of the previous contractor's name)
 *   and no "founded in 2014" claims (28/10): M&S Electric was founded in 2011.
 */

export type Paragraph = { lead?: string; text: string };
export type Section =
  | { heading: string; kind: "text"; paragraphs: Paragraph[] }
  | { heading: string; kind: "list"; items: Paragraph[] }
  | { heading: string; kind: "steps"; intro?: string; items: string[]; outro?: string };

/**
 * A project photo, stored as responsive WebP files `<base>-768.webp`, `-1280.webp` and `-2048.webp`
 * (all 3:2). A cover also needs `<base>-share.jpg` (1200x630) for Open Graph.
 * Alt text describes what is visible; captions don't claim facts we don't have (city, scope).
 */
export type Photo = { base: string; alt: string; caption: string };

export const PHOTO_WIDTHS = [768, 1280, 2048] as const;
export const photoSrc = (p: Photo, w: (typeof PHOTO_WIDTHS)[number] = 1280) => `${p.base}-${w}.webp`;
export const photoSrcSet = (p: Photo) => PHOTO_WIDTHS.map((w) => `${photoSrc(p, w)} ${w}w`).join(", ");

export type CaseStudy = {
  slug: string;
  /** Cover photo (hero, cards, share image) and gallery; both optional */
  cover?: Photo;
  gallery?: Photo[];
  client: string;
  clientShort: string;
  market: string;
  services: { name: string; href: string }[];
  /** Approved headline and subtitle */
  title: string;
  subtitle: string;
  /** One result sentence for the cards (taken from the approved copy) */
  cardResult: string;
  facts: { label: string; value: string }[];
  stats: { value: string; label: string }[];
  sections: Section[];
  quote: { text: string; name: string; role: string; company: string };
  team: { name: string; role: string; photo?: string; note?: string }[];
  /** Link to the matching market on /markets/, when there is one */
  marketLink?: { label: string; href: string };
  ctaTopic: string;
  published?: string; // ISO date
  updated: string; // ISO date
  updatedLabel: string;
};

const KMG = "/images/case-studies/kmg-hotels";
const KMG_PHOTOS: Photo[] = [
  {
    base: `${KMG}/mcian-exterior-night`,
    alt: "Aloft Hotels sign and illuminated entrance canopy at dusk",
    caption: "Aloft Hotels: entrance canopy and signage at night",
  },
  {
    base: `${KMG}/mkcargi-exterior-night`,
    alt: "Hilton Garden Inn exterior and lit porte-cochère at sunset",
    caption: "Hilton Garden Inn: exterior and porte-cochère",
  },
  {
    base: `${KMG}/mcien-exterior-night`,
    alt: "Element by Westin hotel exterior with lit façade at dusk",
    caption: "Element by Westin: exterior at dusk",
  },
  {
    base: `${KMG}/mkcargi-front-desk`,
    alt: "Hotel front desk and grab-and-go shop with recessed and pendant lighting",
    caption: "Hilton Garden Inn: front desk and shop",
  },
  {
    base: `${KMG}/mcian-conference-room`,
    alt: "Hotel conference room with LED cove lighting, chandeliers and two projection screens",
    caption: "Aloft: conference room",
  },
  {
    base: `${KMG}/holiday-inn-express-breakfast-area`,
    alt: "Holiday Inn Express breakfast area with a high-top table, seating and recessed lighting",
    caption: "Holiday Inn Express: breakfast area",
  },
];

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "kmg-hotels-hotel-development",
    // Photos sent by Jonas on 28/10/2026 as KMG Hotels properties (extracted from the SVG files)
    cover: KMG_PHOTOS[0],
    gallery: KMG_PHOTOS,
    client: "KMG Hotels",
    clientShort: "KMG Hotels",
    market: "Hospitality",
    services: [
      { name: "Commercial Electrical", href: "/services/#brxe-yyqytm" },
      { name: "Low Voltage", href: "/services/#brxe-xcpyyl" },
    ],
    title: "Protecting the Budget from the First Drawing to the Final Inspection",
    subtitle: "How M&S Electric helps KMG Hotels build to its standard and to its budget",
    cardResult: "About 12 years building hotels to KMG's standard and budget, with change orders worked down, not just priced.",
    facts: [
      { label: "Client", value: "KMG Hotels, a hotel developer that builds to own and operate" },
      { label: "Client contact", value: "Sanjay Koshiya, President, KMG Hotels" },
      { label: "Electrical partner", value: "M&S Electric" },
      { label: "General contractor partner", value: "Level Builders" },
      { label: "Market", value: "Hospitality" },
      { label: "Partnership", value: "About 12 years" },
    ],
    stats: [
      { value: "12 yrs", label: "Partnership with KMG Hotels (about 12 years)" },
      { value: "1,000%", label: "Sanjay Koshiya, asked whether Ben has delivered" },
    ],
    sections: [
      {
        heading: "The Challenge",
        kind: "text",
        paragraphs: [
          {
            text: "KMG Hotels builds hotels to own and operate them, so every dollar saved on one project goes toward the next. “We would definitely love to save the money,” says Sanjay Koshiya, President of KMG Hotels, “because if we save money, that will go into the next project.”",
          },
          {
            text: "That makes the budget critical to how KMG grows. It also makes quality non-negotiable, because KMG lives with these buildings long after construction ends. They needed an electrical partner who could protect both.",
          },
        ],
      },
      {
        heading: "The Approach: Involved Before the First Wire Is Pulled",
        kind: "list",
        items: [
          {
            lead: "Design-stage support.",
            text: "M&S Electric doesn’t wait for finished drawings to start working. Ben Ryan’s team joins the conversation early, working alongside KMG and the design engineers so the plans reflect hotel brand guidelines, engineering requirements, and what KMG actually builds. “Ben knows what we need at the hotel,” says Sanjay. When the drawings drift from that, Ben helps bring them back.",
          },
          {
            lead: "Cost-effective solutions, not just low prices.",
            text: "M&S looks for ways to deliver a top-quality facility for less. Sanjay calls Ben “an open book” who “never hides anything.” He walks through pricing openly, and on low voltage he’ll even let KMG bring in a lower-priced vendor, then coordinate with that vendor so the systems work together, even though M&S isn’t paid for that scope.",
          },
          {
            lead: "Change orders worked down, not just priced.",
            text: "When a change order comes in, the conversation turns to solutions. “How can we fix? How can we bring it down?” Ben’s team looks for ways to offset the change or eliminate it.",
          },
          {
            lead: "Honesty about capacity.",
            text: "When KMG had several hotels under construction within the same twelve months, Ben told them up front that M&S couldn’t take one of them. He wasn’t willing to risk the project or the relationship. He told them the truth and kept offering help anyway.",
          },
        ],
      },
      {
        heading: "The Results",
        kind: "list",
        items: [
          { lead: "A budget KMG can rely on.", text: "Transparent pricing, active work on change orders, and fewer design surprises in the field." },
          { lead: "Hotels built to KMG’s standard.", text: "Issues are caught in design, when they cost the least to fix." },
          {
            lead: "Responsiveness after the build.",
            text: "“He’s on a bike, he’s on an RV, he’s on a mountain, I do get his call back.” When something urgent comes up at a property, someone is there to take care of it.",
          },
          { lead: "Peace of mind.", text: "“We are back doing our electrical, we don’t have to worry about it. He’ll handle it.”" },
          { text: "Asked whether Ben has delivered, Sanjay answered: “100%, 1,000%.”" },
        ],
      },
      {
        heading: "A Partnership That Goes Beyond the Project",
        kind: "text",
        paragraphs: [
          {
            text: "KMG’s circle of trusted partners is small on purpose. M&S Electric handles electrical and Level Builders serves as general contractor. Ben’s friendship with Jim Ecton of Level Builders is older than M&S Electric itself, so when the two teams arrive on a KMG project, they bring a history that goes well beyond any single job. “When Level is in, Ben has to be there.”",
          },
          {
            text: "Before M&S, KMG had never experienced this kind of relationship with an electrician. Another contractor was “just literally a business.” With Ben, “we have that connection.” When KMG built their own home, Ben helped there too. “He’s the gem of a person to me.”",
          },
        ],
      },
      {
        heading: "Looking Ahead",
        kind: "text",
        paragraphs: [{ text: "KMG plans to keep growing, and they plan to keep growing with M&S Electric." }],
      },
    ],
    quote: {
      text: "Work automatically happens. But it’s more of a relationship.",
      name: "Sanjay Koshiya",
      role: "President",
      company: "KMG Hotels",
    },
    team: [
      {
        name: "Ben Ryan",
        role: "Owner and Director of Estimating",
        photo: "/wp-content/uploads/2026/04/BenRyan-300x300.webp",
        note: "Leads the KMG relationship, from design-stage support to calls after the build.",
      },
    ],
    marketLink: { label: "Hotels we serve", href: "/markets/#brxe-eedyhh" },
    ctaTopic: "a hotel project",
    published: "2026-10-09",
    updated: "2026-10-12",
    updatedLabel: "October 12, 2026",
  },
  {
    slug: "construction-brokers-elevator-electrical",
    client: "Construction Brokers Inc.",
    clientShort: "CBI",
    market: "Elevator specialty work",
    services: [{ name: "Specialty Services", href: "/services/#brxe-cvwlme" }],
    title: "Since 2012: More Than a Decade of Working Side by Side",
    subtitle: "Case Study: Construction Brokers Inc. and M&S Electric",
    cardResult: "A dedicated PM and 5–6 specialist technicians, built from scratch to deliver CBI’s elevator work across Missouri and Kansas.",
    facts: [
      { label: "Client", value: "Construction Brokers Inc. (CBI)" },
      { label: "Client contact", value: "Gar Auten, Vice President of Operations" },
      { label: "Market", value: "Elevator specialty work" },
      { label: "Working together since", value: "2012" },
      { label: "M&S team", value: "Dedicated project manager + 5–6 specialist technicians" },
      { label: "Region", value: "Missouri and Kansas" },
    ],
    stats: [
      { value: "2012", label: "Working together since" },
      { value: "5–6", label: "Specialist technicians, plus a dedicated PM" },
      { value: "2", label: "Team members who have left in more than a decade" },
    ],
    sections: [
      {
        heading: "The Problem",
        kind: "steps",
        intro: "Here’s how this usually goes:",
        items: [
          "A GC takes on specialty work they’ve never done before.",
          "So they take a chance on a new subcontractor.",
          "Six months in, the team doesn’t know the work, the customer loses confidence, and the GC loses the relationship.",
        ],
        outro:
          "CBI needed an electrical partner who would learn a demanding specialty from the ground up — and deliver for their toughest customers from day one.",
      },
      {
        heading: "The Proof",
        kind: "text",
        paragraphs: [
          { text: "More than a decade of working side by side." },
          { text: "Only two people have left this team in more than a decade. That’s not a subcontractor relationship. That’s a second crew." },
        ],
      },
      {
        heading: "What Happened",
        kind: "list",
        items: [
          { lead: "Year 1 at M&S:", text: "M&S had zero elevator experience. Two technicians committed to learning a new specialty right alongside CBI." },
          {
            lead: "Built from scratch:",
            text: "Over time the team grew into a dedicated project manager and 5–6 specialist technicians who know this work inside and out.",
          },
          {
            lead: "Field behavior:",
            text: "The crew works across Missouri and Kansas, meeting the expectations of CBI’s toughest customers. They don’t just handle the electrical scope. They look out for the job.",
          },
          { lead: "Leadership:", text: "Management stays hands-on at every level, so the right people are on every job, every time." },
          { lead: "Result:", text: "CBI keeps winning work and building backlog, and M&S is the electrical partner they trust to make it happen." },
        ],
      },
      {
        heading: "Quick Facts",
        kind: "list",
        items: [
          { text: "Working together since 2012" },
          { text: "Dedicated PM + 5–6 specialist technicians" },
          { text: "Only 2 team members have left in more than a decade" },
          { text: "Trusted across Missouri and Kansas markets" },
          { text: "Highly respected across the commercial electrical industry" },
        ],
      },
    ],
    quote: {
      text: "For the past 7 years that I’ve been at CBI it has been my pleasure to work professionally with Shawn Ryan and the entire M&S team. Everyone at M&S understands our business needs and works tirelessly to meet our expectations and the expectations of our very demanding customers. Because of their hands-on approach and dedication to excellence, we are able to continue to win work and build a strong backlog. They are highly respected in our industry, and we value them as a trusted partner throughout our Missouri and Kansas markets.",
      name: "Gar Auten",
      role: "Vice President of Operations",
      company: "Construction Brokers Inc.",
    },
    team: [
      {
        name: "Shawn Ryan",
        role: "Owner and Director of Operations",
        photo: "/wp-content/uploads/2026/04/Shawn-Ryan-300x300.webp",
        note: "Has kept the CBI relationship since it began.",
      },
      { name: "Dedicated project manager + 5–6 specialist technicians", role: "M&S elevator electrical team, Missouri and Kansas" },
    ],
    ctaTopic: "specialty electrical work",
    updated: "2026-10-22",
    updatedLabel: "October 2026",
  },
];

export const caseStudyRoute = (slug: string) => `/case-studies/${slug}/` as const;
export const getCaseStudy = (slug: string) => CASE_STUDIES.find((c) => c.slug === slug);

/** Verifiable proof shown on the hub (client-confirmed facts only). */
export const PROOF = [
  { value: "Since 2011", label: "Family-owned commercial electrical contractor" },
  { value: "STEP Platinum", label: "2026 ABC Heart of America safety award" },
  { value: "Class I", label: "Kansas City, MO electrical contractor license #954634" },
  { value: "24/7", label: "Emergency service" },
];
