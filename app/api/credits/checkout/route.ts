import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { CREDIT_PRICE_BRL, CREDIT_PACKAGE_SIZE } from "@/lib/credits";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { quantity = CREDIT_PACKAGE_SIZE } = await req.json().catch(() => ({}));
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: "brl",
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: CREDIT_PRICE_BRL * 100, // centavos
            product_data: {
              name: "Créditos IA — SurveyFlow",
              description: `${quantity} crédito${quantity !== 1 ? "s" : ""} para funcionalidades de IA`,
              images: [],
            },
          },
          quantity,
        },
      ],
      metadata: {
        userId: session.user.id,
        creditAmount: String(quantity),
      },
      success_url: `${appUrl}/dashboard?credits=success`,
      cancel_url: `${appUrl}/dashboard?credits=cancelled`,
      payment_method_types: ["card"],
      locale: "pt-BR",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json({ error: "Erro ao criar sessão de pagamento" }, { status: 500 });
  }
}
