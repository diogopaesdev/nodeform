import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserTemplates, countUserTemplates, createUserTemplate } from "@/lib/services/user-templates";
import { getActiveUserPlan } from "@/lib/services/plan";
import { PLANS } from "@/lib/plans";

// GET /api/user/templates - List user templates
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const templates = await getUserTemplates(session.user.id);
  return NextResponse.json({ templates });
}

// POST /api/user/templates - Save survey as template
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { title, nodes, edges } = body;

  if (!title?.trim() || !Array.isArray(nodes) || !Array.isArray(edges)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { planId, subscriptionStatus } = await getActiveUserPlan(session.user.id);
  const isActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  const effectivePlanId = isActive ? planId : "growth";

  const limit = PLANS[effectivePlanId]?.limits.userTemplates;
  if (limit !== null) {
    const count = await countUserTemplates(session.user.id);
    if (count >= limit) {
      return NextResponse.json(
        { error: `Limite de ${limit} templates atingido para o plano ${effectivePlanId}`, code: "TEMPLATE_LIMIT" },
        { status: 403 }
      );
    }
  }

  const template = await createUserTemplate(session.user.id, title.trim(), nodes, edges);
  return NextResponse.json({ template }, { status: 201 });
}
