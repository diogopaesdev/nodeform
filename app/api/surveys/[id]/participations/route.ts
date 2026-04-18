import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey } from "@/lib/services/surveys";
import { getSurveyParticipations } from "@/lib/services/respondents";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.addons?.respondents?.active) {
      return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
    }

    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }
    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const participations = await getSurveyParticipations(surveyId, session.user.id);

    return NextResponse.json({ participations });
  } catch (error) {
    console.error("Error fetching participations:", error);
    return NextResponse.json({ error: "Erro ao buscar participações" }, { status: 500 });
  }
}
