import { redirect } from "next/navigation";
import { isAdminSessionValid } from "@/lib/services/admin";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const verified = await isAdminSessionValid();
  if (!verified) redirect("/dashboard/admin/verify");
  return <>{children}</>;
}
