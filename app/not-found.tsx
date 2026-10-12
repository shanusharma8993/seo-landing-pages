import type { Metadata } from "next";
import Link from "next/link";
import { getAllServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="section container not-found">
      <h1>Page not found</h1>
      <p className="lead">
        The service or location you&apos;re looking for doesn&apos;t exist or isn&apos;t offered yet.
      </p>
      <h2>Try one of these services</h2>
      <ul className="pill-list">
        {getAllServices().map((s) => (
          <li key={s.slug}>
            <Link href={`/services/${s.slug}`} className="pill">
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/">← Back to the homepage</Link>
      </p>
    </section>
  );
}
