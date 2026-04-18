import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSurvey } from "@/lib/services/surveys";
import { getRespondentByEmail, generateRespondentOTP } from "@/lib/services/respondents";
import { sendRespondentLoginCode } from "@/lib/email";

const Schema = z.object({
  email: z.string().email(),
  surveyId: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { email, surveyId } = parsed.data;

    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }

    if (!survey.requiresRespondentLogin) {
      return NextResponse.json({ error: "Esta pesquisa não requer autenticação" }, { status: 400 });
    }

    const workspaceId = survey.userId;
    const respondent = await getRespondentByEmail(workspaceId, email);

    if (!respondent) {
      return NextResponse.json(
        { error: "E-mail não cadastrado nesta pesquisa. Entre em contato com o organizador." },
        { status: 404 }
      );
    }

    const code = await generateRespondentOTP(respondent.id);
    await sendRespondentLoginCode(email, respondent.name, code, survey.title);

    return NextResponse.json({ message: "Código enviado para seu e-mail." });
  } catch (error) {
    console.error("Respondent request-otp error:", error);
    return NextResponse.json({ error: "Erro ao enviar código" }, { status: 500 });
  }
}
