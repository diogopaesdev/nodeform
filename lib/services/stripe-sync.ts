import Stripe from "stripe";
import { getFirebaseAdmin } from "../firebase-admin";
import { resetCreditsForPlan } from "../credits";
import { PlanId } from "../plans";

export function mapSubscriptionStatus(sub: Stripe.Subscription): string {
  if (sub.status === "trialing") return "trialing";
  if (sub.status === "active") return "active";
  if (sub.status === "past_due") return "past_due";
  if (sub.status === "unpaid") return "unpaid";
  return "inactive";
}

// Writes a subscription's real Stripe state into the user's Firestore doc.
// Needed for admin billing-recovery actions that create/update subscriptions
// outside the checkout flow: the webhook (app/api/stripe/webhook/route.ts)
// only handles "checkout.session.completed", "customer.subscription.updated"
// and "customer.subscription.deleted" — not "customer.subscription.created" —
// so a subscription created directly via the API would otherwise never sync.
export async function syncSubscriptionToFirestore(
  userId: string,
  sub: Stripe.Subscription,
  planId: PlanId
): Promise<void> {
  const { db } = getFirebaseAdmin();
  const periodEnd =
    sub.items.data[0]?.current_period_end ??
    (sub as unknown as Record<string, number>).current_period_end;

  const userRef = db.collection("users").doc(userId);
  const previousPlanId = (await userRef.get()).data()?.planId as PlanId | undefined;

  await userRef.update({
    stripeSubscriptionId: sub.id,
    subscriptionStatus: mapSubscriptionStatus(sub),
    subscriptionCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
    planId,
  });

  if (planId !== previousPlanId) {
    await resetCreditsForPlan(userId, planId);
  }
}
