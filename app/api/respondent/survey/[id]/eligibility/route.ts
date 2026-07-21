import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRespondentSession } from "@/lib/services/respondents";
import { getSurvey } from "@/lib/services/surveys";
import { evaluateEligibility } from "@/lib/utils/eligibility";
import { logSurveyEvent } from "@/lib/services/survey-events";

const SESSION_COOKIE = "respondent-session";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ eligible: false, reason: "unauthenticated" });
    }

    const session = await getRespondentSession(token);
    if (!session) {
      return NextResponse.json({ eligible: false, reason: "unauthenticated" });
    }

    const survey = await getSurvey(surveyId);
    if (!survey?.eligibilityRules || survey.eligibilityRules.length === 0) {
      return NextResponse.json({ eligible: true });
    }

    const result = evaluateEligibility(session.respondent, survey.eligibilityRules);

    // Registra o bloqueio para aparecer na aba de Atividades (antes não deixava
    // rastro nenhum). Não bloqueia a resposta se a telemetria falhar.
    if (!result.eligible) {
      logSurveyEvent({
        surveyId,
        workspaceId: survey.userId,
        type: "blocked_ineligible",
        respondentId: session.respondent.id,
        respondentName: session.respondent.name,
        respondentEmail: session.respondent.email,
        reason: result.failedRule?.label ?? result.failedRule?.field,
      }).catch(() => {});
    }

    return NextResponse.json({
      eligible: result.eligible,
      failedRule: result.failedRule ?? null,
    });
  } catch (error) {
    console.error("Eligibility check error:", error);
    return NextResponse.json({ error: "Erro ao verificar elegibilidade" }, { status: 500 });
  }
}
