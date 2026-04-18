import { NextRequest, NextResponse } from "next/server";
import { getSurvey } from "@/lib/services/surveys";
import { getSurveyParticipations } from "@/lib/services/respondents";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { hasAddon } from "@/lib/services/addons";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (!(await hasAddon(auth.workspaceId, "respondents"))) {
      return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
    }

    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== auth.workspaceId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const participations = await getSurveyParticipations(surveyId, auth.workspaceId);

    return NextResponse.json({ participations });
  } catch (error) {
    console.error("Error fetching participations:", error);
    return NextResponse.json({ error: "Erro ao buscar participações" }, { status: 500 });
  }
}
