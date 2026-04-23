import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey, getSurveyResponses, deleteResponse } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";

// GET - Buscar respostas de uma pesquisa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== auth.workspaceId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const responses = await getSurveyResponses(surveyId);

    return NextResponse.json({ responses });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Erro ao buscar respostas" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar uma resposta específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: surveyId } = await params;
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get("responseId");

    if (!responseId) {
      return NextResponse.json(
        { error: "ID da resposta não informado" },
        { status: 400 }
      );
    }

    // Verificar se a pesquisa pertence ao usuário
    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json(
        { error: "Pesquisa não encontrada" },
        { status: 404 }
      );
    }

    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Deletar resposta
    await deleteResponse(surveyId, responseId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      { error: "Erro ao deletar resposta" },
      { status: 500 }
    );
  }
}
