import Link from "next/link";
import type { Location, Service } from "@/lib/data";

type Props = { services: Service[]; location?: Location; title?: string };

export function RelatedServices({ services, location, title }: Props) {
  if (services.length === 0) return null;

  return (
    <section className="section section-alt" aria-labelledby="related-heading">
      <div className="container">
        <h2 id="related-heading">
          {title ?? `Related services${location ? ` in ${location.name}` : ""}`}
        </h2>
        <div className="card-grid">
          {services.map((s) => {
            const local = location && s.locations.includes(location.slug);
            const href = local ? `/services/${s.slug}/${location.slug}` : `/services/${s.slug}`;
            return (
              <article key={s.slug} className="card">
                <h3>
                  <Link href={href}>{local ? `${s.name} in ${location.name}` : s.name}</Link>
                </h3>
                <p>{s.summary}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
