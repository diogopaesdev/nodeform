import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const ADDON_PRICES: Record<string, string> = {
  respondents: process.env.STRIPE_ADDON_RESPONDENTS_PRICE_ID ?? "",
  surveyProgress: process.env.STRIPE_ADDON_SURVEY_PROGRESS_PRICE_ID ?? "",
};

const VALID_ADDON_IDS = ["respondents", "surveyProgress"] as const;

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedAddons: string[] = Array.isArray(body.addons)
    ? body.addons.filter((id: string) => VALID_ADDON_IDS.includes(id as typeof VALID_ADDON_IDS[number]))
    : [];

  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();

  // Reutilizar customer existente ou criar um novo
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

  // Só oferece trial se o usuário nunca teve um antes
  const alreadyHadTrial = !!userData?.trialEnd;

  // Build line items: main plan + any selected addons with valid price IDs
  const addonLineItems = requestedAddons
    .map((id) => ADDON_PRICES[id])
    .filter(Boolean)
    .map((priceId) => ({ price: priceId, quantity: 1 }));

  const metadata: Record<string, string> = {
    userId: session.user.id,
    type: "main",
  };
  if (requestedAddons.length > 0) {
    metadata.addonsToActivate = requestedAddons.join(",");
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      { price: process.env.STRIPE_PRICE_ID!, quantity: 1 },
      ...addonLineItems,
    ],
    ...(alreadyHadTrial ? {} : {
      subscription_data: {
        trial_period_days: 7,
      },
    }),
    metadata,
    success_url: `${appUrl}/dashboard/settings?checkout=success`,
    cancel_url: `${appUrl}/dashboard/settings?checkout=cancel`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
