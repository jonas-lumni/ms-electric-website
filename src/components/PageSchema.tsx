/**
 * JSON-LD structured data (guide section 4), rendered on the server.
 * Home and contact carry the full Electrician entity; every other page references it by @id.
 * No Review/AggregateRating markup: Google treats a business's own reviews as self-serving.
 */
import { SITE, absoluteUrl } from "@/lib/site";
import { PAGE_SEO, type Route } from "@/lib/seo";
import { BREADCRUMBS } from "@/lib/breadcrumbs";
import { CASE_STUDIES, caseStudyRoute, photoSrc } from "@/lib/case-studies";

const BUSINESS_ID = absoluteUrl("/#business");
const WEBSITE_ID = absoluteUrl("/#website");

const business = {
  "@type": "Electrician",
  "@id": BUSINESS_ID,
  name: SITE.name,
  url: absoluteUrl("/"),
  logo: absoluteUrl(SITE.logo),
  image: absoluteUrl(SITE.logo),
  description: SITE.description,
  telephone: SITE.telephone,
  email: SITE.email,
  address: { "@type": "PostalAddress", ...SITE.address },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SITE.openingHours.days,
      opens: SITE.openingHours.opens,
      closes: SITE.openingHours.closes,
    },
  ],
  areaServed: { "@type": "AdministrativeArea", name: SITE.areaServed },
  founder: SITE.founders.map((f) => ({ "@type": "Person", ...f })),
  foundingDate: SITE.foundingDate,
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "license",
    name: SITE.license.name,
    identifier: SITE.license.identifier,
  },
  award: SITE.award,
  sameAs: SITE.sameAs,
};

const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: absoluteUrl("/"),
  name: SITE.name,
  publisher: { "@id": BUSINESS_ID },
};

// Services as named and described on /services/
const SERVICES = [
  {
    name: "Commercial Electrical",
    description:
      "From ground-up builds to tenant finishes, we show up, stay in communication, and keep the job moving. GCs keep coming back because we make electrical the easy part.",
  },
  {
    name: "Fire Alarm Systems",
    description:
      "Many fire alarm contractors lock you in with proprietary equipment. M&S installs open-platform systems, so the owner decides who services the building, not us.",
  },
  {
    name: "Low Voltage",
    description:
      "Low voltage is often the last thing holding up a certificate of occupancy. We hold it to the same standard as every other scope: coordinated and done on time.",
  },
  {
    name: "Maintenance & Service",
    description:
      "You shouldn't have to explain your building's history to a stranger. M&S builds long-term relationships, so when you call, we already know your building.",
  },
  {
    name: "Specialty Services",
    description:
      "Data centers, elevators, specialty lighting: some scopes need more than a good electrician. M&S brings the expertise other contractors hand off.",
  },
];

function graphFor(route: Route) {
  const url = absoluteUrl(route);
  const webPage = {
    "@type":
      route === "/contact/" ? "ContactPage" : route === "/about/" ? "AboutPage" : route === "/case-studies/" ? "CollectionPage" : "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: PAGE_SEO[route].title,
    description: PAGE_SEO[route].description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
    inLanguage: "en-US",
  };

  const graph: object[] = [webPage];
  // SEO guide 4.4: same trail as the visible <Breadcrumbs />
  const trail = BREADCRUMBS[route];
  if (trail) {
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: trail.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(item.href ? { item: absoluteUrl(item.href) } : {}),
      })),
    });
  }
  if (route === "/") graph.push(business, website);
  if (route === "/contact/") graph.push(business);
  if (route === "/services/") {
    graph.push(
      ...SERVICES.map((s, i) => ({
        "@type": "Service",
        "@id": `${url}#service-${i + 1}`,
        name: s.name,
        serviceType: s.name,
        description: s.description,
        provider: { "@id": BUSINESS_ID },
        areaServed: { "@type": "AdministrativeArea", name: SITE.areaServed },
        url,
      })),
    );
  }
  // Case studies: the hub lists them; each case is an Article about the client (no Review markup)
  if (route === "/case-studies/") {
    graph.push({
      "@type": "ItemList",
      itemListElement: CASE_STUDIES.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(caseStudyRoute(c.slug)),
        name: `${c.client}: ${c.title}`,
      })),
    });
  }
  const study = CASE_STUDIES.find((c) => caseStudyRoute(c.slug) === route);
  if (study) {
    graph.push({
      "@type": "Article",
      "@id": `${url}#article`,
      headline: study.title,
      description: PAGE_SEO[route].description,
      ...(study.published ? { datePublished: study.published } : {}),
      dateModified: study.updated,
      author: { "@id": BUSINESS_ID },
      publisher: { "@id": BUSINESS_ID },
      mainEntityOfPage: { "@id": `${url}#webpage` },
      ...(study.cover ? { image: absoluteUrl(photoSrc(study.cover, 1280)) } : {}),
      about: { "@type": "Organization", name: study.client },
      inLanguage: "en-US",
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export default function PageSchema({ route }: { route: Route }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here except for "</": escape it so the script can't be closed early
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphFor(route)).replace(/</g, "\\u003c") }}
    />
  );
}
