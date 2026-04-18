export type AddonId = "respondents";

// A single field definition in the workspace respondent profile schema
export interface ProfileField {
  key: string;       // machine name used in SSO/sync payload: "specialty"
  label: string;     // human-readable label shown in UI: "Especialidade"
  type: "string" | "enum";
  options?: string[]; // values for enum type: ["oncologia", "clinico_geral"]
  description?: string;
}

export type ProfileSchema = ProfileField[];

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
