import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/services/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdminUser();
  if (!admin) redirect("/dashboard");
  return <>{children}</>;
}
