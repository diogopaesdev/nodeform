import { getFirebaseAdmin } from "../firebase-admin";
import { AddonId, WorkspaceAddon, WorkspaceAddons } from "@/types/addon";

export async function getWorkspaceAddons(workspaceId: string): Promise<WorkspaceAddons> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(workspaceId).get();
  if (!doc.exists) return {};
  return (doc.data()?.addons as WorkspaceAddons) ?? {};
}

export async function hasAddon(workspaceId: string, addonId: AddonId): Promise<boolean> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(workspaceId).get();
  if (!doc.exists) return false;
  const data = doc.data()!;

  // Enterprise plan includes all addons automatically
  if (data.planId === "enterprise") return true;

  const addons = (data.addons as WorkspaceAddons) ?? {};
  return addons[addonId]?.active === true;
}

export async function activateAddon(
  workspaceId: string,
  addonId: AddonId,
  stripeSubscriptionItemId?: string
): Promise<void> {
  const { db } = getFirebaseAdmin();

  // Read plan fresh from Firestore — never trust JWT for security decisions
  const userDoc = await db.collection("users").doc(workspaceId).get();
  if (!userDoc.exists) throw new Error("WORKSPACE_NOT_FOUND");

  const planId: string = userDoc.data()?.planId ?? "pro";

  // Addons are exclusive to the Pro plan.
  // Growth cannot have addons; Enterprise already includes them via hasAddon().
  if (planId === "growth") {
    throw new Error("ADDON_NOT_ALLOWED_ON_PLAN");
  }

  const addon: WorkspaceAddon = {
    id: addonId,
    active: true,
    activatedAt: new Date().toISOString(),
    ...(stripeSubscriptionItemId ? { stripeSubscriptionItemId } : {}),
  };

  await userDoc.ref.update({
    [`addons.${addonId}`]: addon,
  });
}

export async function deactivateAddon(workspaceId: string, addonId: AddonId): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("users").doc(workspaceId).update({
    [`addons.${addonId}.active`]: false,
  });
}
