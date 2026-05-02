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
  const addon: WorkspaceAddon = {
    id: addonId,
    active: true,
    activatedAt: new Date().toISOString(),
    ...(stripeSubscriptionItemId ? { stripeSubscriptionItemId } : {}),
  };

  await db.collection("users").doc(workspaceId).update({
    [`addons.${addonId}`]: addon,
  });
}

export async function deactivateAddon(workspaceId: string, addonId: AddonId): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("users").doc(workspaceId).update({
    [`addons.${addonId}.active`]: false,
  });
}
