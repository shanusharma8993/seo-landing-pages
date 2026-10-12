import type { Faq } from "@/lib/data";

type Props = { faqs: Faq[]; title?: string };

export function FaqSection({ faqs, title = "Frequently asked questions" }: Props) {
  return (
    <section className="section container" aria-labelledby="faq-heading">
      <h2 id="faq-heading">{title}</h2>
      <div className="faq-list">
        {faqs.map((faq, i) => (
          <details key={faq.question} className="faq" open={i === 0}>
            <summary>
              <h3>{faq.question}</h3>
            </summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
