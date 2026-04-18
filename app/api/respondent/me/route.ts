import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getRespondentSession } from "@/lib/services/respondents";

const SESSION_COOKIE = "respondent-session";

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ respondent: null }, { status: 200 });
    }

    const session = await getRespondentSession(token);

    if (!session) {
      return NextResponse.json({ respondent: null }, { status: 200 });
    }

    const { respondent } = session;

    return NextResponse.json({
      respondent: {
        id: respondent.id,
        name: respondent.name,
        email: respondent.email,
        workspaceId: respondent.workspaceId,
      },
    });
  } catch (error) {
    console.error("Respondent me error:", error);
    return NextResponse.json({ error: "Erro ao verificar sessão" }, { status: 500 });
  }
}
