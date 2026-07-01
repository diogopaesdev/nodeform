import { NextRequest, NextResponse } from "next/server";
import { getSurvey } from "@/lib/services/surveys";
import { updateParticipationBonus } from "@/lib/services/respondents";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { SurveyParticipation } from "@/types/respondent";
import { BonusCoupon } from "@/types/survey";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { hasAddon } from "@/lib/services/addons";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participationId: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    if (!(await hasAddon(auth.workspaceId, "respondents"))) {
      return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
    }

    const { id: surveyId, participationId } = await params;

    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    if (survey.userId !== auth.workspaceId) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const body = await request.json();
    const { bonusStatus, bonusNotes } = body as {
      bonusStatus: "pending" | "released" | "ineligible";
      bonusNotes?: string;
    };

    if (!["pending", "released", "ineligible"].includes(bonusStatus)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const { db, FieldValue } = getFirebaseAdmin();

    const participationDoc = await db.collection("surveyParticipations").doc(participationId).get();
    if (!participationDoc.exists) {
      return NextResponse.json({ error: "Participação não encontrada" }, { status: 404 });
    }
    const current = participationDoc.data() as SurveyParticipation;

    if (current.surveyId !== surveyId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const wasIneligible = current.bonusStatus === "ineligible";
    const becomingIneligible = bonusStatus === "ineligible";
    const wasReleased = current.bonusStatus === "released";
    const becomingPending = bonusStatus === "pending";

    // ── Coupon assignment on release ────────────────────────────────────────
    let assignedCouponCode: string | undefined;
    let couponToClear: string | null | undefined;

    if (bonusStatus === "released" && survey.bonusConfig) {
      const config = survey.bonusConfig;

      if (config.type === "coupons") {
        const available = config.coupons.find((c: BonusCoupon) => !c.participationId);
        if (!available) {
          return NextResponse.json({ error: "Sem cupons disponíveis para atribuir" }, { status: 400 });
        }
        const updatedCoupons = config.coupons.map((c: BonusCoupon) =>
          c.code === available.code
            ? { ...c, participationId, assignedAt: new Date().toISOString() }
            : c
        );
        await db.collection("surveys").doc(surveyId).update({
          "bonusConfig.coupons": updatedCoupons,
          updatedAt: new Date().toISOString(),
        });
        assignedCouponCode = available.code;

      } else if (config.type === "shared_coupon") {
        const used = config.usedQty ?? 0;
        if (used >= config.maxQty) {
          return NextResponse.json({ error: "Quantidade máxima de usos atingida" }, { status: 400 });
        }
        await db.collection("surveys").doc(surveyId).update({
          "bonusConfig.usedQty": FieldValue.increment(1),
          updatedAt: new Date().toISOString(),
        });
        assignedCouponCode = config.code;
      }
    }

    // ── Coupon un-assignment on revert to pending ───────────────────────────
    if (wasReleased && becomingPending && current.bonusCouponCode && survey.bonusConfig) {
      const config = survey.bonusConfig;
      if (config.type === "coupons") {
        const updatedCoupons = config.coupons.map((c: BonusCoupon) =>
          c.code === current.bonusCouponCode ? { code: c.code } : c
        );
        await db.collection("surveys").doc(surveyId).update({
          "bonusConfig.coupons": updatedCoupons,
          updatedAt: new Date().toISOString(),
        });
        couponToClear = null;
      } else if (config.type === "shared_coupon") {
        await db.collection("surveys").doc(surveyId).update({
          "bonusConfig.usedQty": FieldValue.increment(-1),
          updatedAt: new Date().toISOString(),
        });
        couponToClear = null;
      }
    }

    await updateParticipationBonus(
      participationId,
      bonusStatus,
      bonusNotes,
      assignedCouponCode !== undefined ? assignedCouponCode : couponToClear
    );

    // ── Quota adjustments ───────────────────────────────────────────────────
    if (!wasIneligible && becomingIneligible) {
      const surveyRef = db.collection("surveys").doc(surveyId);
      const newCount = survey.responseCount - 1;
      const update: Record<string, unknown> = { responseCount: FieldValue.increment(-1) };
      if (survey.status === "finished" && survey.maxResponses && newCount < survey.maxResponses) {
        update.status = "published";
      }
      await surveyRef.update(update);
    } else if (wasIneligible && !becomingIneligible) {
      const surveyRef = db.collection("surveys").doc(surveyId);
      const newCount = survey.responseCount + 1;
      const update: Record<string, unknown> = { responseCount: FieldValue.increment(1) };
      if (survey.maxResponses && newCount >= survey.maxResponses) {
        update.status = "finished";
      }
      await surveyRef.update(update);
    }

    return NextResponse.json({ success: true, bonusCouponCode: assignedCouponCode });
  } catch (error) {
    console.error("Error updating participation bonus:", error);
    return NextResponse.json({ error: "Erro ao atualizar bonificação" }, { status: 500 });
  }
}
