import { pricingFaqs } from "@/lib/billing/subscription-plans";

export function PricingFaqSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {pricingFaqs.map((item) => (
        <article key={item.question} className="panel bg-[rgba(252,251,248,0.96)] p-6">
          <p className="eyebrow">FAQ</p>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{item.question}</h3>
          <p className="mt-3 text-sm leading-7 text-muted">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}
