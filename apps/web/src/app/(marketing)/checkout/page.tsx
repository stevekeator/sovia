import Link from "next/link";

import { submitDemoRequestAction } from "@/app/(portal)/portal/actions";
import {
  formatPlanPrice,
  getPlanSavingsText,
  getSubscriptionPlan,
  type BillingCycle,
} from "@/lib/billing/subscription-plans";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    billing?: string;
    plan?: string;
    submitted?: string;
  }>;
}) {
  const params = await searchParams;
  const billingCycle: BillingCycle = params.billing === "yearly" ? "yearly" : "monthly";
  const plan = getSubscriptionPlan(params.plan);
  const price = formatPlanPrice(plan, billingCycle);
  const savingsText = billingCycle === "yearly" ? getPlanSavingsText(plan) : null;

  return (
    <div className="page-shell grid gap-8 py-16 lg:grid-cols-[0.88fr_1.12fr]">
      <section className="space-y-6">
        <div className="space-y-4">
          <p className="eyebrow">Checkout</p>
          <h1 className="display text-5xl text-foreground">
            Continue with {plan.label}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-muted">
            Choose this path to capture the plan selection and account details now.
            Payment processing can connect here later without changing the plan structure.
          </p>
        </div>

        {params.submitted === "1" ? (
          <div className="rounded-[1.4rem] border border-accent/20 bg-accent-soft px-5 py-4 text-sm font-semibold text-accent">
            Your plan request has been captured.
          </div>
        ) : null}

        <div className="panel rounded-[2rem] p-6">
          <p className="eyebrow">Order summary</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-foreground">{plan.label}</p>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-foreground">{price}</p>
                {!plan.enterprise && price !== "Free" ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    {billingCycle === "yearly" ? "Yearly billing" : "Monthly billing"}
                  </p>
                ) : null}
              </div>
            </div>
            {savingsText ? (
              <p className="inline-flex rounded-full bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
                {savingsText}
              </p>
            ) : null}
            <ul className="space-y-3 text-sm text-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <span className="mt-[0.18rem] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e7f3ef] text-xs font-bold text-accent">
                    ✓
                  </span>
                  <span className="leading-6">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="inline-flex text-sm font-semibold text-accent">
              Back to pricing
            </Link>
          </div>
        </div>
      </section>

      <form action={submitDemoRequestAction} className="panel rounded-[2rem] p-6">
        <input
          type="hidden"
          name="message"
          value={`Subscription request: ${plan.label} (${billingCycle}).`}
        />
        <input
          type="hidden"
          name="redirectTo"
          value={`/checkout?plan=${plan.id}&billing=${billingCycle}&submitted=1`}
        />
        <input type="hidden" name="subscriptionPlan" value={plan.label} />
        <input type="hidden" name="billingCycle" value={billingCycle} />
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            <span>Organization or household name</span>
            <input name="organizationName" className="field" required />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Contact name</span>
            <input name="contactName" className="field" required />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Email</span>
            <input name="email" type="email" className="field" required />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            <span>Phone</span>
            <input name="phone" className="field" />
          </label>
          <label className="space-y-2 text-sm font-semibold md:col-span-2">
            <span>Estimated user count</span>
            <input name="estimatedUserCount" type="number" min="1" className="field" />
          </label>
          <label className="space-y-2 text-sm font-semibold md:col-span-2">
            <span>Notes</span>
            <textarea
              name="checkoutNotes"
              className="field"
              placeholder="Share any onboarding, caregiver, or setup details that would help."
            />
          </label>
        </div>
        <button type="submit" className="button-primary mt-6">
          {plan.enterprise ? "Contact Sales" : `Continue with ${plan.label}`}
        </button>
      </form>
    </div>
  );
}
