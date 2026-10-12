import { ogSize, renderOgImage } from "@/lib/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name}: web development, SEO and digital marketing`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Websites and marketing that grow your business",
    subtitle: "Web development · SEO · E-commerce · UI/UX · Digital marketing",
  });
}
