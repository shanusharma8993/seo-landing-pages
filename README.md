# SEO Landing Pages: Next.js App Router

A small Next.js 15 (App Router) site that generates SEO-friendly landing pages for every **service** and **service + location** combination from local JSON data.

```
/services                               → services index
/services/website-development           → service page
/services/website-development/chandigarh → service-in-city page
```

5 services × their supported cities produce **26 landing pages**. All of them, plus their Open Graph images, are pre-rendered as static HTML at build time.

## Getting started

Requires Node.js 18.18+ (tested on Node 20).

```bash
npm install
cp .env.example .env.local    # set NEXT_PUBLIC_SITE_URL to your production origin
npm run dev                   # http://localhost:3000

npm run build                 # production build (SSG)
npm start                     # serve the build
npm test                      # smoke tests: starts the build on :3123 and checks it
npm run typecheck
```

`NEXT_PUBLIC_SITE_URL` sets the origin used for canonical URLs, Open Graph URLs, JSON-LD, the sitemap and robots.txt. It defaults to `http://localhost:3000`. It is read at **build time**, so rebuild after you change it.

## Project structure

```
app/
  layout.tsx                         Root layout: font, site-wide metadata, Organization/WebSite JSON-LD
  page.tsx                           Home
  not-found.tsx                      404 page (noindex)
  sitemap.ts / robots.ts             /sitemap.xml and /robots.txt
  opengraph-image.tsx                Default OG image
  api/contact/route.ts               Mock form endpoint
  services/
    page.tsx                         Services index
    [service]/page.tsx               Service page
    [service]/opengraph-image.tsx
    [service]/[location]/page.tsx    Service + location page
    [service]/[location]/opengraph-image.tsx
components/                          Reusable UI (see below)
data/services.json, locations.json   Mock content
lib/
  data.ts                            Typed data access + slug resolution
  seo.ts                             Metadata builder + JSON-LD builders
  contact.ts                         Validation shared by the form and the API
  og.tsx                             Shared OG image template
  site.ts                            Site config, absoluteUrl()
scripts/smoke-test.mjs               End-to-end checks against the production build
```

To add a page, add a service to `data/services.json` (list the cities it's offered in under `locations`) or add a city to `data/locations.json`. Routes, sitemap entries, internal links and OG images are all derived from that data.

## Routing and 404s

- `generateStaticParams` pre-renders every valid service and every valid service/location pair.
- `getServiceInLocation()` only resolves a pair when **both slugs exist and the service lists that city**. For example, `/services/ui-ux-design/delhi` is a 404 because UI/UX isn't offered in Delhi. This stops the site from producing thin, unsupported combinations.
- Unknown slugs call `notFound()`, which returns an HTTP **404** status (not a soft 404) and renders `app/not-found.tsx` with `noindex` and links back into the site.

## SEO implementation choices

| Concern | Implementation |
|---|---|
| **Server-rendered content** | Every page is a Server Component, so the H1, description, benefits, process, FAQs, internal links and the CTA form markup are all in the initial HTML. FAQs use native `<details>`, which keeps answers in the HTML and collapsible without JavaScript. |
| **Titles and descriptions** | The Metadata API's `generateMetadata` builds unique, data-driven values per page. The root layout sets a `%s \| Brand` title template; the home page uses `title.absolute` so the brand isn't repeated. |
| **Canonical URLs** | `alternates.canonical` on every page, resolved to absolute URLs via `metadataBase`. This guards against duplicates from query strings or tracking parameters. |
| **Open Graph / Twitter** | `buildMetadata()` sets the full `openGraph` object on each page. Next.js *replaces* a parent's `openGraph` rather than deep-merging it, so a shared builder keeps every page complete. Per-page 1200×630 PNG images come from `opengraph-image.tsx` (`next/og`) and are generated statically at build time. |
| **Robots** | `index, follow` plus `max-image-preview:large` site-wide. The 404 page is `noindex`. `robots.txt` allows everything except `/api/` and links to the sitemap. |
| **Sitemap** | `app/sitemap.ts` is derived from the same data as the routes, so it can never list a page that 404s. `lastModified` comes from each service's `updatedAt`. |
| **Heading hierarchy** | Exactly one H1 per page (in `Hero`). Each section is an H2; cards, steps and FAQ questions are H3s. The smoke tests assert this. |
| **Internal linking** | Breadcrumbs, a "by location" link list on service pages, related services that stay in the same city when that page exists (e.g. *SEO Services in Chandigarh*), nearby-city links, and a footer that links every service/location page. Each page sits at most 2 clicks from home. |
| **Structured data** | One `@graph` per page with `Service` (with `areaServed` City and `Offer`), `BreadcrumbList` and `FAQPage`, linked by `@id` to the site-wide `Organization`. The FAQ JSON-LD is built from the same array as the visible FAQs, so they always match. `<` is escaped to prevent script injection. |
| **Location uniqueness** | City pages add a city intro, industries, two location-specific FAQs and localized headings/links on top of the service copy, so they aren't near-duplicates. In production each city would need more unique content. |

## Components

| Component | Type | Purpose |
|---|---|---|
| `Header` | Server | Logo and primary nav links |
| `NavToggle` | **Client** | Only the mobile menu's open/closed state. The nav links are passed in as server-rendered `children`, so they stay in the HTML. |
| `Hero` | Server | H1, lead, CTA, priority `next/image` |
| `Breadcrumbs` | Server | Visual breadcrumb trail (BreadcrumbList JSON-LD is emitted by the page) |
| `ServiceContent` | Server | Description, benefits, process; adapts copy when given a `location` |
| `FaqSection` | Server | Accessible FAQ list |
| `RelatedServices` | Server | Related services, localized when possible |
| `LocationLinks` | Server | Links to service/location pages |
| `CtaSection` | Server | Section wrapper around the form |
| `ContactForm` | **Client** | Validation and submit states |
| `JsonLd` | Server | Safe JSON-LD `<script>` |
| `Footer` | Server | Sitewide internal links |

Only `NavToggle` and `ContactForm` are client components. Whole pages are never marked `"use client"`.

### Contact form

- `noValidate`, with custom rules in `lib/contact.ts`: name ≥ 2 chars, valid email, optional phone, a required service, and a message of 10 to 2000 chars.
- Errors appear on blur and on submit. They use `aria-invalid` and `aria-describedby`, and focus moves to the first invalid field.
- Submits to `POST /api/contact`, which validates again with the **same function** and returns 200, 422 (field errors) or 500. Results are announced through an `aria-live` region.
- **To simulate a server error**, use an email containing `fail` (e.g. `fail@example.com`).

## Performance

- **Static generation.** Every landing page and OG image is prerendered, so pages can be served from a CDN with no per-request rendering.
- **Fonts.** `next/font/google` self-hosts Inter at build time with `display: swap` and size-adjusted fallbacks. There's no runtime request to Google and no layout shift.
- **Images.** `next/image` with a static import gives intrinsic width/height (no CLS) and an automatic blur placeholder. It serves AVIF/WebP through `images.formats`, uses a responsive `srcset` with `sizes`, and the above-the-fold hero is `priority`, which preloads it with `fetchpriority="high"` for LCP.
- **Minimal client JS.** Two small client islands. The FAQ accordion uses native HTML with no JavaScript. The shared first-load JS is about 103 kB, and each page adds about 2 kB.
- **Other.** `poweredByHeader: false`, and CSS is a single small stylesheet with no framework.

## Testing

`npm test` (after `npm run build`) starts the production server and checks the **raw HTML response**, with no JavaScript executed:

- **Valid routes** return 200, with exactly one H1, H2/H3 sections, the expected `<title>`, meta description, canonical, `og:*` and robots tags, FAQ/benefits/form markup, and JSON-LD containing `Organization`, `Service`, `BreadcrumbList` and `FAQPage`.
- **Location pages** include location-specific FAQs and links to related local services and nearby cities.
- **Invalid routes** return 404 with `noindex`. Covered cases are an unknown service, an unknown city, both unknown, and valid slugs that aren't a supported pair.
- **`/sitemap.xml`** is valid XML, includes every page, excludes unsupported pairs, and has no duplicates.
- **`/robots.txt`** has the expected allow/disallow rules and a sitemap reference.
- **OG images** respond as `image/png`.
- **Contact API** returns 200, 422 and 500 for the matching scenarios.

To test an already-running server instead: `BASE_URL=http://localhost:3000 npm test`.

For manual checks, use Google's [Rich Results Test](https://search.google.com/test/rich-results) on the JSON-LD and Lighthouse for Core Web Vitals.
