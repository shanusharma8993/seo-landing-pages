import { getAllServices, getService } from "@/lib/data";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = "Service overview";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllServices().map((s) => ({ service: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ service: string }> }) {
  const service = getService((await params).service);
  return renderOgImage({
    title: service ? `${service.name} Services` : "Our services",
    subtitle: service?.tagline ?? "",
  });
}
