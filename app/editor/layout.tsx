import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { hasValidAccess } from "@/lib/services/plan";

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(session.user.id).get();

  if (!hasValidAccess(userDoc.data() ?? {})) {
    redirect("/upgrade");
  }

  return <>{children}</>;
}
