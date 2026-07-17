import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey, getSurveyResponses, deleteResponse } from "@/lib/services/surveys";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { getCollaboratorAccessForUser } from "@/lib/services/collaborators";
import { getRespondentById, getParticipationByResponseId, deleteParticipation } from "@/lib/services/respondents";
import { getProfileSchema } from "@/lib/services/profile-schema";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { BonusCoupon } from "@/types/survey";

// GET - Buscar respostas de uma pesquisa
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id: surveyId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });

    const isOwner = survey.userId === auth.workspaceId;
    if (!isOwner) {
      const collaboratorRole = await getCollaboratorAccessForUser(surveyId, auth.workspaceId);
      if (!collaboratorRole) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const responses = await getSurveyResponses(surveyId);

    if (!survey.requiresRespondentLogin) {
      return NextResponse.json({ responses });
    }

    const profileSchema = await getProfileSchema(survey.userId);

    type RespondentCacheEntry = { profile: Record<string, unknown>; name?: string; email?: string };
    const respondentCache = new Map<string, RespondentCacheEntry>();

    const enriched = await Promise.all(
      responses.map(async (r) => {
        if (!r.respondentId) return r;
        if (!respondentCache.has(r.respondentId)) {
          const resp = await getRespondentById(r.respondentId);
          if (resp) {
            const { id: _id, workspaceId: _wid, loginCode: _lc, loginCodeExpiresAt: _lce, createdAt: _ca, updatedAt: _ua, name, email, ...rest } = resp;
            const profile: Record<string, unknown> = {};
            for (const [k, v] of Object.entries(rest)) {
              if (v !== undefined && v !== null && v !== "") profile[k] = v;
            }
            respondentCache.set(r.respondentId, { profile, name, email });
          } else {
            respondentCache.set(r.respondentId, { profile: {} });
          }
        }
        const cached = respondentCache.get(r.respondentId)!;
        return {
          ...r,
          respondentName: r.respondentName || cached.name,
          respondentEmail: r.respondentEmail || cached.email,
          profile: cached.profile,
        };
      })
    );

    return NextResponse.json({ responses: enriched, profileSchema });
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Erro ao buscar respostas" },
      { status: 500 }
    );
  }
}

// DELETE - Deletar uma resposta específica
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: surveyId } = await params;
    const { searchParams } = new URL(request.url);
    const responseId = searchParams.get("responseId");

    if (!responseId) {
      return NextResponse.json(
        { error: "ID da resposta não informado" },
        { status: 400 }
      );
    }

    // Verificar se a pesquisa pertence ao usuário
    const survey = await getSurvey(surveyId);
    if (!survey) {
      return NextResponse.json(
        { error: "Pesquisa não encontrada" },
        { status: 404 }
      );
    }

    if (survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Encontrar a participação vinculada ANTES de apagar a resposta
    const participation = await getParticipationByResponseId(surveyId, responseId);

    // Deletar resposta (decrementa responseCount)
    await deleteResponse(surveyId, responseId);

    // Limpar a participação órfã: sem isso o cadastro continuaria aparecendo na
    // aba de bonificação (sem correspondente em Respostas) e a pessoa seguiria
    // bloqueada de responder novamente.
    if (participation) {
      // Devolver ao pool o cupom que já tinha sido atribuído a esta participação
      if (
        participation.bonusStatus === "released" &&
        participation.bonusCouponCode &&
        survey.bonusConfig
      ) {
        const config = survey.bonusConfig;
        const { db, FieldValue } = getFirebaseAdmin();
        const now = new Date().toISOString();
        if (config.type === "coupons") {
          const updatedCoupons = config.coupons.map((c: BonusCoupon) =>
            c.code === participation.bonusCouponCode ? { code: c.code } : c
          );
          await db.collection("surveys").doc(surveyId).update({
            "bonusConfig.coupons": updatedCoupons,
            updatedAt: now,
          });
        } else if (config.type === "shared_coupon") {
          await db.collection("surveys").doc(surveyId).update({
            "bonusConfig.usedQty": FieldValue.increment(-1),
            updatedAt: now,
          });
        }
      }
      await deleteParticipation(participation.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      { error: "Erro ao deletar resposta" },
      { status: 500 }
    );
  }
}
