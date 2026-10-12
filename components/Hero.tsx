import Image from "next/image";
import Link from "next/link";
import heroImage from "@/public/images/hero.jpg";

type HeroProps = {
  eyebrow?: string;
  title: string;
  lead: string;
};

export function Hero({ eyebrow, title, lead }: HeroProps) {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1>{title}</h1>
          <p className="lead">{lead}</p>
          <Link href="#contact" className="button">
            Request a free consultation
          </Link>
        </div>
        <Image
          src={heroImage}
          alt="Abstract illustration of a website layout on a laptop screen"
          className="hero-image"
          priority
          placeholder="blur"
          sizes="(max-width: 860px) 100vw, 45vw"
        />
      </div>
    </section>
  );
}
