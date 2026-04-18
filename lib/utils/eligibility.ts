import { EligibilityRule } from "@/types/addon";
import { Respondent } from "@/types/respondent";

export interface EligibilityResult {
  eligible: boolean;
  failedRule?: EligibilityRule;
}

function getField(respondent: Respondent, field: string): unknown {
  return (respondent as Record<string, unknown>)[field];
}

function evaluateRule(respondent: Respondent, rule: EligibilityRule): boolean {
  const fieldValue = getField(respondent, rule.field);

  switch (rule.operator) {
    case "exists":
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== "";

    case "not_exists":
      return fieldValue === undefined || fieldValue === null || fieldValue === "";

    case "equals":
      return String(fieldValue ?? "").toLowerCase() === String(rule.value ?? "").toLowerCase();

    case "not_equals":
      return String(fieldValue ?? "").toLowerCase() !== String(rule.value ?? "").toLowerCase();

    case "in": {
      const values = Array.isArray(rule.value) ? rule.value : [rule.value ?? ""];
      return values.map((v) => v.toLowerCase()).includes(String(fieldValue ?? "").toLowerCase());
    }

    case "not_in": {
      const values = Array.isArray(rule.value) ? rule.value : [rule.value ?? ""];
      return !values.map((v) => v.toLowerCase()).includes(String(fieldValue ?? "").toLowerCase());
    }

    default:
      return true;
  }
}

// Evaluate all rules — ALL must pass (AND logic)
export function evaluateEligibility(
  respondent: Respondent,
  rules: EligibilityRule[]
): EligibilityResult {
  for (const rule of rules) {
    if (!evaluateRule(respondent, rule)) {
      return { eligible: false, failedRule: rule };
    }
  }
  return { eligible: true };
}

// Check if a node should be visible to this respondent
export function isNodeVisibleToRespondent(
  rules: EligibilityRule[] | undefined,
  respondent: Respondent | null
): boolean {
  if (!rules || rules.length === 0) return true;
  if (!respondent) return false;
  return evaluateEligibility(respondent, rules).eligible;
}
