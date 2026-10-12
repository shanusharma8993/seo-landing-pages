import Link from "next/link";
import { NavToggle } from "@/components/NavToggle";
import { getAllServices } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export function Header() {
  const services = getAllServices();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          {siteConfig.name}
        </Link>

        <NavToggle>
          <nav id="primary-nav" aria-label="Primary" className="nav">
            <ul>
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`}>{s.name}</Link>
                </li>
              ))}
              <li>
                <Link href="/#contact" className="nav-cta">
                  Get a quote
                </Link>
              </li>
            </ul>
          </nav>
        </NavToggle>
      </div>
    </header>
  );
}
