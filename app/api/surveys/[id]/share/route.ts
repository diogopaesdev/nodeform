import { NextRequest, NextResponse } from "next/server";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { getSurvey } from "@/lib/services/surveys";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import crypto from "crypto";

// POST - Enable/refresh share token; DELETE - revoke
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

    const shareToken = crypto.randomBytes(16).toString("hex");

    const { db } = getFirebaseAdmin();
    await db.collection("surveys").doc(surveyId).update({
      shareToken,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ shareToken });
  } catch (error) {
    console.error("Error generating share token:", error);
    return NextResponse.json({ error: "Erro ao gerar link de compartilhamento" }, { status: 500 });
  }
}

export async function DELETE(
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
    await db.collection("surveys").doc(surveyId).update({
      shareToken: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error revoking share token:", error);
    return NextResponse.json({ error: "Erro ao revogar link" }, { status: 500 });
  }
}
