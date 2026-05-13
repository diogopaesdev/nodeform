import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/services/admin";
import { getPlanById, updatePlan, deletePlan } from "@/lib/services/plans-firestore";

const BASE_PLANS = ["growth", "pro", "enterprise"];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { planId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

  return NextResponse.json({ plan });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { planId } = await params;
  const body = await req.json();
  delete body.id;
  delete body.createdAt;

  await updatePlan(planId, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { planId } = await params;

  if (BASE_PLANS.includes(planId)) {
    return NextResponse.json({ error: "Planos base não podem ser excluídos" }, { status: 400 });
  }

  await deletePlan(planId);
  return NextResponse.json({ success: true });
}
