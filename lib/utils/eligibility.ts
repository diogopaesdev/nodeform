import { EligibilityRule } from "@/types/addon";
import { Respondent } from "@/types/respondent";

export interface EligibilityResult {
  eligible: boolean;
  failedRule?: EligibilityRule;
}

function getField(respondent: Respondent, field: string): unknown {
  return (respondent as Record<string, unknown>)[field];
}

const isEmpty = (v: unknown) => v === undefined || v === null || v === "";
const norm = (v: unknown) => String(v ?? "").toLowerCase();

// Array field matching: a rule passes if AT LEAST ONE item satisfies it (contains).
// Negations are the negation of "contains" — i.e. no item matches.
function evaluateArrayRule(fieldValue: unknown, rule: EligibilityRule): boolean {
  const items = Array.isArray(fieldValue) ? (fieldValue as Record<string, unknown>[]) : [];

  // Values of the target sub-field across all items (e.g. every item's "tipo")
  const subValues = rule.subField
    ? items.map((it) => (it && typeof it === "object" ? it[rule.subField as string] : undefined))
    : items;

  switch (rule.operator) {
    case "exists":
      return subValues.some((v) => !isEmpty(v));
    case "not_exists":
      return !subValues.some((v) => !isEmpty(v));
    case "equals":
      return subValues.some((v) => norm(v) === norm(rule.value));
    case "not_equals":
      return !subValues.some((v) => norm(v) === norm(rule.value));
    case "in": {
      const values = (Array.isArray(rule.value) ? rule.value : [rule.value ?? ""]).map(norm);
      return subValues.some((v) => values.includes(norm(v)));
    }
    case "not_in": {
      const values = (Array.isArray(rule.value) ? rule.value : [rule.value ?? ""]).map(norm);
      return !subValues.some((v) => values.includes(norm(v)));
    }
    default:
      return true;
  }
}

function evaluateRule(respondent: Respondent, rule: EligibilityRule): boolean {
  const fieldValue = getField(respondent, rule.field);

  // Array fields (list of objects) use contains semantics against a sub-field
  if (Array.isArray(fieldValue)) {
    return evaluateArrayRule(fieldValue, rule);
  }

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
