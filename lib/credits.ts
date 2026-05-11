import { getFirebaseAdmin } from "./firebase-admin";
import { PLANS, PlanId } from "./plans";

export const CREDIT_PRICE_BRL = 5; // R$ por crédito
export const CREDIT_PACKAGE_SIZE = 10; // créditos no pacote inicial

function monthlyCreditsForPlan(userData: Record<string, unknown>): number {
  const subscriptionStatus = userData.subscriptionStatus as string | undefined;
  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const planId = (isActive ? (userData.planId as PlanId | undefined) : undefined) ?? "growth";
  return PLANS[planId]?.limits.aiCreditsPerMonth ?? PLANS.growth.limits.aiCreditsPerMonth;
}

// ─── Check monthly reset and return current credits ───────────────────────────

export async function getCredits(userId: string): Promise<{
  credits: number;
  resetAt: string;
  nextResetAt: string;
}> {
  const { db } = getFirebaseAdmin();
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();
  const userData = userDoc.data() || {};

  const { credits, resetAt, didReset } = resolveCredits(userData);

  if (didReset) {
    await userRef.set({ aiCredits: credits, creditsResetAt: resetAt }, { merge: true });
  }

  const nextReset = new Date(resetAt);
  nextReset.setMonth(nextReset.getMonth() + 1);
  nextReset.setDate(1);
  nextReset.setHours(0, 0, 0, 0);

  return { credits, resetAt, nextResetAt: nextReset.toISOString() };
}

// ─── Consume one credit (transactional) ──────────────────────────────────────

export async function consumeCredit(userId: string): Promise<boolean> {
  const { db } = getFirebaseAdmin();
  const userRef = db.collection("users").doc(userId);

  return db.runTransaction(async (t) => {
    const userDoc = await t.get(userRef);
    const userData = userDoc.data() || {};
    const { credits, resetAt, didReset } = resolveCredits(userData);

    if (credits <= 0) return false;

    t.set(
      userRef,
      { aiCredits: credits - 1, ...(didReset ? { creditsResetAt: resetAt } : {}) },
      { merge: true }
    );
    return true;
  });
}

// ─── Add credits (after purchase) ────────────────────────────────────────────

export async function addCredits(userId: string, amount: number): Promise<void> {
  const { db, FieldValue } = getFirebaseAdmin();
  await db
    .collection("users")
    .doc(userId)
    .set({ aiCredits: FieldValue.increment(amount) }, { merge: true });
}

// ─── Internal: resolve monthly reset logic ────────────────────────────────────

function resolveCredits(userData: Record<string, unknown>): {
  credits: number;
  resetAt: string;
  didReset: boolean;
} {
  const now = new Date();
  const storedReset = userData.creditsResetAt as string | undefined;
  const monthlyLimit = monthlyCreditsForPlan(userData);

  const shouldReset =
    !storedReset ||
    (() => {
      const d = new Date(storedReset);
      return d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear();
    })();

  if (shouldReset) {
    return {
      credits: monthlyLimit,
      resetAt: now.toISOString(),
      didReset: true,
    };
  }

  return {
    credits: typeof userData.aiCredits === "number" ? userData.aiCredits : monthlyLimit,
    resetAt: storedReset!,
    didReset: false,
  };
}
