import {
  comparisonRows,
  subscriptionPlans,
} from "@/lib/billing/subscription-plans";

export function PricingComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-[rgba(252,251,248,0.98)] shadow-[0_10px_24px_rgba(31,42,40,0.05)]">
      <table className="w-full min-w-[760px] border-separate border-spacing-0">
        <thead>
          <tr className="border-b border-line bg-[#987a52]">
            <th className="border-r-[2px] border-r-transparent bg-[#6f9485] px-5 py-4 text-left text-sm font-semibold !text-[#f7f3ea]">
              Feature
            </th>
            {subscriptionPlans.map((plan) => (
              <th
                key={plan.id}
                className="border-r-[2px] border-r-transparent px-5 py-4 !text-center text-sm font-semibold !text-[#f7f3ea] last:border-r-0"
                style={{ textAlign: "center" }}
              >
                {plan.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {comparisonRows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={rowIndex % 2 === 0 ? "bg-[rgba(252,251,248,0.98)]" : "bg-[#f7f1e6]"}
            >
              <th className="border-r-[2px] border-r-transparent border-t border-line bg-[#87a999] px-5 py-4 text-left text-sm font-semibold !text-[#f7f3ea]">
                {row.label}
              </th>
              {subscriptionPlans.map((plan) => (
                <td
                  key={`${plan.id}-${row.id}`}
                  className="border-r-[2px] border-r-transparent border-t border-line px-5 py-4 !text-center text-sm leading-6 text-muted last:border-r-0"
                  style={{ textAlign: "center" }}
                >
                  {plan.comparison[row.id]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
