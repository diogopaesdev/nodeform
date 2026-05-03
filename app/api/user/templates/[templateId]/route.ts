import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteUserTemplate } from "@/lib/services/user-templates";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

// DELETE /api/user/templates/[templateId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { templateId } = await params;

  const { db } = getFirebaseAdmin();
  const doc = await db
    .collection("users")
    .doc(session.user.id)
    .collection("userTemplates")
    .doc(templateId)
    .get();

  if (!doc.exists) {
    return NextResponse.json({ error: "Template não encontrado" }, { status: 404 });
  }

  await deleteUserTemplate(session.user.id, templateId);
  return NextResponse.json({ ok: true });
}
