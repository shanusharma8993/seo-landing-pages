import { getAllServiceLocationParams, getServiceInLocation, locationLabel } from "@/lib/data";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = "Service by location";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllServiceLocationParams();
}

export default async function Image({
  params,
}: {
  params: Promise<{ service: string; location: string }>;
}) {
  const { service, location } = await params;
  const match = getServiceInLocation(service, location);
  return renderOgImage({
    title: match ? `${match.service.name} in ${match.location.name}` : "Our services",
    subtitle: match ? locationLabel(match.location) : "",
  });
}
