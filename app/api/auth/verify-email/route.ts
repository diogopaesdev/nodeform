import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");

  const loginRedirect = (params: string) => {
    const suffix = callbackUrl
      ? `${params}&callbackUrl=${encodeURIComponent(callbackUrl)}`
      : params;
    return NextResponse.redirect(new URL(`/login?${suffix}`, request.url));
  };

  if (!token) {
    return loginRedirect("error=invalid-token");
  }

  try {
    const { db } = getFirebaseAdmin();

    const snapshot = await db
      .collection("users")
      .where("emailVerificationToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return loginRedirect("error=invalid-token");
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    if (new Date(user.emailVerificationTokenExpiresAt) < new Date()) {
      return loginRedirect("error=token-expired");
    }

    await userDoc.ref.update({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });

    return loginRedirect("verified=true");
  } catch (error) {
    console.error("Verify email error:", error);
    return loginRedirect("error=server-error");
  }
}
