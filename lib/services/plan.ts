import { getFirebaseAdmin } from "../firebase-admin";
import { PlanId, PlanConfig, PLANS } from "../plans";

export async function getUserPlan(workspaceId: string): Promise<PlanId> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(workspaceId).get();
  const planId = doc.data()?.planId as PlanId | undefined;
  // Existing users without planId field default to "pro" (backward compatibility)
  return planId ?? "pro";
}

// Checks if a user document has valid access (active subscription or non-expired trial).
export function hasValidAccess(data: {
  subscriptionStatus?: string | null;
  trialEnd?: string | null;
}): boolean {
  const ACTIVE_STATUSES = ["active", "trialing"];
  if (data.subscriptionStatus && ACTIVE_STATUSES.includes(data.subscriptionStatus)) return true;
  if (data.trialEnd && new Date(data.trialEnd).getTime() > Date.now()) return true;
  return false;
}

// For security-critical plan enforcement: always reads from Firestore, never from JWT.
// Defaults planId to "pro" for existing subscribers without the field (backward compat),
// and to "growth" for users with no active subscription.
// Treats trialEnd-based trial as subscriptionStatus "trialing" so API routes enforce it correctly.
export async function getActiveUserPlan(
  userId: string
): Promise<{ planId: PlanId; subscriptionStatus: string }> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(userId).get();
  const data = doc.data();
  let subscriptionStatus: string = data?.subscriptionStatus ?? "inactive";

  // Users with no subscriptionStatus but a valid trialEnd are treated as trialing
  if (!data?.subscriptionStatus && data?.trialEnd && new Date(data.trialEnd).getTime() > Date.now()) {
    subscriptionStatus = "trialing";
  }

  // Users without planId who have an active subscription default to "pro" (backward compat)
  const activeStates = ["active", "trialing", "past_due"];
  const isActive = activeStates.includes(subscriptionStatus);
  const planId: PlanId = (data?.planId as PlanId | undefined) ?? (isActive ? "pro" : "growth");

  return { planId, subscriptionStatus };
}

export async function getUserPlanConfig(workspaceId: string): Promise<PlanConfig> {
  const planId = await getUserPlan(workspaceId);
  return PLANS[planId];
}
