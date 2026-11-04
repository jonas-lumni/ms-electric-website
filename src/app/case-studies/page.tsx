import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import PageSchema from "@/components/PageSchema";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CaseStudyCard, InviteToBid } from "@/components/CaseStudyParts";
import { CASE_STUDIES, PROOF, caseStudyRoute, photoSrc, photoSrcSet } from "@/lib/case-studies";
// Header/footer element styles live in the Bricks page CSS
import "@/styles/pages/contact.css";
import "@/styles/case-studies.css";

/*
 * Case studies hub (structure from docs: "Estudos de caso... pesquisa de concorrentes").
 * With only two cases there are no filters yet: the research advises against filters that
 * return almost nothing. Add market/service chips when there are ~6 or more cases.
 */
export const metadata: Metadata = pageMetadata("/case-studies/");

const featured = CASE_STUDIES[0];

export default function CaseStudiesPage() {
  return (
    <>
      <main id="brx-content" className="cs-page">
        <section className="cs-hero">
          <div className="cs-wrap">
            <Breadcrumbs route="/case-studies/" />
            <p className="cs-eyebrow">Case Studies</p>
            <h1>Commercial electrical work Kansas City builders trust</h1>
            <p className="cs-hero__lead">
              Long-term partnerships with general contractors and owners across Missouri and Kansas, told in their own words.
            </p>
            <div className="cs-buttons">
              <a className="cs-button cs-button-primary" href="/contact/">
                Invite us to bid
              </a>
              <a className="cs-button cs-button-ghost-light" href="tel:+18164275913">
                Request service
              </a>
            </div>
          </div>
        </section>

        <section className="cs-proof" aria-label="Why M&S Electric">
          <div className="cs-wrap cs-proof__grid">
            {PROOF.map((p) => (
              <div key={p.value} className="cs-proof__item">
                <p className="cs-proof__value">{p.value}</p>
                <p className="cs-proof__label">{p.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cs-section">
          <div className="cs-wrap">
            <p className="cs-eyebrow cs-eyebrow--dark">Featured case study</p>
            <div className="cs-featured">
              <div>
                <p className="cs-card__client">{featured.client}</p>
                <h2 className="cs-featured__title">
                  <a href={caseStudyRoute(featured.slug)}>{featured.title}</a>
                </h2>
                <p className="cs-featured__subtitle">{featured.subtitle}</p>
                <p className="cs-card__result">{featured.cardResult}</p>
                <a className="cs-button cs-button-primary" href={caseStudyRoute(featured.slug)} aria-label={`Read the ${featured.client} case study`}>
                  Read the case study
                </a>
              </div>
              {featured.cover ? (
                <img
                  className="cs-featured__photo"
                  src={photoSrc(featured.cover, 1280)}
                  srcSet={photoSrcSet(featured.cover)}
                  sizes="(max-width: 991px) 100vw, 480px"
                  alt={featured.cover.alt}
                  width={1280}
                  height={855}
                  loading="lazy"
                />
              ) : (
                <figure className="cs-quote cs-quote--compact">
                  <blockquote>
                    <p>&ldquo;{featured.quote.text}&rdquo;</p>
                  </blockquote>
                  <figcaption>
                    {featured.quote.name}, {featured.quote.role}, {featured.quote.company}
                  </figcaption>
                </figure>
              )}
            </div>
          </div>
        </section>

        <section className="cs-section cs-section--tint">
          <div className="cs-wrap">
            <h2 className="cs-h2">All case studies</h2>
            <div className="cs-grid">
              {CASE_STUDIES.map((c) => (
                <CaseStudyCard key={c.slug} study={c} />
              ))}
            </div>
          </div>
        </section>

        <section className="cs-section">
          <div className="cs-wrap">
            <h2 className="cs-h2">What our partners say</h2>
            <div className="cs-grid">
              {CASE_STUDIES.map((c) => (
                <figure key={c.slug} className="cs-quote">
                  <blockquote>
                    <p>&ldquo;{c.quote.text}&rdquo;</p>
                  </blockquote>
                  <figcaption>
                    <strong>{c.quote.name}</strong>
                    <br />
                    {c.quote.role}, {c.quote.company}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="cs-section cs-section--tint">
          <div className="cs-wrap">
            <h2 className="cs-h2">Why general contractors prequalify M&amp;S</h2>
            <ul className="cs-why">
              <li>
                <h3>Safety you can verify</h3>
                <p>2026 ABC Heart of America STEP Platinum safety award.</p>
              </li>
              <li>
                <h3>Licensed in Kansas City</h3>
                <p>Kansas City, MO Electrical Contractor Class I License #954634.</p>
              </li>
              <li>
                <h3>Our own crews</h3>
                <p>Everyone on an M&amp;S job site works for M&amp;S. When you call about a problem, you&apos;re talking to someone who knows the building.</p>
              </li>
              <li>
                <h3>There after the build</h3>
                <p>24/7 emergency service for the buildings we work in.</p>
              </li>
            </ul>
            <a
              className="cs-button cs-button-primary"
              href="mailto:services@mandselectric.net?subject=Prequalification%20packet%20request"
            >
              Request our prequalification packet
            </a>
          </div>
        </section>

        <div className="cs-wrap cs-section">
          <InviteToBid />
        </div>
      </main>
      <PageSchema route="/case-studies/" />
    </>
  );
}
