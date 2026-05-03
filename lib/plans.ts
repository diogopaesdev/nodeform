export type PlanId = "growth" | "pro" | "enterprise";

export interface PlanLimits {
  surveys: number | null;           // null = unlimited
  responsesPerMonth: number | null; // null = unlimited
  aiCreditsPerMonth: number;
  userTemplates: number | null;     // null = unlimited
  canPurchaseAddons: boolean;
  includesAllAddons: boolean;
  hasWhiteLabel: boolean;
}

export interface PlanConfig {
  id: PlanId;
  name: string;
  stripePriceEnvKey: string | null; // null = no Stripe checkout (contact sales)
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanConfig> = {
  growth: {
    id: "growth",
    name: "Growth",
    stripePriceEnvKey: "STRIPE_GROWTH_PRICE_ID",
    limits: {
      surveys: 5,
      responsesPerMonth: 500,
      aiCreditsPerMonth: 3,
      userTemplates: 5,
      canPurchaseAddons: false,
      includesAllAddons: false,
      hasWhiteLabel: false,
    },
  },
  pro: {
    id: "pro",
    name: "Pro",
    stripePriceEnvKey: "STRIPE_PRICE_ID",
    limits: {
      surveys: null,
      responsesPerMonth: null,
      aiCreditsPerMonth: 10,
      userTemplates: 10,
      canPurchaseAddons: true,
      includesAllAddons: false,
      hasWhiteLabel: true,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    stripePriceEnvKey: null,
    limits: {
      surveys: null,
      responsesPerMonth: null,
      aiCreditsPerMonth: 50,
      userTemplates: null,
      canPurchaseAddons: false,
      includesAllAddons: true,
      hasWhiteLabel: true,
    },
  },
};

export function getPlanConfig(planId: PlanId): PlanConfig {
  return PLANS[planId];
}
