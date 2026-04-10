import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
  }

  try {
    const { db } = getFirebaseAdmin();

    const snapshot = await db
      .collection("users")
      .where("emailVerificationToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", request.url));
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    if (new Date(user.emailVerificationTokenExpiresAt) < new Date()) {
      return NextResponse.redirect(new URL("/login?error=token-expired", request.url));
    }

    await userDoc.ref.update({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.redirect(new URL("/login?verified=true", request.url));
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.redirect(new URL("/login?error=server-error", request.url));
  }
}
