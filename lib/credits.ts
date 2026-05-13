import { getFirebaseAdmin } from "./firebase-admin";
import { PLANS, PlanId } from "./plans";

export const CREDIT_PRICE_BRL = 5; // R$ por crédito
export const CREDIT_PACKAGE_SIZE = 10; // créditos no pacote inicial

export async function getCredits(userId: string): Promise<{
  credits: number;
  monthlyLimit: number;
}> {
  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(userId).get();
  const userData = userDoc.data() || {};

  const subscriptionStatus = userData.subscriptionStatus as string | undefined;
  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const planId: PlanId = (isActive ? (userData.planId as PlanId | undefined) : undefined) ?? "growth";
  const monthlyLimit = PLANS[planId]?.limits.aiCreditsPerMonth ?? PLANS.growth.limits.aiCreditsPerMonth;

  const credits = typeof userData.aiCredits === "number" ? userData.aiCredits : 0;

  return { credits, monthlyLimit };
}

export async function consumeCredit(userId: string): Promise<boolean> {
  const { db, FieldValue } = getFirebaseAdmin();
  const userRef = db.collection("users").doc(userId);

  return db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    const credits = userDoc.data()?.aiCredits ?? 0;

    if (credits <= 0) return false;

    t.set(userRef, { aiCredits: FieldValue.increment(-1) }, { merge: true });
    return true;
  });
}

export async function resetCreditsForPlan(userId: string, planId: PlanId): Promise<void> {
  const { db } = getFirebaseAdmin();
  const monthlyLimit = PLANS[planId]?.limits.aiCreditsPerMonth ?? PLANS.growth.limits.aiCreditsPerMonth;
  await db.collection("users").doc(userId).set(
    { aiCredits: monthlyLimit },
    { merge: true }
  );
}

export async function addCredits(userId: string, amount: number): Promise<void> {
  const { db, FieldValue } = getFirebaseAdmin();
  await db
    .collection("users")
    .doc(userId)
    .set({ aiCredits: FieldValue.increment(amount) }, { merge: true });
}
