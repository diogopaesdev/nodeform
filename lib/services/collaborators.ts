import { getFirebaseAdmin } from "../firebase-admin";
import { SurveyCollaborator, CollaboratorRole } from "@/types/collaborator";
import { randomBytes } from "crypto";

function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createCollaboratorInvite(
  surveyId: string,
  surveyTitle: string,
  invitedEmail: string,
  inviterUserId: string,
  inviterName: string,
  role: CollaboratorRole
): Promise<SurveyCollaborator> {
  const { db } = getFirebaseAdmin();

  // Check if there's already a pending/accepted invite for this email on this survey
  const existing = await db
    .collection("surveyCollaborators")
    .where("surveyId", "==", surveyId)
    .where("invitedEmail", "==", invitedEmail.toLowerCase())
    .get();

  if (!existing.empty) {
    const doc = existing.docs[0].data() as SurveyCollaborator;
    if (doc.status === "accepted") {
      throw new Error("ALREADY_COLLABORATOR");
    }
    // Re-send: delete old pending invite and create a new one
    await existing.docs[0].ref.delete();
  }

  const ref = db.collection("surveyCollaborators").doc();
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const collaborator: SurveyCollaborator = {
    id: ref.id,
    surveyId,
    surveyTitle,
    invitedEmail: invitedEmail.toLowerCase(),
    invitedBy: inviterUserId,
    inviterName,
    role,
    status: "pending",
    token: generateToken(),
    expiresAt,
    createdAt: now,
  };

  await ref.set(collaborator);
  return collaborator;
}

export async function getCollaboratorsByToken(
  token: string
): Promise<SurveyCollaborator | null> {
  const { db } = getFirebaseAdmin();
  const snap = await db
    .collection("surveyCollaborators")
    .where("token", "==", token)
    .limit(1)
    .get();

  if (snap.empty) return null;
  return snap.docs[0].data() as SurveyCollaborator;
}

export async function getCollaboratorsBySurvey(
  surveyId: string
): Promise<SurveyCollaborator[]> {
  const { db } = getFirebaseAdmin();
  const snap = await db
    .collection("surveyCollaborators")
    .where("surveyId", "==", surveyId)
    .get();

  return snap.docs.map((d) => d.data() as SurveyCollaborator);
}

export async function getCollaboratorAccessForUser(
  surveyId: string,
  userId: string
): Promise<CollaboratorRole | null> {
  const { db } = getFirebaseAdmin();
  const snap = await db
    .collection("surveyCollaborators")
    .where("surveyId", "==", surveyId)
    .where("userId", "==", userId)
    .where("status", "==", "accepted")
    .limit(1)
    .get();

  if (snap.empty) return null;
  return (snap.docs[0].data() as SurveyCollaborator).role;
}

export async function getCollaboratedSurveyIds(
  userId: string
): Promise<{ surveyId: string; role: CollaboratorRole; inviterName: string; invitedBy: string }[]> {
  const { db } = getFirebaseAdmin();
  const snap = await db
    .collection("surveyCollaborators")
    .where("userId", "==", userId)
    .where("status", "==", "accepted")
    .get();

  return snap.docs.map((d) => {
    const c = d.data() as SurveyCollaborator;
    return { surveyId: c.surveyId, role: c.role, inviterName: c.inviterName, invitedBy: c.invitedBy };
  });
}

export async function acceptInvitation(
  token: string,
  userId: string
): Promise<SurveyCollaborator> {
  const { db } = getFirebaseAdmin();

  const collaborator = await getCollaboratorsByToken(token);
  if (!collaborator) throw new Error("INVITE_NOT_FOUND");
  if (collaborator.status === "accepted") throw new Error("ALREADY_ACCEPTED");
  if (new Date(collaborator.expiresAt) < new Date()) throw new Error("INVITE_EXPIRED");

  await db.collection("surveyCollaborators").doc(collaborator.id).update({
    status: "accepted",
    userId,
  });

  return { ...collaborator, status: "accepted", userId };
}

export async function updateCollaboratorRole(
  collaboratorId: string,
  role: CollaboratorRole
): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("surveyCollaborators").doc(collaboratorId).update({ role });
}

export async function deleteCollaborator(collaboratorId: string): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("surveyCollaborators").doc(collaboratorId).delete();
}
