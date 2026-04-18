export type AddonId = "respondents";

export interface WorkspaceAddon {
  id: AddonId;
  active: boolean;
  activatedAt?: string;
  stripeSubscriptionItemId?: string;
}

export interface WorkspaceAddons {
  respondents?: WorkspaceAddon;
}

// Eligibility rule evaluated against respondent profile fields
export interface EligibilityRule {
  id: string;
  field: string; // e.g. "specialty", "sector", "crm"
  operator: "equals" | "not_equals" | "in" | "not_in" | "exists" | "not_exists";
  value?: string | string[];
  label?: string; // human-readable description shown in editor
}
