import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRespondentSession, getProgress, saveProgress, deleteProgress } from "@/lib/services/respondents";
import { getSurvey } from "@/lib/services/surveys";
import { hasAddon } from "@/lib/services/addons";

const SESSION_COOKIE = "respondent-session";

async function getRespondentSessionFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getRespondentSession(token);
}

async function isSurveyProgressEnabled(surveyId: string): Promise<boolean> {
  const survey = await getSurvey(surveyId);
  if (!survey) return false;
  return hasAddon(survey.userId, "surveyProgress");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;

    const [session, enabled] = await Promise.all([
      getRespondentSessionFromCookies(),
      isSurveyProgressEnabled(surveyId),
    ]);

    if (!session || !enabled) return NextResponse.json({ progress: null });

    const progress = await getProgress(session.respondent.id, surveyId);
    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Get progress error:", error);
    return NextResponse.json({ error: "Erro ao buscar progresso" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;

    const [session, enabled] = await Promise.all([
      getRespondentSessionFromCookies(),
      isSurveyProgressEnabled(surveyId),
    ]);

    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    // Silently no-op if addon not active — client doesn't need to know
    if (!enabled) return NextResponse.json({ ok: true });

    const body = await request.json();
    await saveProgress(session.respondent.id, surveyId, {
      currentNodeId: body.currentNodeId,
      answers: body.answers,
      totalScore: body.totalScore,
      visitedNodeIds: body.visitedNodeIds,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Save progress error:", error);
    return NextResponse.json({ error: "Erro ao salvar progresso" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;
    const session = await getRespondentSessionFromCookies();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Always allow deletion even if addon was deactivated (cleanup)
    await deleteProgress(session.respondent.id, surveyId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete progress error:", error);
    return NextResponse.json({ error: "Erro ao deletar progresso" }, { status: 500 });
  }
}
