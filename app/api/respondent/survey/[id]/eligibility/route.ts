import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRespondentSession } from "@/lib/services/respondents";
import { getSurvey } from "@/lib/services/surveys";
import { evaluateEligibility } from "@/lib/utils/eligibility";

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

    return NextResponse.json({
      eligible: result.eligible,
      failedRule: result.failedRule ?? null,
    });
  } catch (error) {
    console.error("Eligibility check error:", error);
    return NextResponse.json({ error: "Erro ao verificar elegibilidade" }, { status: 500 });
  }
}
