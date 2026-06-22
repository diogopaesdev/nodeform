import { NextRequest, NextResponse } from "next/server";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { getSurvey } from "@/lib/services/surveys";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { Survey } from "@/types/survey";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });

    if (survey.userId !== auth.workspaceId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { db } = getFirebaseAdmin();
    const newRef = db.collection("surveys").doc();
    const now = new Date().toISOString();

    const duplicate: Survey = {
      ...survey,
      id: newRef.id,
      title: `${survey.title} (cópia)`,
      status: "draft",
      responseCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await newRef.set(duplicate);

    return NextResponse.json({ survey: duplicate }, { status: 201 });
  } catch (error) {
    console.error("Error duplicating survey:", error);
    return NextResponse.json({ error: "Erro ao duplicar pesquisa" }, { status: 500 });
  }
}
