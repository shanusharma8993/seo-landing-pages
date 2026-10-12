export const siteConfig = {
  name: "Northstar Digital",
  description:
    "Website development, SEO, e-commerce, UI/UX and digital marketing services for businesses across India.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  email: "hello@example.com",
  phone: "+91-00000-00000",
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
