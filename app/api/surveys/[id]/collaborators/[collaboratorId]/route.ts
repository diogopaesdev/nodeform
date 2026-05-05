import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey } from "@/lib/services/surveys";
import { getCollaboratorsBySurvey, deleteCollaborator } from "@/lib/services/collaborators";

// DELETE /api/surveys/[id]/collaborators/[collaboratorId] — remove collaborator (owner only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; collaboratorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, collaboratorId } = await params;
    const survey = await getSurvey(id);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Verify the collaborator belongs to this survey
    const collaborators = await getCollaboratorsBySurvey(id);
    const target = collaborators.find((c) => c.id === collaboratorId);
    if (!target) {
      return NextResponse.json({ error: "Colaborador não encontrado" }, { status: 404 });
    }

    await deleteCollaborator(collaboratorId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json({ error: "Erro ao remover colaborador" }, { status: 500 });
  }
}
