import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey } from "@/lib/services/surveys";
import {
  createCollaboratorInvite,
  getCollaboratorsBySurvey,
} from "@/lib/services/collaborators";
import { sendCollaboratorInvite } from "@/lib/email";
import { CollaboratorRole } from "@/types/collaborator";
import { getActiveUserPlan } from "@/lib/services/plan";
import { PLANS } from "@/lib/plans";

// GET /api/surveys/[id]/collaborators — list collaborators (owner only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const survey = await getSurvey(id);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const collaborators = await getCollaboratorsBySurvey(id);
    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json({ error: "Erro ao buscar colaboradores" }, { status: 500 });
  }
}

// POST /api/surveys/[id]/collaborators — invite a collaborator (owner only)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const survey = await getSurvey(id);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const body = await req.json();
    const email: string = body.email?.trim()?.toLowerCase();
    const role: CollaboratorRole = body.role;

    if (!email || !role || !["editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Email e função são obrigatórios" }, { status: 400 });
    }

    // Cannot invite yourself
    if (email === session.user.email?.toLowerCase()) {
      return NextResponse.json({ error: "Você não pode convidar a si mesmo" }, { status: 400 });
    }

    // Check plan collaborator limit
    const { planId } = await getActiveUserPlan(session.user.id);
    const limit = PLANS[planId].limits.collaborators;
    if (limit !== null) {
      const existing = await getCollaboratorsBySurvey(id);
      if (existing.length >= limit) {
        return NextResponse.json(
          {
            error: `Seu plano ${PLANS[planId].name} permite até ${limit} colaborador${limit === 1 ? "" : "es"} por pesquisa. Faça upgrade para adicionar mais.`,
            code: "collaborator-limit-reached",
          },
          { status: 403 }
        );
      }
    }

    const collaborator = await createCollaboratorInvite(
      id,
      survey.title,
      email,
      session.user.id,
      session.user.name ?? "Alguém",
      role
    );

    const appUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "";
    const inviteUrl = `${appUrl}/invite/${collaborator.token}`;

    await sendCollaboratorInvite(
      email,
      session.user.name ?? "Alguém",
      survey.title,
      role,
      inviteUrl
    );

    return NextResponse.json({ collaborator }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_COLLABORATOR") {
      return NextResponse.json(
        { error: "Este usuário já é colaborador desta pesquisa" },
        { status: 409 }
      );
    }
    console.error("Error inviting collaborator:", error);
    return NextResponse.json({ error: "Erro ao enviar convite" }, { status: 500 });
  }
}
