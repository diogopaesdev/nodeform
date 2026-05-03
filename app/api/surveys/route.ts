import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSurvey, getUserSurveys, getDashboardStats } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { SURVEY_TEMPLATES, cloneTemplate } from "@/lib/templates";
import { PLANS } from "@/lib/plans";
import { getActiveUserPlan } from "@/lib/services/plan";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import type { UserTemplate } from "@/lib/services/user-templates";

// GET /api/surveys - Listar pesquisas do usuário
export async function GET(req: NextRequest) {
  try {
    const auth = await resolveWorkspace(req);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const includeStats = searchParams.get("stats") === "true";

    const surveys = await getUserSurveys(auth.workspaceId);

    if (includeStats && auth.source === "session") {
      const stats = await getDashboardStats(auth.workspaceId);
      return NextResponse.json({ surveys, stats });
    }

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pesquisas" },
      { status: 500 }
    );
  }
}

// POST /api/surveys - Criar nova pesquisa (em branco ou a partir de template)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const templateId: string | undefined = body.templateId;
    const userTemplateId: string | undefined = body.userTemplateId;

    // Read plan from Firestore — never trust JWT for security decisions
    const { planId, subscriptionStatus } = await getActiveUserPlan(session.user.id);
    const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
    const effectivePlanId = isSubscriptionActive ? planId : "growth";

    // Enforce survey count limit based on effective plan
    const planLimits = PLANS[effectivePlanId]?.limits;
    if (planLimits?.surveys !== null && planLimits?.surveys !== undefined) {
      const existing = await getUserSurveys(session.user.id);
      if (existing.length >= planLimits.surveys) {
        return NextResponse.json(
          { error: `Limite de ${planLimits.surveys} pesquisas atingido para o plano ${effectivePlanId}` },
          { status: 403 }
        );
      }
    }

    if (templateId) {
      // Templates require active paid subscription (no trial)
      if (subscriptionStatus !== "active") {
        return NextResponse.json(
          { error: "Templates disponíveis apenas em planos pagos ativos" },
          { status: 403 }
        );
      }

      const template = SURVEY_TEMPLATES.find((t) => t.id === templateId);
      if (!template) {
        return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
      }

      // Enforce template complexity access per plan
      const accessibleComplexities: string[] = ["basic"];
      if (planId === "pro" || planId === "enterprise") accessibleComplexities.push("intermediate");
      if (planId === "enterprise") accessibleComplexities.push("advanced");

      if (!accessibleComplexities.includes(template.complexity)) {
        return NextResponse.json(
          { error: "Este template não está disponível no seu plano" },
          { status: 403 }
        );
      }

      const { nodes, edges, title } = cloneTemplate(template);
      const survey = await createSurvey(session.user.id, title, nodes, edges);
      return NextResponse.json({ survey }, { status: 201 });
    }

    if (userTemplateId) {
      const { db } = getFirebaseAdmin();
      const doc = await db
        .collection("users")
        .doc(session.user.id)
        .collection("userTemplates")
        .doc(userTemplateId)
        .get();

      if (!doc.exists) {
        return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
      }

      const userTpl = doc.data() as UserTemplate;
      const ts = Date.now();
      const idMap = new Map<string, string>();
      const nodes = userTpl.nodes.map((n, i) => {
        const newId = `node_${ts}_${i}`;
        idMap.set(n.id, newId);
        return { ...n, id: newId };
      });
      const edges = userTpl.edges.map((e, i) => ({
        ...e,
        id: `edge_${ts}_${i}`,
        source: idMap.get(e.source) ?? e.source,
        target: idMap.get(e.target) ?? e.target,
      }));

      const survey = await createSurvey(session.user.id, userTpl.title, nodes, edges);
      return NextResponse.json({ survey }, { status: 201 });
    }

    const title = body.title || "Nova Pesquisa";
    const survey = await createSurvey(session.user.id, title);
    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    console.error("Error creating survey:", error);
    return NextResponse.json(
      { error: "Erro ao criar pesquisa" },
      { status: 500 }
    );
  }
}
