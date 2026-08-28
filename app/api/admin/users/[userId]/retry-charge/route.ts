import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/services/admin";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import { getPlanById } from "@/lib/services/plans-firestore";
import { syncSubscriptionToFirestore } from "@/lib/services/stripe-sync";
import { PlanId } from "@/lib/plans";

// POST /api/admin/users/[userId]/retry-charge — attempts to charge the
// customer's card on file for their CURRENT plan (no plan change).
// - If a subscription still exists with an open invoice (e.g. past_due),
//   retries payment on that invoice.
// - If the subscription was fully canceled, creates a new one on the same
//   plan and forces a synchronous charge attempt (payment_behavior:
//   "error_if_incomplete" — on failure Stripe does not persist the
//   subscription, so there's nothing to clean up).
// Firestore is synced directly in this route rather than relying on the
// webhook, since a freshly created subscription fires
// "customer.subscription.created", which the webhook does not handle.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { userId } = await params;
  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(userId).get();
  if (!userDoc.exists) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  const userData = userDoc.data()!;
  const customerId = userData.stripeCustomerId as string | undefined;
  if (!customerId) {
    return NextResponse.json({ error: "Usuário sem cliente Stripe" }, { status: 400 });
  }

  const planId = (userData.planId as PlanId | undefined) ?? "growth";
  const plan = await getPlanById(planId);
  const priceId = plan?.stripePriceId;
  if (!priceId) {
    return NextResponse.json(
      { error: `Plano "${planId}" não tem price ID configurado` },
      { status: 400 }
    );
  }

  try {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: "all",
      expand: ["data.latest_invoice"],
    });
    const sub = subs.data[0] ?? null;

    if (sub && sub.status !== "canceled") {
      const invoice =
        sub.latest_invoice && typeof sub.latest_invoice !== "string" ? sub.latest_invoice : null;
      if (invoice && invoice.status === "open") {
        await stripe.invoices.pay(invoice.id);
      }
      const refreshed = await stripe.subscriptions.retrieve(sub.id);
      const { subscriptionStatus } = await syncSubscriptionToFirestore(userId, refreshed, planId);
      return NextResponse.json({ ok: true, status: subscriptionStatus });
    }

    const newSub = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "error_if_incomplete",
    });
    const { subscriptionStatus } = await syncSubscriptionToFirestore(userId, newSub, planId);
    return NextResponse.json({ ok: true, status: subscriptionStatus });
  } catch (err) {
    const stripeErr = err as Stripe.errors.StripeError;
    return NextResponse.json(
      { ok: false, error: stripeErr.message ?? "Cobrança recusada" },
      { status: 402 }
    );
  }
}
