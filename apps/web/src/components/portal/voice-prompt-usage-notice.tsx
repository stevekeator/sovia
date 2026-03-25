import { premiumFeatureMessages } from "@/lib/billing/subscription-plans";

export function VoicePromptUsageNotice({
  used,
  limit,
  className = "",
}: {
  used: number;
  limit: number | null;
  className?: string;
}) {
  if (limit === null) {
    return null;
  }

  const remaining = Math.max(limit - used, 0);
  const isLimitReached = used >= limit;

  return (
    <div className={`rounded-[1rem] border border-[#c7ddd5] bg-[#edf6f1] px-4 py-3 text-sm text-[#1f5f52] ${className}`}>
      <p className="font-semibold">{premiumFeatureMessages.freeVoicePromptCapReached}.</p>
      <p className="mt-1 text-[#41665d]">
        {used} of {limit} total voice prompts are currently in use across this organization.
        {isLimitReached
          ? ` ${premiumFeatureMessages.upgradeForUnlimitedVoice}.`
          : ` ${remaining} ${remaining === 1 ? "prompt remains" : "prompts remain"} on the free plan.`}
      </p>
    </div>
  );
}
