import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === "paid") {
      const userId = session.metadata?.userId;
      const creditAmount = parseInt(session.metadata?.creditAmount || "0", 10);

      if (userId && creditAmount > 0) {
        try {
          await addCredits(userId, creditAmount);
          console.log(`Added ${creditAmount} credits to user ${userId}`);
        } catch (error) {
          console.error("Error adding credits:", error);
          return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
