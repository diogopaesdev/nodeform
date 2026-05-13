import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/services/admin";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { createPlan } from "@/lib/services/plans-firestore";

const SEED_PLANS = [
  {
    id: "growth",
    name: "Growth",
    stripePriceId: process.env.STRIPE_GROWTH_PRICE_ID ?? null,
    limits: {
      surveys: 5,
      responsesPerMonth: 500,
      aiCreditsPerMonth: 3,
      userTemplates: 5,
      collaborators: 2,
      canPurchaseAddons: false,
      includesAllAddons: false,
      hasWhiteLabel: false,
    },
    isCustom: false,
    active: true,
  },
  {
    id: "pro",
    name: "Pro",
    stripePriceId: process.env.STRIPE_PRICE_ID ?? null,
    limits: {
      surveys: null,
      responsesPerMonth: null,
      aiCreditsPerMonth: 10,
      userTemplates: 10,
      collaborators: 10,
      canPurchaseAddons: true,
      includesAllAddons: false,
      hasWhiteLabel: true,
    },
    isCustom: false,
    active: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
    limits: {
      surveys: null,
      responsesPerMonth: null,
      aiCreditsPerMonth: 50,
      userTemplates: null,
      collaborators: null,
      canPurchaseAddons: false,
      includesAllAddons: true,
      hasWhiteLabel: true,
    },
    isCustom: false,
    active: true,
  },
];

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { db } = getFirebaseAdmin();
  const results: { id: string; status: string }[] = [];

  for (const plan of SEED_PLANS) {
    const existing = await db.collection("plans").doc(plan.id).get();
    if (existing.exists) {
      results.push({ id: plan.id, status: "já existe (skipped)" });
      continue;
    }
    await createPlan(plan);
    results.push({ id: plan.id, status: "criado" });
  }

  return NextResponse.json({ results });
}
