import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { Sidebar } from "@/components/dashboard/sidebar";

const ACTIVE_STATUSES = ["active", "trialing"];
const EXEMPT_PATHS = ["/dashboard/settings"];

function hasValidAccess(data: {
  subscriptionStatus?: string | null;
  trialEnd?: string | null;
}): boolean {
  if (data.subscriptionStatus && ACTIVE_STATUSES.includes(data.subscriptionStatus)) {
    return true;
  }
  if (data.trialEnd && new Date(data.trialEnd).getTime() > Date.now()) {
    return true;
  }
  return false;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const pathname = (await headers()).get("x-pathname") ?? "";
  const isExempt = EXEMPT_PATHS.some((p) => pathname.startsWith(p));

  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(session.user.id).get();
  const userData = userDoc.data();

  if (!isExempt && !hasValidAccess(userData ?? {})) {
    redirect("/upgrade");
  }

  const subscriptionStatus = (userData?.subscriptionStatus as string | undefined) ?? null;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar subscriptionStatus={subscriptionStatus} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
