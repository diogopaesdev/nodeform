import { NextRequest, NextResponse } from "next/server";
import { getSurvey } from "@/lib/services/surveys";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

// GET /api/public/surveys/[id] - Buscar pesquisa pública (sem autenticação)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const survey = await getSurvey(id);

    if (!survey) {
      return NextResponse.json(
        { error: "Pesquisa não encontrada" },
        { status: 404 }
      );
    }

    // Buscar brand do dono da pesquisa
    const { db } = getFirebaseAdmin();
    const userDoc = await db.collection("users").doc(survey.userId).get();
    const userData = userDoc.data() || {};
    const brand = {
      brandColor: userData.brandColor || null,
      logoUrl: userData.logoUrl || null,
      displayName: userData.displayName || userData.companyName || null,
      brandDescription: userData.brandDescription || null,
    };

    return NextResponse.json({
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        nodes: survey.nodes,
        edges: survey.edges,
        enableScoring: survey.enableScoring,
      },
      brand,
    });
  } catch (error) {
    console.error("Error fetching public survey:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pesquisa" },
      { status: 500 }
    );
  }
}
