import Link from "next/link";
import type { Location, Service } from "@/lib/data";

type Props = { service: Service; locations: Location[]; title: string };

export function LocationLinks({ service, locations, title }: Props) {
  if (locations.length === 0) return null;

  return (
    <section className="section container" aria-labelledby="locations-heading">
      <h2 id="locations-heading">{title}</h2>
      <ul className="pill-list">
        {locations.map((l) => (
          <li key={l.slug}>
            <Link href={`/services/${service.slug}/${l.slug}`} className="pill">
              {service.name} in {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
