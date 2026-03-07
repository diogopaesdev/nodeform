import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { companyName, cnpj } = body;

  if (!companyName?.trim()) {
    return NextResponse.json({ error: "Razão social é obrigatória" }, { status: 400 });
  }

  const { db } = getFirebaseAdmin();
  await db.collection("users").doc(session.user.id).update({
    companyName: companyName.trim(),
    cnpj: cnpj?.trim() || null,
    onboardingCompleted: true,
    updatedAt: new Date().toISOString(),
  });

  return NextResponse.json({ success: true });
}
