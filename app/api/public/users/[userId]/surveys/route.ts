import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { db } = getFirebaseAdmin();

    // Buscar pesquisas do usuário (filtro e ordenação no código para evitar índice composto)
    const surveysSnapshot = await db
      .collection("surveys")
      .where("userId", "==", userId)
      .get();

    const surveys = surveysSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          responseCount: data.responseCount || 0,
          updatedAt: data.updatedAt,
        };
      })
      .filter((s) => s.status === "published")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(({ status, ...rest }) => rest);

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error("Error fetching user surveys:", error);
    return NextResponse.json(
      { error: "Error fetching surveys" },
      { status: 500 }
    );
  }
}
