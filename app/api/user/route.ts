import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { db } = getFirebaseAdmin();
  const userDoc = await db.collection("users").doc(session.user.id).get();

  if (!userDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: userDoc.data() });
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const allowed = ["prePlanSelected"] as const;
  const updates: Record<string, unknown> = {};

  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { db } = getFirebaseAdmin();
  await db.collection("users").doc(session.user.id).update(updates);
  return NextResponse.json({ ok: true });
}
