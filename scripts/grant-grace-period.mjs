// Gera um link de checkout do Stripe com N dias de trial (carência) para um
// cliente cujo cartão foi recusado e a assinatura foi cancelada.
//
// Por quê via Checkout Session (e não stripe.subscriptions.create direto)?
// O webhook do projeto (app/api/stripe/webhook/route.ts) só trata
// "checkout.session.completed", "customer.subscription.updated" e
// "customer.subscription.deleted" — NÃO trata "customer.subscription.created".
// Se você criar a subscription direto pela API, o Firestore não sincroniza
// sozinho. Gerando um novo Checkout Session, o fluxo cai exatamente no
// handler que já existe e é testado (sincroniza subscriptionStatus, planId,
// subscriptionCurrentPeriodEnd, trialEnd e reseta os créditos do plano).
//
// O cliente precisa abrir o link e confirmar com um cartão válido — mas não
// será cobrado até o trial acabar (subscription_data.trial_period_days).
//
// Uso (reaproveita as credenciais do seu .env):
//   node --env-file=.env scripts/grant-grace-period.mjs <email> <dias> [plano]
//
// Exemplos:
//   node --env-file=.env scripts/grant-grace-period.mjs cliente@exemplo.com 7
//   node --env-file=.env scripts/grant-grace-period.mjs cliente@exemplo.com 14 pro

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import Stripe from "stripe";

const [email, daysArg, planArg] = process.argv.slice(2);

if (!email || !daysArg) {
  console.error(
    "Uso: node --env-file=.env scripts/grant-grace-period.mjs <email> <dias> [plano: growth|pro]"
  );
  process.exit(1);
}

const days = parseInt(daysArg, 10);
if (!Number.isInteger(days) || days <= 0) {
  console.error("Dias inválido — informe um número inteiro positivo.");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

const PLAN_PRICES = {
  growth: process.env.STRIPE_GROWTH_PRICE_ID ?? "",
  pro: process.env.STRIPE_PRICE_ID ?? "",
};

async function main() {
  const snap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (snap.empty) {
    console.error(`Nenhum usuário encontrado com email ${email}`);
    process.exit(1);
  }

  const userDoc = snap.docs[0];
  const userId = userDoc.id;
  const userData = userDoc.data();

  const planId = planArg || userData.planId || "pro";
  const priceId = PLAN_PRICES[planId];
  if (!priceId) {
    console.error(`Plano "${planId}" não tem price ID configurado no .env`);
    process.exit(1);
  }

  let customerId = userData.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email,
      name: userData.companyName || userData.name || undefined,
      metadata: { userId },
    });
    customerId = customer.id;
    await userDoc.ref.update({ stripeCustomerId: customerId });
    console.log(`Cliente Stripe criado: ${customerId}`);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: days,
    },
    metadata: {
      userId,
      type: "main",
      planId,
    },
    success_url: `${appUrl}/dashboard/settings?checkout=success`,
    cancel_url: `${appUrl}/dashboard/settings?checkout=cancel`,
  });

  console.log(`\nUsuário: ${userId} (${email})`);
  console.log(`Plano: ${planId}`);
  console.log(`Carência: ${days} dia(s) sem cobrança`);
  console.log(`\nEnvie este link para o cliente confirmar o cartão:\n${checkoutSession.url}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
