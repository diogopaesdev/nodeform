import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

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
    return NextResponse.json({ synced: false });
  }

  // Busca a assinatura ativa mais recente no Stripe
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    limit: 1,
    status: "all",
  });

  const sub = subscriptions.data[0];
  if (!sub) {
    return NextResponse.json({ synced: false });
  }

  const getStatus = () => {
    if (sub.status === "trialing") return "trialing";
    if (sub.status === "active") return "active";
    if (sub.status === "past_due") return "past_due";
    return "inactive";
  };

  const periodEnd =
    sub.items.data[0]?.current_period_end ??
    (sub as unknown as Record<string, number>).current_period_end;

  await userDoc.ref.update({
    stripeSubscriptionId: sub.id,
    subscriptionStatus: getStatus(),
    subscriptionCurrentPeriodEnd: new Date(periodEnd * 1000).toISOString(),
    trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  });

  return NextResponse.json({ synced: true, status: getStatus() });
}
