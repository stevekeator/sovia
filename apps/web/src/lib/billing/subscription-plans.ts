export type BillingCycle = "monthly" | "yearly";

export type ComparisonRowId =
  | "adminAccounts"
  | "caregivers"
  | "endUsers"
  | "routines"
  | "stepsPerRoutine"
  | "voicePrompts"
  | "dataExpiration"
  | "archivedDataRecovery"
  | "sharedCaregiverAccess"
  | "organizationReadyDeployment"
  | "customOnboardingSupport";

export type PlanLimits = {
  maxRoutines: number | null;
  maxStepsPerRoutine: number | null;
  maxVoicePromptsTotal: number | null;
};

export type SubscriptionPlan = {
  id: "free" | "individual" | "family-care-team" | "enterprise";
  label: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  badge?: string;
  ctaLabel: string;
  recommended?: boolean;
  enterprise?: boolean;
  limits: PlanLimits;
  features: string[];
  comparison: Record<ComparisonRowId, string>;
};

export const comparisonRows: Array<{ id: ComparisonRowId; label: string }> = [
  { id: "adminAccounts", label: "Admin accounts" },
  { id: "caregivers", label: "Caregivers" },
  { id: "endUsers", label: "End users" },
  { id: "routines", label: "Routines" },
  { id: "stepsPerRoutine", label: "Steps per routine" },
  { id: "voicePrompts", label: "Voice prompts" },
  { id: "dataExpiration", label: "Data expiration" },
  { id: "archivedDataRecovery", label: "Archived data recovery" },
  { id: "sharedCaregiverAccess", label: "Shared caregiver access" },
  { id: "organizationReadyDeployment", label: "Organization-ready deployment" },
  { id: "customOnboardingSupport", label: "Custom onboarding/support" },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "free",
    label: "Free",
    description: "A simple way to try the platform and see how it fits into your routine.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    ctaLabel: "Get Started Free",
    limits: {
      maxRoutines: 2,
      maxStepsPerRoutine: 6,
      maxVoicePromptsTotal: 3,
    },
    features: [
      "1 admin",
      "1 end user",
      "2 routines",
      "Up to 6 steps per routine",
      "3 total voice prompts",
      "No expiration",
    ],
    comparison: {
      adminAccounts: "1",
      caregivers: "Not included",
      endUsers: "1",
      routines: "2",
      stepsPerRoutine: "Up to 6",
      voicePrompts: "3 total",
      dataExpiration: "No expiration",
      archivedDataRecovery: "Not needed",
      sharedCaregiverAccess: "Not included",
      organizationReadyDeployment: "Not included",
      customOnboardingSupport: "Not included",
    },
  },
  {
    id: "individual",
    label: "Individual",
    description:
      "Full access for one household member with unlimited routines and voice guidance.",
    monthlyPrice: 4.99,
    yearlyPrice: 39.99,
    ctaLabel: "Choose Individual",
    recommended: true,
    limits: {
      maxRoutines: null,
      maxStepsPerRoutine: null,
      maxVoicePromptsTotal: null,
    },
    features: [
      "1 admin",
      "1 end user",
      "Unlimited routines",
      "Unlimited steps per routine",
      "Unlimited voice prompts",
      "Archived data restored when reactivated",
    ],
    comparison: {
      adminAccounts: "1",
      caregivers: "Not included",
      endUsers: "1",
      routines: "Unlimited",
      stepsPerRoutine: "Unlimited",
      voicePrompts: "Unlimited",
      dataExpiration: "No expiration",
      archivedDataRecovery: "Included",
      sharedCaregiverAccess: "Not included",
      organizationReadyDeployment: "Not included",
      customOnboardingSupport: "Not included",
    },
  },
  {
    id: "family-care-team",
    label: "Family / Care Team",
    description:
      "Shared access for families, caregivers, and small support teams.",
    monthlyPrice: 29.99,
    yearlyPrice: 249.99,
    ctaLabel: "Choose Family / Care Team",
    limits: {
      maxRoutines: null,
      maxStepsPerRoutine: null,
      maxVoicePromptsTotal: null,
    },
    features: [
      "1 admin",
      "Up to 5 caregivers",
      "Up to 15 end users",
      "Unlimited routines",
      "Unlimited steps per routine",
      "Unlimited voice prompts",
    ],
    comparison: {
      adminAccounts: "1",
      caregivers: "Up to 5",
      endUsers: "Up to 15",
      routines: "Unlimited",
      stepsPerRoutine: "Unlimited",
      voicePrompts: "Unlimited",
      dataExpiration: "No expiration",
      archivedDataRecovery: "Included",
      sharedCaregiverAccess: "Included",
      organizationReadyDeployment: "Not included",
      customOnboardingSupport: "Not included",
    },
  },
  {
    id: "enterprise",
    label: "Enterprise",
    description:
      "Custom setup and pricing for schools, therapy centers, and larger organizations.",
    monthlyPrice: null,
    yearlyPrice: null,
    ctaLabel: "Contact Sales",
    enterprise: true,
    limits: {
      maxRoutines: null,
      maxStepsPerRoutine: null,
      maxVoicePromptsTotal: null,
    },
    features: [
      "Custom caregiver and user limits",
      "Custom onboarding and support",
      "Unlimited steps per routine",
      "Organization-specific pricing",
      "Tailored setup based on requirements",
    ],
    comparison: {
      adminAccounts: "Custom",
      caregivers: "Custom",
      endUsers: "Custom",
      routines: "Unlimited",
      stepsPerRoutine: "Unlimited",
      voicePrompts: "Unlimited",
      dataExpiration: "Contact us",
      archivedDataRecovery: "Included",
      sharedCaregiverAccess: "Included",
      organizationReadyDeployment: "Included",
      customOnboardingSupport: "Included",
    },
  },
];

export const pricingFaqs = [
  {
    question: "Does the free plan expire?",
    answer: "No. The free plan stays available with its included limits.",
  },
  {
    question: "What happens if a paid subscription lapses?",
    answer:
      "Your data is archived and becomes available again when your subscription is reactivated.",
  },
  {
    question: "Can I upgrade later?",
    answer: "Yes. You can upgrade at any time as your needs grow.",
  },
  {
    question: "Is Enterprise available for schools or therapy centers?",
    answer:
      "Yes. Enterprise is designed for organizations that need custom setup, onboarding, and pricing.",
  },
];

export const premiumFeatureMessages = {
  freeRoutineCapReached: "Free plans include up to 2 routines",
  freeVoicePromptCapReached: "You’ve used your free voice prompts",
  freeRoutineStepCapReached: "Free plans include up to 6 steps per routine",
  upgradeForMoreRoutines: "Upgrade to build more routines",
  upgradeForLongerRoutines: "Upgrade to build longer routines",
  upgradeForUnlimitedVoice: "Upgrade to unlock unlimited voice guidance",
  availableOnPaidPlans: "Available on paid plans",
} as const;

export const voicePromptPlanNote =
  "Free users can try up to 3 voice prompts. Paid plans unlock unlimited voice guidance.";

export function getSubscriptionPlan(planId: string | null | undefined) {
  return subscriptionPlans.find((plan) => plan.id === planId) ?? subscriptionPlans[1];
}

export function getSubscriptionPlanByTier(tier: string | null | undefined) {
  switch (tier) {
    case "FREE":
      return getSubscriptionPlan("free");
    case "INDIVIDUAL":
      return getSubscriptionPlan("individual");
    case "FAMILY_CARE_TEAM":
      return getSubscriptionPlan("family-care-team");
    case "ENTERPRISE":
      return getSubscriptionPlan("enterprise");
    default:
      return getSubscriptionPlan("free");
  }
}

export function getRoutineStepLimitForTier(tier: string | null | undefined) {
  return getSubscriptionPlanByTier(tier).limits.maxStepsPerRoutine;
}

export function getRoutineLimitForTier(tier: string | null | undefined) {
  return getSubscriptionPlanByTier(tier).limits.maxRoutines;
}

export function getVoicePromptLimitForTier(tier: string | null | undefined) {
  return getSubscriptionPlanByTier(tier).limits.maxVoicePromptsTotal;
}

export function formatPlanPrice(plan: SubscriptionPlan, billingCycle: BillingCycle) {
  if (plan.enterprise) {
    return "Contact Us";
  }

  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

  if (price === null) {
    return "Contact Us";
  }

  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function getPlanSavingsText(plan: SubscriptionPlan) {
  if (
    plan.enterprise ||
    plan.monthlyPrice === null ||
    plan.yearlyPrice === null ||
    plan.monthlyPrice === 0
  ) {
    return null;
  }

  const yearlyCostAtMonthlyRate = plan.monthlyPrice * 12;
  const savings = yearlyCostAtMonthlyRate - plan.yearlyPrice;

  if (savings <= 0) {
    return null;
  }

  return `Save ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(savings)} per year`;
}

export function getPlanCheckoutHref(plan: SubscriptionPlan, billingCycle: BillingCycle) {
  const params = new URLSearchParams({
    plan: plan.id,
    billing: billingCycle,
  });

  return `/checkout?${params.toString()}`;
}
