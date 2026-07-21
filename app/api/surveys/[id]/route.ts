import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey, updateSurvey, deleteSurvey, saveSurveyContent } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { getActiveUserPlan } from "@/lib/services/plan";
import { getCollaboratorAccessForUser } from "@/lib/services/collaborators";

// GET /api/surveys/[id] - Buscar pesquisa específica
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(req);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id } = await params;
    const survey = await getSurvey(id);

    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });

    const isOwner = survey.userId === auth.workspaceId;
    if (!isOwner) {
      const collaboratorRole = await getCollaboratorAccessForUser(id, auth.workspaceId);
      if (!collaboratorRole) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
      return NextResponse.json({ survey, collaboratorRole, isCollaborator: true });
    }

    return NextResponse.json({ survey });
  } catch (error) {
    console.error("Error fetching survey:", error);
    return NextResponse.json({ error: "Erro ao buscar pesquisa" }, { status: 500 });
  }
}

// PATCH /api/surveys/[id] - Atualizar pesquisa
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const survey = await getSurvey(id);

    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }

    const isOwner = survey.userId === session.user.id;
    if (!isOwner) {
      const collaboratorRole = await getCollaboratorAccessForUser(id, session.user.id);
      if (collaboratorRole !== "editor") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    const body = await req.json();

    // Read plan from Firestore — never trust JWT for security decisions
    const { planId, subscriptionStatus } = await getActiveUserPlan(session.user.id);
    const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
    const effectivePlanId = isSubscriptionActive ? planId : "growth";

    // Growth plan (or inactive subscription) cannot enable scoring
    if (effectivePlanId === "growth" && body.enableScoring === true) {
      body.enableScoring = false;
    }

    // Se tem nodes/edges, salvar conteúdo
    if (body.nodes !== undefined || body.edges !== undefined) {
      // Proteção contra orfanamento de respostas: as respostas guardam apenas o
      // `id` da opção/pergunta (não o texto), então remover uma opção ou uma
      // pergunta de uma pesquisa que já tem respostas desalinha a análise de
      // forma irreversível. Editar texto/ordem/pontuação é seguro e passa livre.
      // O admin pode confirmar a remoção reenviando com `force: true`.
      if ((survey.responseCount ?? 0) > 0 && body.nodes !== undefined && body.force !== true) {
        const questionTypes = ["singleChoice", "multipleChoice", "rating", "textInput"];
        const isQuestion = (n: { data?: { type?: string } }) =>
          questionTypes.includes(n?.data?.type ?? "");

        const oldNodes = (survey.nodes ?? []).filter(isQuestion);
        const newById = new Map(
          (body.nodes as Array<{ id: string; data?: { options?: Array<{ id: string }> } }>).map(
            (n) => [n.id, n]
          )
        );

        const removedNodes: string[] = [];
        const removedOptions: { nodeId: string; optionId: string }[] = [];

        for (const oldNode of oldNodes) {
          const newNode = newById.get(oldNode.id);
          if (!newNode) {
            removedNodes.push(oldNode.id);
            continue;
          }
          const oldOptions = (oldNode.data as { options?: Array<{ id: string }> })?.options ?? [];
          if (oldOptions.length === 0) continue;
          const newOptionIds = new Set((newNode.data?.options ?? []).map((o) => o.id));
          for (const opt of oldOptions) {
            if (!newOptionIds.has(opt.id)) {
              removedOptions.push({ nodeId: oldNode.id, optionId: opt.id });
            }
          }
        }

        if (removedNodes.length > 0 || removedOptions.length > 0) {
          return NextResponse.json(
            {
              error: "Esta alteração remove perguntas ou opções de uma pesquisa que já tem respostas.",
              code: "WOULD_ORPHAN_RESPONSES",
              responseCount: survey.responseCount,
              removedNodes,
              removedOptions,
            },
            { status: 409 }
          );
        }
      }

      await saveSurveyContent(
        id,
        body.nodes ?? survey.nodes,
        body.edges ?? survey.edges,
        body.title,
        body.enableScoring,
        body.description,
        body.timeLimit,
        body.prize,
        body.requiresRespondentLogin,
        body.maxResponses,
        body.eligibilityRules
      );
    } else {
      // Atualizar outros campos
      await updateSurvey(id, body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating survey:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pesquisa" },
      { status: 500 }
    );
  }
}

// DELETE /api/surveys/[id] - Deletar pesquisa
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const survey = await getSurvey(id);

    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }

    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    await deleteSurvey(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting survey:", error);
    return NextResponse.json(
      { error: "Erro ao deletar pesquisa" },
      { status: 500 }
    );
  }
}
