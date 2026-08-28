import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdmin } from "@/lib/services/admin";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";
import { getPlanByStripePriceId } from "@/lib/services/plans-firestore";

// GET /api/admin/users/[userId]/billing — real Stripe state for the recovery modal:
// what actually happened (last payment error, invoice status) plus the live
// subscription, not just the Firestore snapshot which may lag or have been reset.
export async function GET(
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

  const customerId = userDoc.data()?.stripeCustomerId as string | undefined;
  if (!customerId) {
    return NextResponse.json({ hasStripeCustomer: false });
  }

  let sub: Stripe.Subscription | null = null;
  let invoice: Stripe.Invoice | null = null;
  try {
    const subs = await stripe.subscriptions.list({ customer: customerId, limit: 1, status: "all" });
    sub = subs.data[0] ?? null;

    // Fetch the invoice separately (rather than expanding it off the
    // subscriptions list) to stay within Stripe's 4-level expand depth limit —
    // "data.latest_invoice.payments.data.payment.payment_intent" exceeds it
    // and Stripe rejects the request outright.
    const latestInvoiceId = sub?.latest_invoice
      ? typeof sub.latest_invoice === "string"
        ? sub.latest_invoice
        : sub.latest_invoice.id
      : null;
    if (latestInvoiceId) {
      invoice = await stripe.invoices.retrieve(latestInvoiceId, {
        expand: ["payments.data.payment.payment_intent"],
      });
    }
  } catch (err) {
    const stripeErr = err as Stripe.errors.StripeError;
    return NextResponse.json(
      { error: stripeErr.message ?? "Erro ao consultar o Stripe" },
      { status: 502 }
    );
  }

  const invoicePayment = invoice?.payments?.data[0];
  const paymentIntent =
    invoicePayment?.payment.payment_intent && typeof invoicePayment.payment.payment_intent !== "string"
      ? invoicePayment.payment.payment_intent
      : null;
  const lastPaymentError = paymentIntent?.last_payment_error ?? invoice?.last_finalization_error ?? null;

  let matchedPlanId: string | null = null;
  const priceId = sub?.items.data[0]?.price.id;
  if (priceId) {
    const plan = await getPlanByStripePriceId(priceId);
    matchedPlanId = plan?.id ?? null;
  }

  const periodEnd =
    sub?.items.data[0]?.current_period_end ??
    (sub as unknown as Record<string, number> | null)?.current_period_end;

  return NextResponse.json({
    hasStripeCustomer: true,
    subscription: sub
      ? {
          id: sub.id,
          status: sub.status,
          planId: matchedPlanId,
          trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
          currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancelAt: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
          canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        }
      : null,
    lastInvoice: invoice
      ? {
          status: invoice.status,
          amountDue: invoice.amount_due,
          currency: invoice.currency,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
        }
      : null,
    lastPaymentError: lastPaymentError
      ? {
          message: lastPaymentError.message ?? null,
          declineCode: lastPaymentError.decline_code ?? null,
          code: lastPaymentError.code ?? null,
        }
      : null,
  });
}
