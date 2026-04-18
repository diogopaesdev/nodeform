import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateApiKey } from "@/lib/services/api-keys";
import { NextRequest } from "next/server";

export interface WorkspaceAuth {
  workspaceId: string;
  source: "apikey" | "session";
}

/**
 * Resolves the authenticated workspace from a request.
 * Checks Authorization: Bearer <nfk_...> header first, falls back to NextAuth session.
 */
export async function resolveWorkspace(req: NextRequest): Promise<WorkspaceAuth | null> {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer nfk_")) {
    const rawKey = auth.slice(7);
    const keyRecord = await validateApiKey(rawKey);
    if (!keyRecord) return null;
    return { workspaceId: keyRecord.workspaceId, source: "apikey" };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { workspaceId: session.user.id, source: "session" };
}
