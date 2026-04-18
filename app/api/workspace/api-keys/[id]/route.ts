import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteApiKey } from "@/lib/services/api-keys";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await deleteApiKey(id, session.user.id);

  if (!deleted) {
    return NextResponse.json({ error: "Chave não encontrada" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
