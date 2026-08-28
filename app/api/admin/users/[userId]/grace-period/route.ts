import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/services/admin";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import { getPlanById } from "@/lib/services/plans-firestore";
import { syncSubscriptionToFirestore } from "@/lib/services/stripe-sync";
import { PlanId } from "@/lib/plans";

// POST /api/admin/users/[userId]/grace-period — grants N days without a
// charge on the customer's current plan, using the card already on file
// (canceling a subscription does not remove the customer's saved payment
// method in Stripe). No customer action needed: a trial subscription
// doesn't attempt to charge until it ends.
// - If a subscription still exists (not fully canceled), extends it by
//   pushing trial_end forward.
// - If it was fully canceled, creates a new one with trial_period_days.
// Firestore is synced directly here for the same reason as retry-charge:
// "customer.subscription.created" isn't handled by the webhook.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { userId } = await params;
  const body = await req.json().catch(() => ({}));
  const days = Number(body.days);
  if (!Number.isInteger(days) || days <= 0 || days > 90) {
    return NextResponse.json(
      { error: "Informe um número de dias entre 1 e 90" },
      { status: 400 }
    );
  }

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

  const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1, status: "all" });
  const sub = subs.data[0] ?? null;
  const trialEndTs = Math.floor(Date.now() / 1000) + days * 86400;

  try {
    const resultSub =
      sub && sub.status !== "canceled"
        ? await stripe.subscriptions.update(sub.id, {
            trial_end: trialEndTs,
            proration_behavior: "none",
          })
        : await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            trial_period_days: days,
          });

    await syncSubscriptionToFirestore(userId, resultSub, planId);

    return NextResponse.json({
      ok: true,
      trialEnd: resultSub.trial_end ? new Date(resultSub.trial_end * 1000).toISOString() : null,
    });
  } catch (err) {
    const stripeErr = err as Stripe.errors.StripeError;
    return NextResponse.json(
      { ok: false, error: stripeErr.message ?? "Erro ao conceder carência" },
      { status: 400 }
    );
  }
}
