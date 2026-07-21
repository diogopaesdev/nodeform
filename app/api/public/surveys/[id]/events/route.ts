import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSurvey } from "@/lib/services/surveys";
import { getRespondentSession } from "@/lib/services/respondents";
import { logSurveyEvent } from "@/lib/services/survey-events";
import { PUBLIC_SURVEY_EVENT_TYPES, SurveyEventType } from "@/types/survey-event";

const SESSION_COOKIE = "respondent-session";

// Registra um evento público de atividade (ex.: "opened"). Não exige auth de
// admin; o workspaceId vem sempre do documento da pesquisa (nunca do cliente).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const body = await request.json().catch(() => ({}));
    const type = body?.type as SurveyEventType | undefined;

    if (!type || !PUBLIC_SURVEY_EVENT_TYPES.includes(type)) {
      return NextResponse.json({ error: "Tipo de evento inválido" }, { status: 400 });
    }

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });

    // Anexa dados do respondente se houver sessão (opcional).
    let respondentId: string | undefined;
    let respondentName: string | undefined;
    let respondentEmail: string | undefined;
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (token) {
      const session = await getRespondentSession(token);
      if (session) {
        respondentId = session.respondent.id;
        respondentName = session.respondent.name;
        respondentEmail = session.respondent.email;
      }
    }

    await logSurveyEvent({
      surveyId,
      workspaceId: survey.userId,
      type,
      respondentId,
      respondentName,
      respondentEmail,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Log survey event error:", error);
    // Evento de telemetria: nunca deve quebrar o fluxo do respondente.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
