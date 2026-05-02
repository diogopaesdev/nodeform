import { getFirebaseAdmin } from "../firebase-admin";
import { PlanId, PlanConfig, PLANS } from "../plans";

export async function getUserPlan(workspaceId: string): Promise<PlanId> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(workspaceId).get();
  const planId = doc.data()?.planId as PlanId | undefined;
  // Existing users without planId field default to "pro" (backward compatibility)
  return planId ?? "pro";
}

// For security-critical plan enforcement: always reads from Firestore, never from JWT.
// Defaults planId to "pro" for existing subscribers without the field (backward compat),
// and to "growth" for users with no active subscription.
export async function getActiveUserPlan(
  userId: string
): Promise<{ planId: PlanId; subscriptionStatus: string }> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(userId).get();
  const data = doc.data();
  const subscriptionStatus: string = data?.subscriptionStatus ?? "inactive";

  let planId: PlanId;
  if (data?.planId) {
    planId = data.planId as PlanId;
  } else {
    // Backward compat: users without planId who have an active subscription default to "pro"
    const activeStates = ["active", "trialing", "past_due"];
    planId = activeStates.includes(subscriptionStatus) ? "pro" : "growth";
  }

  return { planId, subscriptionStatus };
}

export async function getUserPlanConfig(workspaceId: string): Promise<PlanConfig> {
  const planId = await getUserPlan(workspaceId);
  return PLANS[planId];
}
