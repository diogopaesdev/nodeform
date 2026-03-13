import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { addCredits } from "@/lib/credits";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { db } = getFirebaseAdmin();

  const getSubscriptionStatus = (sub: Stripe.Subscription): string => {
    if (sub.status === "trialing") return "trialing";
    if (sub.status === "active") return "active";
    if (sub.status === "past_due") return "past_due";
    return "inactive";
  };

  const getUserByCustomerId = async (customerId: string) => {
    const snapshot = await db
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();
    return snapshot.docs[0] ?? null;
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;

      // Compra de créditos avulsos
      if (checkoutSession.metadata?.type === "credits" && checkoutSession.payment_status === "paid") {
        const userId = checkoutSession.metadata.userId;
        const creditAmount = parseInt(checkoutSession.metadata.creditAmount || "0", 10);
        if (userId && creditAmount > 0) {
          await addCredits(userId, creditAmount);
        }
        break;
      }

      if (checkoutSession.mode !== "subscription") break;

      const customerId = checkoutSession.customer as string;
      const subscriptionId = checkoutSession.subscription as string;
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      const userDoc = await getUserByCustomerId(customerId);
      if (!userDoc) break;

      const periodEnd =
        subscription.items.data[0]?.current_period_end ??
        (subscription as unknown as Record<string, number>).current_period_end;

      await userDoc.ref.update({
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: getSubscriptionStatus(subscription),
        subscriptionCurrentPeriodEnd: new Date(
          periodEnd * 1000
        ).toISOString(),
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      });
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userDoc = await getUserByCustomerId(customerId);
      if (!userDoc) break;

      const periodEnd =
        subscription.items.data[0]?.current_period_end ??
        (subscription as unknown as Record<string, number>).current_period_end;

      await userDoc.ref.update({
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: getSubscriptionStatus(subscription),
        subscriptionCurrentPeriodEnd: new Date(
          periodEnd * 1000
        ).toISOString(),
        trialEnd: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
      });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const userDoc = await getUserByCustomerId(customerId);
      if (!userDoc) break;

      await userDoc.ref.update({
        subscriptionStatus: "inactive",
        stripeSubscriptionId: null,
        subscriptionCurrentPeriodEnd: null,
        trialEnd: null,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
