import servicesData from "@/data/services.json";
import locationsData from "@/data/locations.json";

export type Faq = { question: string; answer: string };

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string[];
  benefits: { title: string; description: string }[];
  process: string[];
  faqs: Faq[];
  startingPrice: number;
  related: string[];
  locations: string[];
  updatedAt: string;
};

export type Location = {
  slug: string;
  name: string;
  region: string;
  country: string;
  intro: string;
  industries: string[];
  nearby: string[];
  geo: { latitude: number; longitude: number };
};

const services = servicesData as Service[];
const locations = locationsData as Location[];

export function getAllServices(): Service[] {
  return services;
}

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

export function getServiceLocations(service: Service): Location[] {
  return service.locations
    .map(getLocation)
    .filter((l): l is Location => Boolean(l));
}

export function getServiceInLocation(serviceSlug: string, locationSlug: string) {
  const service = getService(serviceSlug);
  if (!service || !service.locations.includes(locationSlug)) return undefined;
  const location = getLocation(locationSlug);
  if (!location) return undefined;
  return { service, location };
}

export function getRelatedServices(service: Service): Service[] {
  return service.related
    .map(getService)
    .filter((s): s is Service => Boolean(s));
}

export function getLocationFaqs(service: Service, location: Location): Faq[] {
  return [
    {
      question: `Do you offer ${service.name.toLowerCase()} in ${location.name}?`,
      answer: `Yes. We work with businesses across ${locationLabel(location)}, with on-site workshops available and day-to-day collaboration over video calls and shared project boards.`,
    },
    {
      question: `Which industries in ${location.name} do you work with?`,
      answer: `Our ${location.name} clients include ${formatList(location.industries.map((i) => i.toLowerCase()))} businesses, among others.`,
    },
    ...service.faqs,
  ];
}

export function getAllServiceLocationParams() {
  return services.flatMap((s) =>
    s.locations.map((location) => ({ service: s.slug, location })),
  );
}

export function formatList(items: string[]): string {
  return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(items);
}

export function locationLabel(location: Location): string {
  return location.region === location.name ? location.name : `${location.name}, ${location.region}`;
}
