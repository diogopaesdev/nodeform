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

// Apaga todos os eventos de atividade de uma pesquisa. Usado no "Limpar logs"
// para resetar a aba de Atividades (não afeta respostas nem participações).
// Retorna quantos eventos foram removidos.
export async function deleteSurveyEvents(surveyId: string): Promise<number> {
  const { db } = getFirebaseAdmin();
  const snap = await db.collection(COLLECTION).where("surveyId", "==", surveyId).get();
  if (snap.empty) return 0;

  // Batches do Firestore aceitam até 500 operações.
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 450) {
    const batch = db.batch();
    docs.slice(i, i + 450).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return docs.length;
}

// Remove o vínculo pessoal (id/nome/e-mail) dos eventos de um respondente nesta
// pesquisa, mantendo o evento para as contagens do funil. Usado quando a
// resposta do respondente é apagada. Filtra por surveyId (índice simples) e
// casa respondentId em memória para não exigir índice composto.
export async function scrubRespondentFromEvents(
  surveyId: string,
  respondentId: string
): Promise<void> {
  const { db, FieldValue } = getFirebaseAdmin();
  const snap = await db.collection(COLLECTION).where("surveyId", "==", surveyId).get();
  const targets = snap.docs.filter(
    (d) => (d.data() as SurveyEvent).respondentId === respondentId
  );
  if (targets.length === 0) return;

  const batch = db.batch();
  targets.forEach((d) => {
    batch.update(d.ref, {
      respondentId: FieldValue.delete(),
      respondentName: FieldValue.delete(),
      respondentEmail: FieldValue.delete(),
      anonymized: true,
    });
  });
  await batch.commit();
}
