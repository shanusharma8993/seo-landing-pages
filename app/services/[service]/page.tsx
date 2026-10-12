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
  getAllServices,
  getRelatedServices,
  getService,
  getServiceLocations,
} from "@/lib/data";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, graph, serviceJsonLd } from "@/lib/seo";

type Params = { service: string };
type Props = { params: Promise<Params> };

export function generateStaticParams(): Params[] {
  return getAllServices().map((s) => ({ service: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getService((await params).service);
  if (!service) return {};

  return buildMetadata({
    title: `${service.name} Services`,
    description: `${service.summary} Available in ${getServiceLocations(service)
      .map((l) => l.name)
      .join(", ")}.`,
    path: `/services/${service.slug}`,
  });
}

export default async function ServicePage({ params }: Props) {
  const service = getService((await params).service);
  if (!service) notFound();

  const path = `/services/${service.slug}`;
  const locations = getServiceLocations(service);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: service.name, path },
  ];

  return (
    <>
      <JsonLd
        data={graph(
          serviceJsonLd(service, path, locations),
          breadcrumbJsonLd(crumbs),
          faqJsonLd(service.faqs),
        )}
      />
      <Breadcrumbs items={crumbs} />
      <Hero eyebrow="Service" title={`${service.name} Services`} lead={service.tagline} />
      <ServiceContent service={service} />
      <LocationLinks
        service={service}
        locations={locations}
        title={`${service.name} by location`}
      />
      <FaqSection faqs={service.faqs} />
      <RelatedServices services={getRelatedServices(service)} />
      <CtaSection
        heading={`Start your ${service.name.toLowerCase()} project`}
        text="Tell us what you need and we'll get back to you within one business day."
        services={getAllServices().map((s) => s.name)}
        defaultService={service.name}
      />
    </>
  );
}
