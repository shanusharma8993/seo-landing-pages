import type { Location, Service } from "@/lib/data";
import { formatList, locationLabel } from "@/lib/data";

type Props = { service: Service; location?: Location };

export function ServiceContent({ service, location }: Props) {
  const where = location ? ` in ${location.name}` : "";

  return (
    <>
      <section className="section container prose">
        <h2>
          About our {service.name} services{where}
        </h2>
        {location && <p>{location.intro}</p>}
        {service.description.map((p) => (
          <p key={p.slice(0, 32)}>{p}</p>
        ))}
        {location && (
          <p>
            We regularly partner with{" "}
            {formatList(location.industries.map((i) => i.toLowerCase()))} organisations across{" "}
            {locationLabel(location)}.
          </p>
        )}
        <p className="price">
          Projects start from <strong>${service.startingPrice.toLocaleString("en-US")}</strong>.
        </p>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Benefits of working with us{where}</h2>
          <div className="card-grid">
            {service.benefits.map((b) => (
              <article key={b.title} className="card">
                <h3>{b.title}</h3>
                <p>{b.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section container">
        <h2>How we work</h2>
        <ol className="steps">
          {service.process.map((step) => (
            <li key={step}>
              <h3>{step}</h3>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
