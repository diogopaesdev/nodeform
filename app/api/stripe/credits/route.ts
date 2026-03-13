import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { CREDIT_PRICE_BRL, CREDIT_PACKAGE_SIZE } from "@/lib/credits";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quantity = CREDIT_PACKAGE_SIZE } = await req.json().catch(() => ({}));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: CREDIT_PRICE_BRL * 100,
          product_data: {
            name: "Créditos IA — SurveyFlow",
            description: `${quantity} crédito${quantity !== 1 ? "s" : ""} para funcionalidades de IA`,
          },
        },
        quantity,
      },
    ],
    metadata: {
      userId: session.user.id,
      creditAmount: String(quantity),
      type: "credits",
    },
    success_url: `${appUrl}/dashboard?credits=success`,
    cancel_url: `${appUrl}/dashboard?credits=cancelled`,
    locale: "pt-BR",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
