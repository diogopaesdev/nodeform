import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { sendVerificationEmail } from "@/lib/email";

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = RegisterSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const { db } = getFirebaseAdmin();

    const existing = await db.collection("users").where("email", "==", email).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const token = crypto.randomUUID();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const userRef = db.collection("users").doc();
    await userRef.set({
      id: userRef.id,
      name,
      email,
      image: null,
      provider: "credentials",
      passwordHash,
      emailVerified: false,
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: tokenExpiresAt,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await sendVerificationEmail(email, name, token);

    return NextResponse.json(
      { message: "Cadastro realizado. Verifique seu e-mail para ativar a conta." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 });
  }
}
