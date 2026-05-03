import { getFirebaseAdmin } from "../firebase-admin";
import type { SurveyNode, SurveyEdge } from "@/types/survey";

export interface UserTemplate {
  id: string;
  workspaceId: string;
  title: string;
  nodes: SurveyNode[];
  edges: SurveyEdge[];
  createdAt: string;
}

export async function getUserTemplates(workspaceId: string): Promise<UserTemplate[]> {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("users")
    .doc(workspaceId)
    .collection("userTemplates")
    .get();

  const templates = snapshot.docs.map((doc) => doc.data() as UserTemplate);
  return templates.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function countUserTemplates(workspaceId: string): Promise<number> {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("users")
    .doc(workspaceId)
    .collection("userTemplates")
    .count()
    .get();
  return snapshot.data().count;
}

export async function createUserTemplate(
  workspaceId: string,
  title: string,
  nodes: SurveyNode[],
  edges: SurveyEdge[]
): Promise<UserTemplate> {
  const { db } = getFirebaseAdmin();
  const ref = db.collection("users").doc(workspaceId).collection("userTemplates").doc();

  const template: UserTemplate = {
    id: ref.id,
    workspaceId,
    title,
    nodes,
    edges,
    createdAt: new Date().toISOString(),
  };

  await ref.set(template);
  return template;
}

export async function deleteUserTemplate(workspaceId: string, templateId: string): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db
    .collection("users")
    .doc(workspaceId)
    .collection("userTemplates")
    .doc(templateId)
    .delete();
}
