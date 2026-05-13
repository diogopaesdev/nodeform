import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/services/admin";
import { getAllPlans, createPlan } from "@/lib/services/plans-firestore";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const plans = await getAllPlans();
  return NextResponse.json({ plans });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await req.json();

  if (!body.id || !body.name || !body.limits) {
    return NextResponse.json({ error: "id, name e limits são obrigatórios" }, { status: 400 });
  }

  if (!/^[a-z0-9_-]+$/.test(body.id)) {
    return NextResponse.json({ error: "ID deve conter apenas letras minúsculas, números, _ e -" }, { status: 400 });
  }

  const plan = await createPlan({
    id: body.id,
    name: body.name,
    stripePriceId: body.stripePriceId ?? null,
    limits: body.limits,
    isCustom: body.isCustom ?? true,
    active: body.active ?? true,
  });

  return NextResponse.json({ plan }, { status: 201 });
}
