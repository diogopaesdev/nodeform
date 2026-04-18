import crypto from "crypto";
import { getFirebaseAdmin } from "../firebase-admin";
import { Respondent, RespondentSession, SurveyParticipation } from "@/types/respondent";

// ==================== RESPONDENTES ====================

export async function getRespondentByEmail(
  workspaceId: string,
  email: string
): Promise<Respondent | null> {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("respondents")
    .where("workspaceId", "==", workspaceId)
    .where("email", "==", email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Respondent;
}

export async function getRespondentById(respondentId: string): Promise<Respondent | null> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("respondents").doc(respondentId).get();
  if (!doc.exists) return null;
  return doc.data() as Respondent;
}

export async function createRespondent(
  workspaceId: string,
  data: { name: string; email: string; [key: string]: unknown }
): Promise<Respondent> {
  const { db } = getFirebaseAdmin();
  const ref = db.collection("respondents").doc();
  const now = new Date().toISOString();

  const { name, email, ...rest } = data;
  const respondent: Respondent = {
    id: ref.id,
    workspaceId,
    name,
    email,
    createdAt: now,
    updatedAt: now,
    ...rest,
  };

  await ref.set(respondent);
  return respondent;
}

export async function updateRespondentProfile(
  respondentId: string,
  fields: Record<string, unknown>
): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("respondents").doc(respondentId).update({
    ...fields,
    updatedAt: new Date().toISOString(),
  });
}

// ==================== OTP ====================

export async function generateRespondentOTP(respondentId: string): Promise<string> {
  const { db } = getFirebaseAdmin();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await db.collection("respondents").doc(respondentId).update({
    loginCode: code,
    loginCodeExpiresAt: expiresAt,
  });

  return code;
}

export async function verifyRespondentOTP(
  workspaceId: string,
  email: string,
  code: string
): Promise<Respondent | null> {
  const { db } = getFirebaseAdmin();

  const snapshot = await db
    .collection("respondents")
    .where("workspaceId", "==", workspaceId)
    .where("email", "==", email)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const respondent = doc.data() as Respondent;

  if (!respondent.loginCode || respondent.loginCode !== code) return null;
  if (new Date(respondent.loginCodeExpiresAt!) < new Date()) return null;

  await doc.ref.update({ loginCode: null, loginCodeExpiresAt: null });

  return { ...respondent, loginCode: undefined, loginCodeExpiresAt: undefined };
}

// ==================== SESSÃO ====================

const SESSION_TTL_HOURS = 24;

export async function createRespondentSession(
  respondentId: string,
  workspaceId: string
): Promise<string> {
  const { db } = getFirebaseAdmin();
  const token = crypto.randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000).toISOString();

  const session: RespondentSession = {
    id: token,
    respondentId,
    workspaceId,
    token,
    expiresAt,
    createdAt: now.toISOString(),
  };

  await db.collection("respondentSessions").doc(token).set(session);
  return token;
}

export async function getRespondentSession(
  token: string
): Promise<{ respondent: Respondent; workspaceId: string } | null> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("respondentSessions").doc(token).get();

  if (!doc.exists) return null;

  const session = doc.data() as RespondentSession;

  if (new Date(session.expiresAt) < new Date()) {
    await doc.ref.delete();
    return null;
  }

  const respondent = await getRespondentById(session.respondentId);
  if (!respondent) return null;

  return { respondent, workspaceId: session.workspaceId };
}

export async function deleteRespondentSession(token: string): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("respondentSessions").doc(token).delete();
}

// ==================== PARTICIPAÇÃO ====================

export async function checkParticipation(
  respondentId: string,
  surveyId: string
): Promise<SurveyParticipation | null> {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("surveyParticipations")
    .where("respondentId", "==", respondentId)
    .where("surveyId", "==", surveyId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as SurveyParticipation;
}

export async function createParticipation(
  respondentId: string,
  surveyId: string,
  workspaceId: string
): Promise<SurveyParticipation> {
  const { db } = getFirebaseAdmin();
  const ref = db.collection("surveyParticipations").doc();
  const now = new Date().toISOString();

  const participation: SurveyParticipation = {
    id: ref.id,
    respondentId,
    surveyId,
    workspaceId,
    status: "in_progress",
    createdAt: now,
  };

  await ref.set(participation);
  return participation;
}

export async function completeParticipation(
  respondentId: string,
  surveyId: string,
  responseId: string
): Promise<void> {
  const { db } = getFirebaseAdmin();

  const snapshot = await db
    .collection("surveyParticipations")
    .where("respondentId", "==", respondentId)
    .where("surveyId", "==", surveyId)
    .limit(1)
    .get();

  if (snapshot.empty) return;

  await snapshot.docs[0].ref.update({
    status: "completed",
    responseId,
    completedAt: new Date().toISOString(),
  });
}

export async function getWorkspaceRespondents(workspaceId: string): Promise<Respondent[]> {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("respondents")
    .where("workspaceId", "==", workspaceId)
    .get();

  return snapshot.docs.map((d) => d.data() as Respondent);
}
