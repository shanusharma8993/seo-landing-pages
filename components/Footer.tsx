import Link from "next/link";
import { getAllServices, getServiceLocations } from "@/lib/data";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const services = getAllServices();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        {services.map((s) => (
          <div key={s.slug}>
            <p className="footer-heading">
              <Link href={`/services/${s.slug}`}>{s.name}</Link>
            </p>
            <ul>
              {getServiceLocations(s).map((l) => (
                <li key={l.slug}>
                  <Link href={`/services/${s.slug}/${l.slug}`}>
                    {s.name} in {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="container copyright">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </p>
    </footer>
  );
}
