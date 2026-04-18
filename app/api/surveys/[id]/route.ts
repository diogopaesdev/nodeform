import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey, updateSurvey, deleteSurvey, saveSurveyContent } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";

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
    if (survey.userId !== auth.workspaceId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

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

    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();

    // Se tem nodes/edges, salvar conteúdo
    if (body.nodes !== undefined || body.edges !== undefined) {
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
