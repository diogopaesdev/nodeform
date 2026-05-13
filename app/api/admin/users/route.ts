import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/services/admin";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { getAllPlans } from "@/lib/services/plans-firestore";

const BASE_PLAN_IDS = ["growth", "pro", "enterprise"];
const VALID_STATUSES = ["active", "trialing", "past_due", "inactive", null];

// GET /api/admin/users?q=email — search users (max 20)
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  const { db } = getFirebaseAdmin();

  let users: {
    id: string;
    name: string | null;
    email: string | null;
    planId: string | null;
    subscriptionStatus: string | null;
    trialEnd: string | null;
  }[] = [];

  if (q) {
    // Firestore doesn't support LIKE — fetch up to 100 docs and filter server-side
    const snap = await db.collection("users").limit(100).get();
    users = snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name ?? null,
          email: data.email ?? null,
          planId: data.planId ?? null,
          subscriptionStatus: data.subscriptionStatus ?? null,
          trialEnd: data.trialEnd ?? null,
        };
      })
      .filter((u) => u.email?.toLowerCase().includes(q))
      .slice(0, 20);
  } else {
    const snap = await db.collection("users").orderBy("createdAt", "desc").limit(20).get();
    users = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name ?? null,
        email: data.email ?? null,
        planId: data.planId ?? null,
        subscriptionStatus: data.subscriptionStatus ?? null,
        trialEnd: data.trialEnd ?? null,
      };
    });
  }

  return NextResponse.json({ users });
}

// PATCH /api/admin/users — assign plan/status to a user
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await req.json();
  const { userId, planId, subscriptionStatus } = body;

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId é obrigatório" }, { status: 400 });
  }

  // Validate planId against base plans + Firestore custom plans
  if (planId !== undefined) {
    const firestorePlans = await getAllPlans();
    const validPlanIds = Array.from(
      new Set([...BASE_PLAN_IDS, ...firestorePlans.map((p) => p.id)])
    );
    if (!validPlanIds.includes(planId)) {
      return NextResponse.json(
        { error: `planId inválido. Valores permitidos: ${validPlanIds.join(", ")}` },
        { status: 400 }
      );
    }
  }

  if (subscriptionStatus !== undefined && !VALID_STATUSES.includes(subscriptionStatus)) {
    return NextResponse.json(
      { error: `subscriptionStatus inválido. Valores permitidos: ${VALID_STATUSES.filter(Boolean).join(", ")}, null` },
      { status: 400 }
    );
  }

  const { db } = getFirebaseAdmin();
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (planId !== undefined) update.planId = planId;
  if (subscriptionStatus !== undefined) update.subscriptionStatus = subscriptionStatus;

  await db.collection("users").doc(userId).update(update);

  return NextResponse.json({ ok: true });
}
