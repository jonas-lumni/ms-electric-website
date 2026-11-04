# M&S Electric — Next.js site

Commercial electrical contractor in Kansas City. All site copy is US English; team docs are in Portuguese.
Read `README.md` for the structure and `docs/SEO-relatorio.md` for SEO status and pending client data.

## Rule: SEO/AIO check after EVERY change

Every change to the site (copy, pages, components, styles, images, routes, config) must pass the
SEO/AIO check from the "Guia de SEO e AIO" before it is considered done:

1. `npm run build`, then serve it (`npm start`, or `node node_modules/next/dist/bin/next start -p 3005`).
2. `npm run seo:check` (set `BASE=http://localhost:3005` if not on port 3000). For a new page not yet
   in the sitemap: `npm run seo:check -- new-page/`.
3. Fix every ✗ failure. Report the ⚠ warnings that the change introduced.
4. Also review by hand what the script can't judge:
   - New/changed page: unique title ≤ 70 and description ≤ 155 in `src/lib/seo.ts`; added to
     `SITEMAP_ROUTES` if indexable; JSON-LD in `src/components/PageSchema.tsx` only for visible content.
   - Removed/renamed URL: 301 in `next.config.mjs` (one hop, relevant target, never everything to home).
   - Business data (NAP, hours, licenses, numbers, clients, reviews): never invent. Use
     `[CONFIRMAR COM CLIENTE]` in docs only, never on the published site, and list it in `docs/SEO-relatorio.md`.
   - Meta tags: title/description/keywords/author + Open Graph (approved exception; set in `pageMetadata`).
   - No Review/AggregateRating markup; one H1 per page; descriptive alt on content images; first-section
     image never lazy.
   - Visual changes to cloned pages: compare with the original layout on desktop, tablet and phone.
   - UX audit targets (docs/UX-relatorio.md): no `href="#"`/`?page_id=` links; descriptive link text
     (aria-label on "Learn more"); every phone as `tel:+18164275913`; form fields with visible `<label for>`
     and autocomplete; touch targets ≥ 24px (44px for main buttons); contrast ≥ 4.5:1; visible focus;
     auto-moving content with a pause control. The script checks the first four.
5. Update `docs/SEO-relatorio.md` / `docs/UX-relatorio.md` (changelog "antes → depois" for any visible
   copy change, pending items).

## Security (docs/SEGURANCA.md)

- `npm run seo:check` also checks the security headers, CSP nonce, cookies, image optimizer and source maps.
- New dependency: check maintainers/downloads first; keep `npm audit --omit=dev` at 0 high/critical.
- New third-party script, iframe or API (GHL, GTM, Turnstile…): add its exact domains to `src/proxy.ts`,
  test with `CSP_REPORT_ONLY=1`, and update the Privacy and Cookies policies.
- Never put secrets in `NEXT_PUBLIC_*`; server-only modules start with `import 'server-only'`.
- Future forms: Zod validation + Turnstile + rate limit + Origin check inside the Server Action/Route Handler.

## Notes

- Privacy/Cookies policy pages are hand-written (`handWritten` in the generator).
- Generated files (`src/app/**/page.tsx`, `Header.tsx`, `Footer.tsx`, `src/styles/pages/*`) come from
  `scripts/clone-wordpress.mjs` + `scripts/seo-adjustments.mjs`. Edit those scripts for changes that must
  survive a re-run of `npm run clone`, or stop using the generator for a page once it's hand-edited.
- The folder name contains `&`: npm scripts call `node node_modules/next/dist/bin/next` directly.
