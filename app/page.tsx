import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/components/Hero";
import { CtaSection } from "@/components/CtaSection";
import { getAllServices } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";

const homeTitle = `${siteConfig.name} | Web Development, SEO & Digital Marketing`;

export const metadata: Metadata = {
  ...buildMetadata({ title: homeTitle, description: siteConfig.description, path: "/" }),
  title: { absolute: homeTitle },
};

export default function HomePage() {
  const services = getAllServices();

  return (
    <>
      <Hero
        eyebrow="Digital agency"
        title="Websites and marketing that grow your business"
        lead="We design, build and promote fast, search-friendly websites for businesses across India."
      />

      <section className="section container" aria-labelledby="services-heading">
        <h2 id="services-heading">Our services</h2>
        <div className="card-grid">
          {services.map((s) => (
            <article key={s.slug} className="card">
              <h3>
                <Link href={`/services/${s.slug}`}>{s.name}</Link>
              </h3>
              <p>{s.summary}</p>
            </article>
          ))}
        </div>
        <p>
          <Link href="/services">Browse all services and locations →</Link>
        </p>
      </section>

      <CtaSection
        heading="Tell us about your project"
        text="Share a few details and we'll reply within one business day with next steps and a ballpark estimate."
        services={services.map((s) => s.name)}
      />
    </>
  );
}
