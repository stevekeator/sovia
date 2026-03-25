"use client";

import { useState } from "react";

import { BillingToggle } from "@/components/pricing/billing-toggle";
import { PricingCard } from "@/components/pricing/pricing-card";
import { PricingComparisonTable } from "@/components/pricing/pricing-comparison-table";
import { PricingFaqSection } from "@/components/pricing/pricing-faq-section";
import {
  premiumFeatureMessages,
  subscriptionPlans,
  voicePromptPlanNote,
  type BillingCycle,
} from "@/lib/billing/subscription-plans";

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="space-y-28 pb-28 pt-12">
      <section className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="space-y-6">
            <p className="eyebrow">Pricing</p>
            <div className="space-y-5">
              <h1 className="display max-w-4xl text-5xl leading-[1.02] tracking-tight text-foreground md:text-[4.25rem]">
                Simple plans for every support system
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted">
                Start free for one person, then upgrade when you need more routines,
                more voice guidance, broader caregiver access, or organization-ready support.
              </p>
            </div>
          </div>

          <div className="panel bg-[linear-gradient(180deg,rgba(252,251,248,0.98)_0%,rgba(240,248,244,0.9)_100%)] p-6">
            <p className="eyebrow">Voice guidance</p>
            <p className="mt-4 text-base leading-8 text-muted">{voicePromptPlanNote}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="border border-line bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Free message
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {premiumFeatureMessages.freeVoicePromptCapReached}
                </p>
              </div>
              <div className="border border-line bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Upgrade message
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {premiumFeatureMessages.upgradeForUnlimitedVoice}
                </p>
              </div>
              <div className="border border-line bg-white/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                  Locked label
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {premiumFeatureMessages.availableOnPaidPlans}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Billing cycle</p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
              Switch between monthly and yearly billing to compare the plans in the way that fits your household or team best.
            </p>
          </div>
          <BillingToggle billingCycle={billingCycle} onChange={setBillingCycle} />
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {subscriptionPlans.map((plan) => (
            <PricingCard key={plan.id} billingCycle={billingCycle} plan={plan} />
          ))}
        </div>
      </section>

      <section className="page-shell space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">Comparison</p>
          <h2 className="display text-4xl text-foreground md:text-[2.9rem]">
            Compare the plans side by side
          </h2>
          <p className="max-w-3xl text-base leading-8 text-muted">
            The free plan stays useful over time, while paid plans open up unlimited routines, unlimited voice guidance, and broader caregiver support.
          </p>
        </div>
        <PricingComparisonTable />
      </section>

      <section className="page-shell space-y-8">
        <div className="space-y-4">
          <p className="eyebrow">FAQ</p>
          <h2 className="display text-4xl text-foreground md:text-[2.9rem]">A few helpful notes</h2>
        </div>
        <PricingFaqSection />
      </section>
    </div>
  );
}
