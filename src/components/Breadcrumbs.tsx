import { BREADCRUMBS } from "@/lib/breadcrumbs";
import type { Route } from "@/lib/seo";

/** Visible breadcrumb trail (styles in src/styles/ux.css). Same data as the BreadcrumbList JSON-LD. */
export default function Breadcrumbs({ route }: { route: Route }) {
  const trail = BREADCRUMBS[route];
  if (!trail) return null;
  return (
    <nav className="seo-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {trail.map((item) => (
          <li key={item.name}>
            {item.href ? <a href={item.href}>{item.name}</a> : <span aria-current="page">{item.name}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
