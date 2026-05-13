import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/services/admin";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Código obrigatório" }, { status: 400 });

  const { db } = getFirebaseAdmin();
  const otpDoc = await db.collection("adminOtps").doc(admin.email!).get();

  if (!otpDoc.exists) {
    return NextResponse.json({ error: "Nenhum código solicitado" }, { status: 400 });
  }

  const otp = otpDoc.data()!;

  if (otp.usedAt) {
    return NextResponse.json({ error: "Código já utilizado" }, { status: 400 });
  }

  if (new Date(otp.expiresAt) < new Date()) {
    return NextResponse.json({ error: "Código expirado" }, { status: 400 });
  }

  if (otp.code !== String(code)) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  // Marca como usado
  await otpDoc.ref.update({ usedAt: new Date().toISOString() });

  // Cria sessão admin com 1h de validade
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await db.collection("adminSessions").doc(token).set({ email: admin.email, expiresAt, createdAt: new Date().toISOString() });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  return res;
}
