import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { sendVerificationEmail } from "@/lib/email";

const PasswordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(100)
  .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
  .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
  .regex(/\d/, "Deve conter ao menos um número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos um caractere especial");

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: PasswordSchema,
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
      const provider = existing.docs[0].data().provider;
      if (provider === "google") {
        return NextResponse.json({ error: "Este e-mail já está vinculado a uma conta Google. Entre usando o botão \"Entrar com Google\".", code: "google-account" }, { status: 409 });
      }
      return NextResponse.json({ error: "E-mail já cadastrado.", code: "email-exists" }, { status: 409 });
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
