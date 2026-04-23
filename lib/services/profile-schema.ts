import { getFirebaseAdmin } from "../firebase-admin";
import { ProfileSchema, ProfileField } from "@/types/addon";

export async function getProfileSchema(workspaceId: string): Promise<ProfileSchema> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("users").doc(workspaceId).get();
  if (!doc.exists) return [];
  return (doc.data()?.profileSchema as ProfileSchema) ?? [];
}

export async function setProfileSchema(
  workspaceId: string,
  schema: ProfileSchema
): Promise<void> {
  const { db } = getFirebaseAdmin();
  await db.collection("users").doc(workspaceId).update({
    profileSchema: schema,
    updatedAt: new Date().toISOString(),
  });
}

export async function addProfileField(
  workspaceId: string,
  field: ProfileField
): Promise<ProfileSchema> {
  const schema = await getProfileSchema(workspaceId);
  const exists = schema.some((f) => f.key === field.key);
  if (exists) throw new Error("FIELD_EXISTS");
  const updated = [...schema, field];
  await setProfileSchema(workspaceId, updated);
  return updated;
}

export async function removeProfileField(
  workspaceId: string,
  key: string
): Promise<ProfileSchema> {
  const schema = await getProfileSchema(workspaceId);
  const updated = schema.filter((f) => f.key !== key);
  await setProfileSchema(workspaceId, updated);
  return updated;
}
