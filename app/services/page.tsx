import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { getAllServices, getServiceLocations } from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata, graph } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Services",
  description:
    "Explore our website development, SEO, e-commerce, UI/UX design and digital marketing services across Chandigarh, Mohali, Delhi, Mumbai and Bengaluru.",
  path: "/services",
});

export default function ServicesPage() {
  const services = getAllServices();
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
  ];

  return (
    <>
      <JsonLd data={graph(breadcrumbJsonLd(crumbs))} />
      <Breadcrumbs items={crumbs} />

      <section className="section container">
        <h1>Our services</h1>
        <p className="lead">Choose a service to learn more, or jump straight to your city.</p>
      </section>

      {services.map((s) => (
        <section key={s.slug} className="section container service-index">
          <h2>
            <Link href={`/services/${s.slug}`}>{s.name}</Link>
          </h2>
          <p>{s.summary}</p>
          <ul className="pill-list">
            {getServiceLocations(s).map((l) => (
              <li key={l.slug}>
                <Link href={`/services/${s.slug}/${l.slug}`} className="pill">
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
