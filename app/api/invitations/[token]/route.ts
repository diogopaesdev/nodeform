import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCollaboratorsByToken, acceptInvitation } from "@/lib/services/collaborators";

// GET /api/invitations/[token] — get invite details (public, no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const collaborator = await getCollaboratorsByToken(token);

    if (!collaborator) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }

    if (new Date(collaborator.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
    }

    return NextResponse.json({
      invite: {
        surveyId: collaborator.surveyId,
        surveyTitle: collaborator.surveyTitle,
        inviterName: collaborator.inviterName,
        invitedEmail: collaborator.invitedEmail,
        role: collaborator.role,
        status: collaborator.status,
        expiresAt: collaborator.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json({ error: "Erro ao buscar convite" }, { status: 500 });
  }
}

// POST /api/invitations/[token] — accept an invitation
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { token } = await params;
    const collaborator = await getCollaboratorsByToken(token);

    if (!collaborator) {
      return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
    }

    if (collaborator.invitedEmail !== session.user.email?.toLowerCase()) {
      return NextResponse.json(
        {
          error: `Este convite foi enviado para ${collaborator.invitedEmail}. Faça login com esse e-mail para aceitar.`,
        },
        { status: 403 }
      );
    }

    const accepted = await acceptInvitation(token, session.user.id);
    return NextResponse.json({ collaborator: accepted, surveyId: accepted.surveyId });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVITE_NOT_FOUND") {
        return NextResponse.json({ error: "Convite não encontrado" }, { status: 404 });
      }
      if (error.message === "ALREADY_ACCEPTED") {
        return NextResponse.json({ error: "Convite já aceito" }, { status: 409 });
      }
      if (error.message === "INVITE_EXPIRED") {
        return NextResponse.json({ error: "Convite expirado" }, { status: 410 });
      }
    }
    console.error("Error accepting invitation:", error);
    return NextResponse.json({ error: "Erro ao aceitar convite" }, { status: 500 });
  }
}
