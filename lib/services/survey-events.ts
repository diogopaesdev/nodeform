import { getFirebaseAdmin } from "../firebase-admin";
import { SurveyEvent, SurveyEventType } from "@/types/survey-event";

const COLLECTION = "surveyEvents";

export async function logSurveyEvent(input: {
  surveyId: string;
  workspaceId: string;
  type: SurveyEventType;
  respondentId?: string;
  respondentName?: string;
  respondentEmail?: string;
  reason?: string;
}): Promise<void> {
  const { db } = getFirebaseAdmin();
  const ref = db.collection(COLLECTION).doc();
  // Omite campos undefined — o Firestore rejeita valores undefined.
  const event: SurveyEvent = {
    id: ref.id,
    surveyId: input.surveyId,
    workspaceId: input.workspaceId,
    type: input.type,
    createdAt: new Date().toISOString(),
    ...(input.respondentId ? { respondentId: input.respondentId } : {}),
    ...(input.respondentName ? { respondentName: input.respondentName } : {}),
    ...(input.respondentEmail ? { respondentEmail: input.respondentEmail } : {}),
    ...(input.reason ? { reason: input.reason } : {}),
  };
  await ref.set(event);
}

// Todos os eventos de uma pesquisa (filtro por surveyId only para não exigir
// índice composto; a agregação/ordenação é feita em memória).
export async function getSurveyEvents(surveyId: string): Promise<SurveyEvent[]> {
  const { db } = getFirebaseAdmin();
  const snap = await db.collection(COLLECTION).where("surveyId", "==", surveyId).get();
  return snap.docs.map((d) => d.data() as SurveyEvent);
}
