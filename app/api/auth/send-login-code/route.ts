import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { sendLoginCode } from "@/lib/email";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const { db } = getFirebaseAdmin();

    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Nenhuma conta encontrada com este e-mail." }, { status: 404 });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    if (user.provider === "google") {
      return NextResponse.json({ error: "Este e-mail está cadastrado com o Google.", code: "google-account" }, { status: 409 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "E-mail ainda não confirmado. Verifique sua caixa de entrada." }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
    }

    // Gera código de 6 dígitos
    const loginCode = String(Math.floor(100000 + Math.random() * 900000));
    const loginCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await userDoc.ref.update({ loginCode, loginCodeExpiresAt });
    await sendLoginCode(email, user.name, loginCode);

    return NextResponse.json({ message: "Código enviado para seu e-mail." });
  } catch (error) {
    console.error("Send login code error:", error);
    return NextResponse.json({ error: "Erro ao enviar código." }, { status: 500 });
  }
}
