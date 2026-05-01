import { getFirebaseAdmin } from "../firebase-admin";
import { Survey, DashboardStats, SurveyNode, SurveyEdge, SurveyResponse, NodeAnswer } from "@/types/survey";

// Criar nova pesquisa
export async function createSurvey(
  userId: string,
  title: string = "Nova Pesquisa",
  nodes: SurveyNode[] = [],
  edges: SurveyEdge[] = []
): Promise<Survey> {
  const { db } = getFirebaseAdmin();
  const surveyRef = db.collection("surveys").doc();

  const now = new Date().toISOString();
  const survey: Survey = {
    id: surveyRef.id,
    userId,
    title,
    description: "",
    nodes,
    edges,
    createdAt: now,
    updatedAt: now,
    enableScoring: false,
    status: "draft",
    responseCount: 0,
  };

  await surveyRef.set(survey);
  return survey;
}

// Buscar pesquisas do usuário
export async function getUserSurveys(userId: string): Promise<Survey[]> {
  const { db } = getFirebaseAdmin();

  // Query simples sem orderBy para evitar necessidade de índice composto
  const snapshot = await db
    .collection("surveys")
    .where("userId", "==", userId)
    .get();

  const surveys = snapshot.docs.map((doc) => doc.data() as Survey);

  // Ordenar no servidor (mais recentes primeiro)
  return surveys.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

// Buscar uma pesquisa específica
export async function getSurvey(surveyId: string): Promise<Survey | null> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("surveys").doc(surveyId).get();

  if (!doc.exists) return null;
  return doc.data() as Survey;
}

// Atualizar pesquisa
export async function updateSurvey(
  surveyId: string,
  data: Partial<
    Pick<
      Survey,
      "title" | "description" | "nodes" | "edges" | "enableScoring" | "status" | "timeLimit" | "prize"
    >
  >
): Promise<void> {
  const { db } = getFirebaseAdmin();

  await db
    .collection("surveys")
    .doc(surveyId)
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
}

// Salvar nodes e edges da pesquisa
export async function saveSurveyContent(
  surveyId: string,
  nodes: SurveyNode[],
  edges: SurveyEdge[],
  title?: string,
  enableScoring?: boolean,
  description?: string,
  timeLimit?: number | null,
  prize?: string | null,
  requiresRespondentLogin?: boolean,
  maxResponses?: number | null,
  eligibilityRules?: unknown[]
): Promise<void> {
  const { db } = getFirebaseAdmin();

  const updateData: Record<string, unknown> = {
    nodes,
    edges,
    updatedAt: new Date().toISOString(),
  };

  if (title !== undefined) updateData.title = title;
  if (enableScoring !== undefined) updateData.enableScoring = enableScoring;
  if (description !== undefined) updateData.description = description;
  if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
  if (prize !== undefined) updateData.prize = prize;
  if (requiresRespondentLogin !== undefined) updateData.requiresRespondentLogin = requiresRespondentLogin;
  if (maxResponses !== undefined) updateData.maxResponses = maxResponses;
  if (eligibilityRules !== undefined) updateData.eligibilityRules = eligibilityRules;

  await db.collection("surveys").doc(surveyId).update(updateData);
}

// Deletar pesquisa
export async function deleteSurvey(surveyId: string): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("surveys").doc(surveyId).delete();
}

// Estatísticas do dashboard
export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const { db } = getFirebaseAdmin();

  const surveysSnapshot = await db
    .collection("surveys")
    .where("userId", "==", userId)
    .get();

  const surveys = surveysSnapshot.docs.map((doc) => doc.data() as Survey);

  return {
    totalSurveys: surveys.length,
    totalResponses: surveys.reduce((acc, s) => acc + s.responseCount, 0),
    activeSurveys: surveys.filter((s) => s.status === "published").length,
  };
}

// ==================== RESPOSTAS ====================

// Salvar resposta da pesquisa
export async function saveResponse(
  surveyId: string,
  data: {
    answers: NodeAnswer[];
    totalScore: number;
    path: string[];
    respondentName?: string;
    respondentEmail?: string;
    respondentId?: string;
  }
): Promise<SurveyResponse> {
  const { db, FieldValue } = getFirebaseAdmin();

  // Verificar cota antes de salvar
  const survey = await getSurvey(surveyId);
  if (survey?.maxResponses && survey.responseCount >= survey.maxResponses) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const responseRef = db.collection("surveys").doc(surveyId).collection("responses").doc();

  const now = new Date().toISOString();

  const cleanAnswers = data.answers.map((a) =>
    Object.fromEntries(Object.entries(a).filter(([, v]) => v !== undefined))
  );

  const response: Record<string, unknown> = {
    id: responseRef.id,
    surveyId,
    answers: cleanAnswers,
    totalScore: data.totalScore,
    path: data.path,
    completedAt: now,
    createdAt: now,
  };

  if (data.respondentName) response.respondentName = data.respondentName;
  if (data.respondentEmail) response.respondentEmail = data.respondentEmail;
  if (data.respondentId) response.respondentId = data.respondentId;

  const batch = db.batch();
  batch.set(responseRef, response);

  const surveyRef = db.collection("surveys").doc(surveyId);
  const updatePayload: Record<string, unknown> = { responseCount: FieldValue.increment(1) };

  // Fechar automaticamente se atingiu a cota com esta resposta
  if (survey?.maxResponses && survey.responseCount + 1 >= survey.maxResponses) {
    updatePayload.status = "finished";
  }

  batch.update(surveyRef, updatePayload);

  await batch.commit();

  return response as unknown as SurveyResponse;
}

// Buscar respostas de uma pesquisa
export async function getSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const { db } = getFirebaseAdmin();

  const snapshot = await db
    .collection("surveys")
    .doc(surveyId)
    .collection("responses")
    .get();

  const responses = snapshot.docs.map((doc) => doc.data() as SurveyResponse);

  // Ordenar por data (mais recentes primeiro)
  return responses.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Buscar uma resposta específica
export async function getResponse(
  surveyId: string,
  responseId: string
): Promise<SurveyResponse | null> {
  const { db } = getFirebaseAdmin();

  const doc = await db
    .collection("surveys")
    .doc(surveyId)
    .collection("responses")
    .doc(responseId)
    .get();

  if (!doc.exists) return null;
  return doc.data() as SurveyResponse;
}

// Deletar resposta
export async function deleteResponse(
  surveyId: string,
  responseId: string
): Promise<void> {
  const { db, FieldValue } = getFirebaseAdmin();

  const batch = db.batch();

  batch.delete(
    db.collection("surveys").doc(surveyId).collection("responses").doc(responseId)
  );

  batch.update(db.collection("surveys").doc(surveyId), {
    responseCount: FieldValue.increment(-1),
  });

  await batch.commit();
}
