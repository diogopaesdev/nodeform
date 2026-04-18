import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey } from "@/lib/services/surveys";
import { updateParticipationBonus } from "@/lib/services/respondents";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { SurveyParticipation } from "@/types/respondent";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    if (!session.user.addons?.respondents?.active) {
      return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
    }

    const { id: surveyId, participationId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }
    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const { bonusStatus, bonusNotes } = body as {
      bonusStatus: "pending" | "released" | "ineligible";
      bonusNotes?: string;
    };

    if (!["pending", "released", "ineligible"].includes(bonusStatus)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const { db, FieldValue } = getFirebaseAdmin();

    // Fetch current participation to detect status transitions
    const participationDoc = await db.collection("surveyParticipations").doc(participationId).get();
    if (!participationDoc.exists) {
      return NextResponse.json({ error: "Participação não encontrada" }, { status: 404 });
    }
    const current = participationDoc.data() as SurveyParticipation;

    if (current.surveyId !== surveyId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const wasIneligible = current.bonusStatus === "ineligible";
    const becomingIneligible = bonusStatus === "ineligible";

    await updateParticipationBonus(participationId, bonusStatus, bonusNotes);

    // Handle quota exclusion: adjust responseCount when eligibility changes
    if (!wasIneligible && becomingIneligible) {
      // Marking as ineligible: decrement count, potentially reopen survey
      const surveyRef = db.collection("surveys").doc(surveyId);
      const newCount = survey.responseCount - 1;
      const update: Record<string, unknown> = { responseCount: FieldValue.increment(-1) };
      if (survey.status === "finished" && survey.maxResponses && newCount < survey.maxResponses) {
        update.status = "published";
      }
      await surveyRef.update(update);
    } else if (wasIneligible && !becomingIneligible) {
      // Restoring from ineligible: increment count, potentially close survey
      const surveyRef = db.collection("surveys").doc(surveyId);
      const newCount = survey.responseCount + 1;
      const update: Record<string, unknown> = { responseCount: FieldValue.increment(1) };
      if (survey.maxResponses && newCount >= survey.maxResponses) {
        update.status = "finished";
      }
      await surveyRef.update(update);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating participation bonus:", error);
    return NextResponse.json({ error: "Erro ao atualizar bonificação" }, { status: 500 });
  }
}
