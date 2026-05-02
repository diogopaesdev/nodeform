import { getFirebaseAdmin } from "../firebase-admin";
import { PlanId, PlanConfig, PLANS } from "../plans";

export async function getUserPlan(workspaceId: string): Promise<PlanId> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(workspaceId).get();
  const planId = doc.data()?.planId as PlanId | undefined;
  // Existing users without planId field default to "pro" (backward compatibility)
  return planId ?? "pro";
}

export async function getUserPlanConfig(workspaceId: string): Promise<PlanConfig> {
  const planId = await getUserPlan(workspaceId);
  return PLANS[planId];
}
