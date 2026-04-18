import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRespondentSession, checkParticipation } from "@/lib/services/respondents";

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
      return NextResponse.json({ status: "unauthenticated" }, { status: 200 });
    }

    const session = await getRespondentSession(token);
    if (!session) {
      return NextResponse.json({ status: "unauthenticated" }, { status: 200 });
    }

    const participation = await checkParticipation(session.respondent.id, surveyId);

    if (!participation) {
      return NextResponse.json({ status: "not_started" });
    }

    return NextResponse.json({ status: participation.status, participationId: participation.id });
  } catch (error) {
    console.error("Respondent survey status error:", error);
    return NextResponse.json({ error: "Erro ao verificar status" }, { status: 500 });
  }
}
