import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaSection } from "@/components/CtaSection";
import { FaqSection } from "@/components/FaqSection";
import { Hero } from "@/components/Hero";
import { JsonLd } from "@/components/JsonLd";
import { LocationLinks } from "@/components/LocationLinks";
import { RelatedServices } from "@/components/RelatedServices";
import { ServiceContent } from "@/components/ServiceContent";
import {
  getAllServiceLocationParams,
  getAllServices,
  getLocation,
  getLocationFaqs,
  getRelatedServices,
  getServiceInLocation,
  locationLabel,
  type Location,
} from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, graph, serviceJsonLd } from "@/lib/seo";

type Params = { service: string; location: string };
type Props = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return getAllServiceLocationParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { service: serviceSlug, location: locationSlug } = await params;
  const match = getServiceInLocation(serviceSlug, locationSlug);
  if (!match) return {};
  const { service, location } = match;

  return buildMetadata({
    title: `${service.name} in ${location.name}`,
    description: `${service.name} in ${locationLabel(location)}. ${service.summary}`,
    path: `/services/${service.slug}/${location.slug}`,
  });
}

export default async function ServiceLocationPage({ params }: Props) {
  const { service: serviceSlug, location: locationSlug } = await params;
  const match = getServiceInLocation(serviceSlug, locationSlug);
  if (!match) notFound();
  const { service, location } = match;

  const path = `/services/${service.slug}/${location.slug}`;
  const faqs = getLocationFaqs(service, location);
  const nearby = location.nearby
    .filter((slug) => service.locations.includes(slug))
    .map(getLocation)
    .filter((l): l is Location => Boolean(l));
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.name, path: `/services/${service.slug}` },
    { name: location.name, path },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          serviceJsonLd(service, path, [location]),
          breadcrumbJsonLd(crumbs),
          faqJsonLd(faqs),
        )}
      />
      <Breadcrumbs items={crumbs} />
      <Hero
        eyebrow={locationLabel(location)}
        title={`${service.name} in ${location.name}`}
        lead={service.tagline}
      />
      <ServiceContent service={service} location={location} />
      <FaqSection faqs={faqs} title={`${service.name} in ${location.name}: FAQs`} />
      <RelatedServices services={getRelatedServices(service)} location={location} />
      <LocationLinks
        service={service}
        locations={nearby}
        title={`${service.name} in nearby cities`}
      />
      <CtaSection
        heading={`Get a ${service.name.toLowerCase()} quote in ${location.name}`}
        text={`Tell us about your project and our ${location.name} team will reply within one business day.`}
        services={getAllServices().map((s) => s.name)}
        defaultService={service.name}
      />
    </>
  );
}
