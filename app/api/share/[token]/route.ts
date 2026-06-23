import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { Survey, SurveyResponse } from "@/types/survey";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { db } = getFirebaseAdmin();

    const snapshot = await db
      .collection("surveys")
      .where("shareToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 404 });
    }

    const survey = snapshot.docs[0].data() as Survey;

    const responsesSnapshot = await db
      .collection("surveys")
      .doc(survey.id)
      .collection("responses")
      .get();

    const responses = responsesSnapshot.docs.map((d) => d.data() as SurveyResponse);

    return NextResponse.json({
      survey: {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        nodes: survey.nodes,
        edges: survey.edges,
        enableScoring: survey.enableScoring,
        responseCount: survey.responseCount,
      },
      responses,
    });
  } catch (error) {
    console.error("Error fetching shared survey:", error);
    return NextResponse.json({ error: "Erro ao carregar análise" }, { status: 500 });
  }
}
