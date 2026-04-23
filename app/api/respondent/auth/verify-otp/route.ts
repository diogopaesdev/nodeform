import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { getSurvey } from "@/lib/services/surveys";
import {
  verifyRespondentOTP,
  createRespondentSession,
} from "@/lib/services/respondents";

const Schema = z.object({
  email: z.string().email(),
  surveyId: z.string().min(1).max(100),
  code: z.string().length(6),
});

const SESSION_COOKIE = "respondent-session";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { email, surveyId, code } = parsed.data;

    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }

    const workspaceId = survey.userId;
    const respondent = await verifyRespondentOTP(workspaceId, email, code);

    if (!respondent) {
      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 401 }
      );
    }

    const token = await createRespondentSession(respondent.id, workspaceId);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    return NextResponse.json({
      respondent: {
        id: respondent.id,
        name: respondent.name,
        email: respondent.email,
      },
    });
  } catch (error) {
    console.error("Respondent verify-otp error:", error);
    return NextResponse.json({ error: "Erro ao verificar código" }, { status: 500 });
  }
}
