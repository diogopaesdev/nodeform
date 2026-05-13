import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const PLAN_PRICES: Record<string, string> = {
  pro: process.env.STRIPE_PRICE_ID ?? "",
};

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();

  const customerId = userData?.stripeCustomerId as string | undefined;
  if (!customerId) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada" }, { status: 400 });
  }

  const targetPriceId = PLAN_PRICES["pro"];
  if (!targetPriceId) {
    return NextResponse.json({ error: "Price ID do plano Pro não configurado" }, { status: 500 });
  }

  // Find the active subscription for this customer
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 1,
  });

  if (subscriptions.data.length === 0) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada" }, { status: 400 });
  }

  const subscription = subscriptions.data[0];
  const currentItem = subscription.items.data[0];

  // Already on Pro or above
  if (currentItem.price.id === targetPriceId) {
    return NextResponse.json({ error: "Já está no plano Pro" }, { status: 400 });
  }

  // Update subscription item to Pro price with proration
  await stripe.subscriptions.update(subscription.id, {
    items: [{ id: currentItem.id, price: targetPriceId }],
    proration_behavior: "create_prorations",
    metadata: { planId: "pro", userId: session.user.id },
  });

  // Update Firestore immediately (webhook will confirm)
  await db.collection("users").doc(session.user.id).update({
    planId: "pro",
  });

  return NextResponse.json({ ok: true });
}
