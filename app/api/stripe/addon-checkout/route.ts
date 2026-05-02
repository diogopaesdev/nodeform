import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const Schema = z.object({
  addonId: z.enum(["respondents", "surveyProgress"]),
});

const ADDON_PRICES: Record<string, string> = {
  respondents: process.env.STRIPE_ADDON_RESPONDENTS_PRICE_ID ?? "",
  surveyProgress: process.env.STRIPE_ADDON_SURVEY_PROGRESS_PRICE_ID ?? "",
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Addon inválido" }, { status: 400 });
  }

  const { addonId } = parsed.data;
  const priceId = ADDON_PRICES[addonId];

  if (!priceId) {
    return NextResponse.json({ error: "Addon não configurado" }, { status: 500 });
  }

  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();

  // Addons are exclusively for active Pro subscribers.
  // Read from Firestore — never rely on JWT which can be stale.
  const currentPlanId: string = userData?.planId ?? "pro";
  const currentStatus: string = userData?.subscriptionStatus ?? "";

  if (currentPlanId !== "pro" || currentStatus !== "active") {
    return NextResponse.json(
      { error: "Módulos adicionais estão disponíveis apenas para assinantes ativos do Plano Pro" },
      { status: 403 }
    );
  }

  let customerId = userData?.stripeCustomerId as string | undefined;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: userData?.companyName || session.user.name || undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await db.collection("users").doc(session.user.id).update({
      stripeCustomerId: customerId,
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { type: "addon", addonId, userId: session.user.id },
    success_url: `${appUrl}/dashboard/settings/integrations?addon_success=true`,
    cancel_url: `${appUrl}/dashboard/settings/integrations`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
