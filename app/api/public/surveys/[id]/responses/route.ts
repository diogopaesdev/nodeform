import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { saveResponse, getSurvey } from "@/lib/services/surveys";
import {
  getRespondentSession,
  checkParticipation,
  completeParticipation,
  createParticipation,
} from "@/lib/services/respondents";

const SESSION_COOKIE = "respondent-session";

const AnswerSchema = z.object({
  nodeId: z.string().max(100),
  selectedOptionId: z.string().max(100).optional(),
  selectedOptionIds: z.array(z.string().max(100)).max(50).optional(),
  ratingValue: z.number().int().min(0).max(100).optional(),
  respondentName: z.string().max(200).optional(),
  respondentEmail: z.string().max(200).optional(),
  answeredAt: z.union([z.string(), z.date()]).transform((v) => new Date(v)),
});

const ResponseSchema = z.object({
  answers: z.array(AnswerSchema).max(200),
  totalScore: z.number().min(0).max(100000).default(0),
  path: z.array(z.string().max(100)).max(200).default([]),
  respondentName: z.string().max(200).optional(),
  respondentEmail: z.union([z.string().email(), z.literal(""), z.undefined()]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }

    if (survey.status === "finished") {
      return NextResponse.json({ error: "Esta pesquisa foi encerrada" }, { status: 410 });
    }

    const parsed = ResponseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados de resposta inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { answers, totalScore, path, respondentName, respondentEmail } = parsed.data;

    let respondentId: string | undefined;

    // Se a pesquisa exige login, validar sessão e participação única
    if (survey.requiresRespondentLogin) {
      const cookieStore = await cookies();
      const token = cookieStore.get(SESSION_COOKIE)?.value;

      if (!token) {
        return NextResponse.json({ error: "Autenticação necessária" }, { status: 401 });
      }

      const session = await getRespondentSession(token);
      if (!session) {
        return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      // Bloquear participação duplicada
      const existing = await checkParticipation(session.respondent.id, surveyId);
      if (existing?.status === "completed") {
        return NextResponse.json({ error: "Você já participou desta pesquisa" }, { status: 409 });
      }

      respondentId = session.respondent.id;

      // Criar registro de participação se não existir
      if (!existing) {
        await createParticipation(respondentId, surveyId, survey.userId);
      }
    }

    let response;
    try {
      response = await saveResponse(surveyId, {
        answers,
        totalScore,
        path,
        respondentName,
        respondentEmail,
        respondentId,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "QUOTA_EXCEEDED") {
        return NextResponse.json(
          { error: "O número máximo de participantes foi atingido" },
          { status: 410 }
        );
      }
      throw err;
    }

    // Marcar participação como concluída
    if (respondentId) {
      await completeParticipation(respondentId, surveyId, response.id);
    }

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error("Error saving response:", error);
    return NextResponse.json({ error: "Erro ao salvar resposta" }, { status: 500 });
  }
}
