import { getFirebaseAdmin } from "../firebase-admin";
import { PLANS, PlanId } from "../plans";

export interface PlanLimitsConfig {
  surveys: number | null;
  responsesPerMonth: number | null;
  aiCreditsPerMonth: number;
  userTemplates: number | null;
  collaborators: number | null;
  canPurchaseAddons: boolean;
  includesAllAddons: boolean;
  hasWhiteLabel: boolean;
}

export interface PlanDocument {
  id: string;
  name: string;
  stripePriceId: string | null;
  limits: PlanLimitsConfig;
  isCustom: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

function fromStaticConfig(planId: string): PlanDocument | null {
  const config = PLANS[planId as PlanId];
  if (!config) return null;
  return {
    id: planId,
    name: config.name,
    stripePriceId: config.stripePriceEnvKey ? (process.env[config.stripePriceEnvKey] ?? null) : null,
    limits: config.limits,
    isCustom: false,
    active: true,
    createdAt: "",
    updatedAt: "",
  };
}

export async function getPlanById(planId: string): Promise<PlanDocument | null> {
  try {
    const { db } = getFirebaseAdmin();
    const doc = await db.collection("plans").doc(planId).get();
    if (doc.exists) return doc.data() as PlanDocument;
  } catch {
    // fall through
  }
  return fromStaticConfig(planId);
}

export async function getPlanByStripePriceId(priceId: string): Promise<PlanDocument | null> {
  try {
    const { db } = getFirebaseAdmin();
    const snap = await db.collection("plans").where("stripePriceId", "==", priceId).limit(1).get();
    if (!snap.empty) {
      const plan = snap.docs[0].data() as PlanDocument;
      if (plan.active) return plan;
    }
  } catch {
    // fall through
  }
  // Static fallback
  const staticMap: Record<string, string> = {};
  if (process.env.STRIPE_GROWTH_PRICE_ID) staticMap[process.env.STRIPE_GROWTH_PRICE_ID] = "growth";
  if (process.env.STRIPE_PRICE_ID) staticMap[process.env.STRIPE_PRICE_ID] = "pro";
  const planId = staticMap[priceId];
  return planId ? fromStaticConfig(planId) : null;
}

export async function getAllPlans(): Promise<PlanDocument[]> {
  try {
    const { db } = getFirebaseAdmin();
    const snap = await db.collection("plans").get();
    if (!snap.empty) {
      return snap.docs
        .map((d) => d.data() as PlanDocument)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
  } catch {
    // fall through
  }
  return Object.keys(PLANS).map((id) => fromStaticConfig(id)).filter(Boolean) as PlanDocument[];
}

export async function createPlan(plan: Omit<PlanDocument, "createdAt" | "updatedAt">): Promise<PlanDocument> {
  const { db } = getFirebaseAdmin();
  const now = new Date().toISOString();
  const doc: PlanDocument = { ...plan, createdAt: now, updatedAt: now };
  await db.collection("plans").doc(plan.id).set(doc);
  return doc;
}

export async function updatePlan(
  planId: string,
  updates: Partial<Omit<PlanDocument, "id" | "createdAt">>
): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("plans").doc(planId).update({ ...updates, updatedAt: new Date().toISOString() });
}

export async function deletePlan(planId: string): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("plans").doc(planId).delete();
}
