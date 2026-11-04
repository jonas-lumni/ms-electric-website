import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata, type Route } from "@/lib/seo";
import PageSchema from "@/components/PageSchema";
import Breadcrumbs from "@/components/Breadcrumbs";
import { CaseStudyCard, InviteToBid } from "@/components/CaseStudyParts";
import { CASE_STUDIES, caseStudyRoute, getCaseStudy, photoSrc, photoSrcSet, type Section } from "@/lib/case-studies";
import "@/styles/pages/contact.css";
import "@/styles/case-studies.css";

/*
 * Case study template: client first, fact sheet, results in numbers, challenge → approach →
 * results, client quote, team, contextual call to action, related work and dates.
 * Empty fields are simply not rendered (no "N/A").
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return CASE_STUDIES.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cover = getCaseStudy(slug)?.cover;
  // Share image: the cover cropped to 1200x630 (`<base>-share.jpg`), when there is one
  return pageMetadata(caseStudyRoute(slug) as Route, cover && { url: `${cover.base}-share.jpg`, alt: cover.alt });
}

const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

function Body({ section }: { section: Section }) {
  if (section.kind === "text") {
    return section.paragraphs.map((p, i) => (
      <p key={i}>
        {p.lead && <strong>{p.lead} </strong>}
        {p.text}
      </p>
    ));
  }
  if (section.kind === "list") {
    return (
      <ul className="cs-list">
        {section.items.map((p, i) => (
          <li key={i}>
            {p.lead && <strong>{p.lead} </strong>}
            {p.text}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <>
      {section.intro && <p>{section.intro}</p>}
      <ol className="cs-steps">
        {section.items.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>
      {section.outro && <p>{section.outro}</p>}
    </>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  const route = caseStudyRoute(study.slug) as Route;
  const related = CASE_STUDIES.filter((c) => c.slug !== study.slug).slice(0, 3);

  return (
    <>
      <main id="brx-content" className="cs-page">
        <section className={study.cover ? "cs-hero cs-hero--photo" : "cs-hero"}>
          {study.cover && (
            // Largest image on the page (LCP): eager, high priority, darkened for the white text
            <img
              className="cs-hero__photo"
              src={photoSrc(study.cover, 1280)}
              srcSet={photoSrcSet(study.cover)}
              sizes="100vw"
              alt={study.cover.alt}
              width={2048}
              height={1367}
              fetchPriority="high"
            />
          )}
          <div className="cs-wrap">
            <Breadcrumbs route={route} />
            <p className="cs-eyebrow">{study.client} × M&amp;S Electric</p>
            <h1>{study.title}</h1>
            <p className="cs-hero__lead">{study.subtitle}</p>
            <a className="cs-button cs-button-ghost-light cs-button-small" href="/contact/">
              Invite us to bid
            </a>
          </div>
        </section>

        <div className="cs-wrap cs-layout">
          <aside className="cs-facts" aria-labelledby="cs-facts-title">
            <h2 id="cs-facts-title">At a glance</h2>
            <dl>
              {study.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
              <div>
                <dt>Services</dt>
                <dd>
                  {study.services.map((s, i) => (
                    <span key={s.name}>
                      {i > 0 && ", "}
                      <a href={s.href}>{s.name}</a>
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
          </aside>

          <article className="cs-article">
            <ul className="cs-stats" aria-label="Results in numbers">
              {study.stats.map((s) => (
                <li key={s.label}>
                  <span className="cs-stats__value">{s.value}</span>
                  <span className="cs-stats__label">{s.label}</span>
                </li>
              ))}
            </ul>

            {study.sections.map((section) => (
              <section key={section.heading} className="cs-block">
                <h2>{section.heading}</h2>
                <Body section={section} />
              </section>
            ))}

            {study.gallery && study.gallery.length > 0 && (
              <section className="cs-block">
                <h2>Project photos</h2>
                <ul className="cs-gallery">
                  {study.gallery.map((p) => (
                    <li key={p.base}>
                      <figure>
                        <a href={photoSrc(p, 2048)} aria-label={`Open a larger photo: ${p.caption}`}>
                          <img
                            src={photoSrc(p, 768)}
                            srcSet={photoSrcSet(p)}
                            sizes="(max-width: 767px) 100vw, 360px"
                            alt={p.alt}
                            width={768}
                            height={513}
                            loading="lazy"
                          />
                        </a>
                        <figcaption>{p.caption}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <figure className="cs-quote cs-quote--large">
              <blockquote>
                <p>&ldquo;{study.quote.text}&rdquo;</p>
              </blockquote>
              <figcaption>
                <strong>{study.quote.name}</strong>
                <br />
                {study.quote.role}, {study.quote.company}
              </figcaption>
            </figure>

            <section className="cs-block">
              <h2>The M&amp;S team</h2>
              <ul className="cs-team">
                {study.team.map((t) => (
                  <li key={t.name}>
                    {t.photo && <img src={t.photo} alt={t.name} width={80} height={80} loading="lazy" />}
                    <div>
                      <p className="cs-team__name">{t.name}</p>
                      <p className="cs-team__role">{t.role}</p>
                      {t.note && <p className="cs-team__note">{t.note}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <p className="cs-dates">
              {study.published && <>Published {formatDate(study.published)} · </>}Updated {study.updatedLabel}
            </p>
          </article>
        </div>

        <div className="cs-wrap cs-section">
          <InviteToBid topic={study.ctaTopic} />
        </div>

        <section className="cs-section cs-section--tint">
          <div className="cs-wrap">
            <h2 className="cs-h2">More case studies</h2>
            <div className="cs-grid">
              {related.map((c) => (
                <CaseStudyCard key={c.slug} study={c} />
              ))}
            </div>
            <p className="cs-more-links">
              <a href="/case-studies/">All case studies</a>
              {study.services.map((s) => (
                <a key={s.name} href={s.href}>
                  {s.name} services
                </a>
              ))}
              {study.marketLink && <a href={study.marketLink.href}>{study.marketLink.label}</a>}
            </p>
          </div>
        </section>
      </main>
      <PageSchema route={route} />
    </>
  );
}
