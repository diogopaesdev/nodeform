export type AddonId = "respondents" | "surveyProgress";

export type PlanId = "growth" | "pro" | "enterprise";

// A sub-field inside an array item (all free text). Ex: "nome", "tipo"
export interface ProfileSubField {
  key: string;   // machine name used in the item object: "tipo"
  label: string; // human-readable label shown in UI: "Tipo"
}

// A single field definition in the workspace respondent profile schema
export interface ProfileField {
  key: string;       // machine name used in SSO/sync payload: "specialty"
  label: string;     // human-readable label shown in UI: "Especialidade"
  type: "string" | "enum" | "array";
  options?: string[];            // values for enum type: ["oncologia", "clinico_geral"]
  itemFields?: ProfileSubField[]; // shape of each item for array type: [{key:"nome"},{key:"tipo"}]
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
  surveyProgress?: WorkspaceAddon;
}

// Eligibility rule evaluated against respondent profile fields
export interface EligibilityRule {
  id: string;
  field: string; // e.g. "specialty", "sector", "crm", or an array field like "instituicoes"
  subField?: string; // for array fields: which item sub-field to match (e.g. "tipo")
  operator: "equals" | "not_equals" | "in" | "not_in" | "exists" | "not_exists";
  value?: string | string[];
  label?: string; // human-readable description shown in editor
}
