import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

const Schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const parsed = Schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const { db } = getFirebaseAdmin();
  const snapshot = await db
    .collection("users")
    .where("email", "==", parsed.data.email)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({ exists: false });
  }

  const user = snapshot.docs[0].data();
  return NextResponse.json({
    exists: true,
    provider: user.provider,
    emailVerified: user.emailVerified ?? true,
  });
}
