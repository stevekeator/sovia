import Link from "next/link";

import {
  formatPlanPrice,
  getPlanCheckoutHref,
  getPlanSavingsText,
  type BillingCycle,
  type SubscriptionPlan,
} from "@/lib/billing/subscription-plans";
import { cn } from "@/lib/utils";

export function PricingCard({
  billingCycle,
  plan,
}: {
  billingCycle: BillingCycle;
  plan: SubscriptionPlan;
}) {
  const price = formatPlanPrice(plan, billingCycle);
  const savingsText = billingCycle === "yearly" ? getPlanSavingsText(plan) : null;
  const priceSuffix =
    plan.enterprise || price === "Free" ? null : billingCycle === "yearly" ? "/year" : "/month";
  const featureRows = [...plan.features];

  while (featureRows.length < 5) {
    featureRows.push("");
  }

  return (
    <article
      className={cn(
        "panel flex h-full flex-col p-[0.875rem]",
        plan.recommended &&
          "border-[#bad7cf] bg-[linear-gradient(180deg,rgba(252,251,248,1)_0%,rgba(239,247,243,0.98)_100%)] shadow-[0_14px_26px_rgba(31,95,82,0.08)]",
      )}
    >
      <div className="min-h-[11.5rem] border-b border-line pb-5">
        <p className="eyebrow">Plan</p>
        <h3 className="mt-3 text-[1.7rem] font-bold leading-[1.05] text-foreground">
          {plan.label}
        </h3>
        <p className="mt-3 text-[0.95rem] leading-7 text-muted">{plan.description}</p>
      </div>

      <div className="mt-5 grid min-h-[8.75rem] grid-rows-[auto_2.75rem] border-b border-line pb-4">
        <div className="flex items-end gap-2">
          <p
            className={cn(
              "font-bold tracking-tight text-foreground",
              plan.enterprise ? "text-[2.45rem] leading-[1.05]" : "text-4xl",
            )}
          >
            {price}
          </p>
          {priceSuffix ? (
            <p className="pb-1 text-sm font-semibold text-muted">{priceSuffix}</p>
          ) : null}
        </div>
        <div className="flex items-start">
          {savingsText ? (
            <p className="inline-flex w-fit border border-[#cce2db] bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
              {savingsText}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 flex-1">
        <p className="eyebrow">Includes</p>
        <ul className="mt-4 space-y-3 text-[0.95rem] text-foreground">
          {featureRows.map((feature, index) => (
            <li
              key={`${plan.id}-${feature || `empty-${index}`}`}
              className={cn("flex min-h-[3.15rem] gap-3", !feature && "opacity-0")}
              aria-hidden={!feature}
            >
              <span className="mt-[0.18rem] inline-flex h-5 w-5 shrink-0 items-center justify-center border border-[#cce2db] bg-[#e7f3ef] text-xs font-bold text-accent">
                ✓
              </span>
              <span className="leading-6">{feature || "placeholder"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 pt-2">
        <Link
          href={getPlanCheckoutHref(plan, billingCycle)}
          className={cn(
            "inline-flex min-h-[4.5rem] w-full items-center justify-center px-4 py-4 text-center text-sm font-semibold leading-tight whitespace-normal transition",
            plan.recommended
              ? "bg-accent !text-white shadow-[0_10px_22px_rgba(31,95,82,0.16)] hover:bg-[#184d43]"
              : "border border-line bg-white text-foreground hover:bg-[#f5efe4]",
          )}
        >
          {plan.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
