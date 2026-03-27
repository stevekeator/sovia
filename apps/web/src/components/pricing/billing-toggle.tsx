"use client";

import { cn } from "@/lib/utils";
import type { BillingCycle } from "@/lib/billing/subscription-plans";

export function BillingToggle({
  billingCycle,
  onChange,
}: {
  billingCycle: BillingCycle;
  onChange: (billingCycle: BillingCycle) => void;
}) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-[10px] border border-line bg-[linear-gradient(180deg,rgba(252,251,248,0.96)_0%,rgba(246,241,231,0.92)_100%)] p-2 shadow-[0_10px_20px_rgba(31,42,40,0.05)]"
      role="tablist"
      aria-label="Billing frequency"
    >
      {[
        { id: "monthly" as const, label: "Monthly" },
        { id: "yearly" as const, label: "Yearly" },
      ].map((option) => (
        <button
          key={option.id}
          type="button"
          role="tab"
          aria-selected={billingCycle === option.id}
          className={cn(
            "rounded-[8px] px-5 py-3 text-sm font-semibold transition",
            billingCycle === option.id
              ? "bg-accent text-white shadow-[0_8px_16px_rgba(31,95,82,0.16)]"
              : "text-muted hover:bg-[#f2ece0]",
          )}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
