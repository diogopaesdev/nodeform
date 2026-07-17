import { NextRequest, NextResponse } from "next/server";
import { getSurvey, recountResponses } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";

// Repara o contador de respostas (responseCount) a partir das respostas reais.
// Owner-only. Idempotente — pode ser chamado sempre que houver divergência.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== auth.workspaceId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const responseCount = await recountResponses(surveyId);

    return NextResponse.json({ responseCount });
  } catch (error) {
    console.error("Error recounting responses:", error);
    return NextResponse.json({ error: "Erro ao recalcular respostas" }, { status: 500 });
  }
}
