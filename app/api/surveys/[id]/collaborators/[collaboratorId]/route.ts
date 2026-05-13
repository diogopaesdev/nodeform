import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey } from "@/lib/services/surveys";
import { getCollaboratorsBySurvey, deleteCollaborator, updateCollaboratorRole } from "@/lib/services/collaborators";
import { CollaboratorRole } from "@/types/collaborator";

// PATCH /api/surveys/[id]/collaborators/[collaboratorId] — update role (owner only)
export async function PATCH(
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

    const body = await req.json();
    const role: CollaboratorRole = body.role;
    if (!role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Função inválida" }, { status: 400 });
    }

    const collaborators = await getCollaboratorsBySurvey(id);
    const target = collaborators.find((c) => c.id === collaboratorId);
    if (!target) {
      return NextResponse.json({ error: "Colaborador não encontrado" }, { status: 404 });
    }

    await updateCollaboratorRole(collaboratorId, role);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating collaborator role:", error);
    return NextResponse.json({ error: "Erro ao atualizar função" }, { status: 500 });
  }
}

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
