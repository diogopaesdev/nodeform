import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function isAdminUser(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin === true;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return null;
  return { userId: session.user.id, email: session.user.email };
}

export async function isAdminSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return false;

  try {
    const { db } = getFirebaseAdmin();
    const doc = await db.collection("adminSessions").doc(token).get();
    if (!doc.exists) return false;
    const data = doc.data()!;
    const session = await getServerSession(authOptions);
    return data.email === session?.user?.email && new Date(data.expiresAt) > new Date();
  } catch {
    return false;
  }
}
