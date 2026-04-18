import crypto from "crypto";
import { getFirebaseAdmin } from "../firebase-admin";

export interface WorkspaceApiKey {
  id: string;
  workspaceId: string;
  name: string;
  keyPrefix: string; // first 8 chars — shown in UI after creation
  keyHash: string;   // SHA-256 of full key — used for lookup
  createdAt: string;
  lastUsedAt?: string;
}

const KEY_PREFIX = "nfk_";

export function generateRawKey(): string {
  return KEY_PREFIX + crypto.randomBytes(32).toString("hex");
}

function hashKey(rawKey: string): string {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export async function createApiKey(
  workspaceId: string,
  name: string
): Promise<{ record: WorkspaceApiKey; rawKey: string }> {
  const { db } = getFirebaseAdmin();
  const ref = db.collection("workspaceApiKeys").doc();
  const rawKey = generateRawKey();

  const record: WorkspaceApiKey = {
    id: ref.id,
    workspaceId,
    name,
    keyPrefix: rawKey.slice(0, 12), // "nfk_" + first 8 hex chars
    keyHash: hashKey(rawKey),
    createdAt: new Date().toISOString(),
  };

  await ref.set(record);
  return { record, rawKey };
}

export async function listApiKeys(workspaceId: string): Promise<WorkspaceApiKey[]> {
  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("workspaceApiKeys")
    .where("workspaceId", "==", workspaceId)
    .get();

  return snapshot.docs
    .map((d) => d.data() as WorkspaceApiKey)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function deleteApiKey(keyId: string, workspaceId: string): Promise<boolean> {
  const { db } = getFirebaseAdmin();
  const doc = await db.collection("workspaceApiKeys").doc(keyId).get();

  if (!doc.exists || doc.data()?.workspaceId !== workspaceId) return false;

  await doc.ref.delete();
  return true;
}

export async function validateApiKey(
  rawKey: string
): Promise<WorkspaceApiKey | null> {
  const { db } = getFirebaseAdmin();
  const keyHash = hashKey(rawKey);

  const snapshot = await db
    .collection("workspaceApiKeys")
    .where("keyHash", "==", keyHash)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const record = snapshot.docs[0].data() as WorkspaceApiKey;

  // Update lastUsedAt without blocking
  snapshot.docs[0].ref.update({ lastUsedAt: new Date().toISOString() }).catch(() => {});

  return record;
}
