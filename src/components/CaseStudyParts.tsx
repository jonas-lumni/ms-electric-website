import { caseStudyRoute, photoSrc, photoSrcSet, type CaseStudy } from "@/lib/case-studies";

/** Case study card: client first, then the project, tags and one result sentence (Faith Technologies style). */
export function CaseStudyCard({ study, headingLevel = 3 }: { study: CaseStudy; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const href = caseStudyRoute(study.slug);
  return (
    <article className="cs-card">
      {study.cover && (
        <img
          className="cs-card__photo"
          src={photoSrc(study.cover, 768)}
          srcSet={photoSrcSet(study.cover)}
          sizes="(max-width: 767px) 100vw, 540px"
          alt={study.cover.alt}
          width={768}
          height={513}
          loading="lazy"
        />
      )}
      <p className="cs-card__client">{study.client}</p>
      <Heading className="cs-card__title">
        <a href={href}>{study.title}</a>
      </Heading>
      <ul className="cs-tags" aria-label="Market and services">
        <li>{study.market}</li>
        {study.services.map((s) => (
          <li key={s.name}>{s.name}</li>
        ))}
      </ul>
      <p className="cs-card__result">{study.cardResult}</p>
      <a className="cs-card__link" href={href} aria-label={`Read the ${study.client} case study`}>
        Read the case study
      </a>
    </article>
  );
}

/**
 * Contextual call to action with a named contact (Skanska style). Ben Ryan leads estimating;
 * the number and email are the company's main ones (no direct line was provided).
 */
export function InviteToBid({ topic }: { topic?: string }) {
  return (
    <section className="cs-invite" aria-labelledby="cs-invite-title">
      <div className="cs-invite__text">
        <h2 id="cs-invite-title">{topic ? `Planning ${topic}? Invite M&S Electric to bid.` : "Have a project out to bid?"}</h2>
        <p>
          Tell us about your project and we&apos;ll get back to you within 24 hours. Prefer to talk it through? Call us.
        </p>
        <div className="cs-buttons">
          <a className="cs-button cs-button-primary" href="/contact/">
            Invite us to bid
          </a>
          <a className="cs-button cs-button-ghost" href="tel:+18164275913">
            Call (816) 427-5913
          </a>
        </div>
      </div>
      <div className="cs-contact">
        <img src="/wp-content/uploads/2026/04/BenRyan-300x300.webp" alt="Ben Ryan" width={96} height={96} loading="lazy" />
        <div>
          <p className="cs-contact__name">Ben Ryan</p>
          <p className="cs-contact__role">Owner and Director of Estimating</p>
          <p>
            <a href="tel:+18164275913">(816) 427-5913</a>
            <br />
            <a href="mailto:services@mandselectric.net">services@mandselectric.net</a>
          </p>
        </div>
      </div>
    </section>
  );
}
