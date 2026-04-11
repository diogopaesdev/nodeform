import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveResponse, getSurvey } from "@/lib/services/surveys";

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

// POST - Salvar resposta da pesquisa (público, não requer autenticação)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: surveyId } = await params;

    // Verificar se a pesquisa existe
    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json(
        { error: "Pesquisa não encontrada" },
        { status: 404 }
      );
    }

    // Validar e parsear o payload
    const parsed = ResponseSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados de resposta inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { answers, totalScore, path, respondentName, respondentEmail } = parsed.data;

    // Salvar resposta
    const response = await saveResponse(surveyId, {
      answers,
      totalScore,
      path,
      respondentName,
      respondentEmail,
    });

    return NextResponse.json({ response }, { status: 201 });
  } catch (error) {
    console.error("Error saving response:", error);
    return NextResponse.json(
      { error: "Erro ao salvar resposta" },
      { status: 500 }
    );
  }
}
