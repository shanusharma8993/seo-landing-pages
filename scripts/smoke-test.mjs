import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const PORT = 3123;
let BASE_URL = process.env.BASE_URL;
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
let server;

async function startServer() {
  const nextBin = require.resolve("next/dist/bin/next");
  server = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  server.stderr.on("data", (d) => process.stderr.write(d));
  BASE_URL = `http://localhost:${PORT}`;

  for (let i = 0; i < 60; i++) {
    try {
      await fetch(BASE_URL);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error("Server did not start within 30s. Did you run `npm run build`?");
}

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    results.push({ name, ok: false });
    console.log(`  ✗ ${name}\n    ${err.message}`);
  }
}

async function get(path) {
  const res = await fetch(BASE_URL + path, { redirect: "manual" });
  return { res, body: await res.text() };
}

const count = (html, re) => (html.match(re) ?? []).length;
const meta = (html, attr, key) =>
  html.match(new RegExp(`<meta[^>]*${attr}="${key}"[^>]*content="([^"]*)"`))?.[1];
const canonical = (html) => html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
const title = (html) => html.match(/<title>([^<]*)<\/title>/)?.[1];
const decode = (s) => s?.replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
const jsonLd = (html) =>
  [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((m) => JSON.parse(m[1]));

async function checkLandingPage(path, { h1, titleIncludes }) {
  const { res, body } = await get(path);
  assert.equal(res.status, 200, `status for ${path}`);
  assert.equal(count(body, /<h1[\s>]/g), 1, "exactly one <h1>");
  assert.match(body, new RegExp(`<h1[^>]*>${h1}</h1>`), "H1 text");
  assert.ok(count(body, /<h2[\s>]/g) >= 3, "has H2 sections");
  assert.ok(count(body, /<h3[\s>]/g) >= 3, "has H3 sub-sections");
  assert.ok(decode(title(body))?.includes(titleIncludes), `title contains "${titleIncludes}" (got "${title(body)}")`);
  assert.ok(meta(body, "name", "description")?.length > 50, "meta description");
  assert.equal(canonical(body), SITE_URL + path, "canonical URL");
  assert.equal(meta(body, "property", "og:url"), SITE_URL + path, "og:url");
  assert.ok(decode(meta(body, "property", "og:title"))?.includes(titleIncludes), "og:title");
  assert.ok(meta(body, "property", "og:image"), "og:image");
  assert.match(meta(body, "name", "robots") ?? "", /index, follow/, "robots meta");
  assert.match(body, /class="faq"/, "FAQ in HTML");
  assert.match(body, /Benefits of working with us/, "benefits in HTML");
  assert.match(body, /<form[^>]*class="contact-form"/, "contact form in HTML");
  const types = jsonLd(body).flatMap((d) => d["@graph"].map((n) => n["@type"]));
  for (const t of ["Organization", "Service", "BreadcrumbList", "FAQPage"]) {
    assert.ok(types.includes(t), `JSON-LD includes ${t}`);
  }
  return body;
}

try {
  if (!BASE_URL) await startServer();
  console.log(`Testing ${BASE_URL}\n`);

  console.log("Dynamic routes");
  await test("service page renders with metadata, headings and JSON-LD", () =>
    checkLandingPage("/services/website-development", {
      h1: "Website Development Services",
      titleIncludes: "Website Development Services",
    }),
  );
  await test("service + location page renders with location-specific content", async () => {
    const body = await checkLandingPage("/services/website-development/chandigarh", {
      h1: "Website Development in Chandigarh",
      titleIncludes: "Website Development in Chandigarh",
    });
    assert.match(body, /Do you offer website development in Chandigarh\?/, "location FAQ");
    assert.match(body, /href="\/services\/seo-services\/chandigarh"/, "internal link to related local service");
    assert.match(body, /href="\/services\/website-development\/mohali"/, "internal link to nearby city");
  });
  await test("home and services index return 200", async () => {
    assert.equal((await get("/")).res.status, 200);
    assert.equal((await get("/services")).res.status, 200);
  });

  console.log("\nInvalid routes");
  for (const path of [
    "/services/does-not-exist",
    "/services/website-development/atlantis",
    "/services/does-not-exist/chandigarh",
    "/services/ui-ux-design/delhi",
  ]) {
    await test(`404 for ${path}`, async () => {
      const { res, body } = await get(path);
      assert.equal(res.status, 404);
      assert.match(body, /Page not found/);
      assert.match(meta(body, "name", "robots") ?? "", /noindex/);
    });
  }

  console.log("\nSEO endpoints");
  await test("sitemap.xml lists every service and service/location URL", async () => {
    const { res, body } = await get("/sitemap.xml");
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /xml/);
    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    assert.ok(urls.includes(`${SITE_URL}/services/website-development/chandigarh`));
    assert.ok(!urls.includes(`${SITE_URL}/services/ui-ux-design/delhi`), "no unsupported pairs");
    assert.equal(new Set(urls).size, urls.length, "no duplicate URLs");
    assert.ok(urls.length >= 20, `expected many URLs, got ${urls.length}`);
    assert.match(body, /<lastmod>/);
  });
  await test("robots.txt allows crawling and points to the sitemap", async () => {
    const { res, body } = await get("/robots.txt");
    assert.equal(res.status, 200);
    assert.match(body, /User-Agent: \*/i);
    assert.match(body, /Allow: \//);
    assert.match(body, /Disallow: \/api\//);
    assert.match(body, new RegExp(`Sitemap: ${SITE_URL}/sitemap.xml`));
  });
  await test("Open Graph image is generated per page", async () => {
    const { body } = await get("/services/seo-services/mumbai");
    const og = meta(body, "property", "og:image");
    const res = await fetch(decode(og).replace(SITE_URL, BASE_URL));
    assert.equal(res.status, 200);
    assert.equal(res.headers.get("content-type"), "image/png");
  });

  console.log("\nContact API (mock)");
  const post = (data) =>
    fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  const valid = { name: "Asha", email: "asha@example.com", phone: "", service: "SEO Services", message: "Need help with local SEO." };
  await test("valid submission succeeds", async () => assert.equal((await post(valid)).status, 200));
  await test("invalid submission returns field errors", async () => {
    const res = await post({ ...valid, email: "nope", message: "short" });
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.ok(body.errors.email && body.errors.message);
  });
  await test("simulated server failure returns 500", async () =>
    assert.equal((await post({ ...valid, email: "fail@example.com" })).status, 500),
  );
} finally {
  server?.kill();
}

const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
