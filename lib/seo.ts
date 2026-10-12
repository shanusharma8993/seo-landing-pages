import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/lib/site";
import type { Faq, Location, Service } from "@/lib/data";

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
};

export function buildMetadata({ title, description, path }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      url: path,
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: { index: true, follow: true },
  };
}

const organizationId = `${siteConfig.url}/#organization`;

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phone,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: Faq[]) {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

export function serviceJsonLd(service: Service, path: string, locations: Location[]) {
  return {
    "@type": "Service",
    "@id": `${absoluteUrl(path)}#service`,
    name: locations.length === 1 ? `${service.name} in ${locations[0].name}` : service.name,
    serviceType: service.name,
    description: service.summary,
    url: absoluteUrl(path),
    provider: { "@id": organizationId },
    areaServed: locations.map((l) => ({
      "@type": "City",
      name: l.name,
      containedInPlace: { "@type": "AdministrativeArea", name: l.region },
    })),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: service.startingPrice,
      description: `Projects start from $${service.startingPrice}`,
    },
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
