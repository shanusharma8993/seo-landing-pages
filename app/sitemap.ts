import type { MetadataRoute } from "next";
import { getAllServices } from "@/lib/data";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const services = getAllServices();
  const latest = services.map((s) => s.updatedAt).sort().at(-1);

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    ...services.flatMap((s) => [
      {
        url: absoluteUrl(`/services/${s.slug}`),
        lastModified: s.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      },
      ...s.locations.map((location) => ({
        url: absoluteUrl(`/services/${s.slug}/${location}`),
        lastModified: s.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ]),
  ];
}
