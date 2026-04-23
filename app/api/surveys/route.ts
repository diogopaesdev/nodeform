import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSurvey, getUserSurveys, getDashboardStats } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";

// GET /api/surveys - Listar pesquisas do usuário
export async function GET(req: NextRequest) {
  try {
    const auth = await resolveWorkspace(req);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const includeStats = searchParams.get("stats") === "true";

    const surveys = await getUserSurveys(auth.workspaceId);

    if (includeStats && auth.source === "session") {
      const stats = await getDashboardStats(auth.workspaceId);
      return NextResponse.json({ surveys, stats });
    }

    return NextResponse.json({ surveys });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pesquisas" },
      { status: 500 }
    );
  }
}

// POST /api/surveys - Criar nova pesquisa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title || "Nova Pesquisa";

    const survey = await createSurvey(session.user.id, title);

    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    console.error("Error creating survey:", error);
    return NextResponse.json(
      { error: "Erro ao criar pesquisa" },
      { status: 500 }
    );
  }
}
