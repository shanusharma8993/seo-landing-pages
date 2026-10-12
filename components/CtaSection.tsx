import { ContactForm } from "@/components/ContactForm";

type Props = { heading: string; text: string; services: string[]; defaultService?: string };

export function CtaSection({ heading, text, services, defaultService }: Props) {
  return (
    <section id="contact" className="section cta" aria-labelledby="cta-heading">
      <div className="container cta-inner">
        <div>
          <h2 id="cta-heading">{heading}</h2>
          <p>{text}</p>
        </div>
        <ContactForm services={services} defaultService={defaultService} />
      </div>
    </section>
  );
}
