import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { getActiveUserPlan } from "@/lib/services/plan";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Read plan from Firestore — never trust JWT for security decisions
  const { planId, subscriptionStatus } = await getActiveUserPlan(session.user.id);
  const isSubscriptionActive = subscriptionStatus === "active" || subscriptionStatus === "trialing";
  if (planId === "growth" || !isSubscriptionActive) {
    return NextResponse.json(
      { error: "Identidade visual personalizada não está disponível no plano Growth" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { brandColor, logoUrl, displayName, brandDescription } = body;

  const { db } = getFirebaseAdmin();
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };

  if (brandColor !== undefined) update.brandColor = brandColor;
  if (logoUrl !== undefined) update.logoUrl = logoUrl;
  if (displayName !== undefined) update.displayName = displayName;
  if (brandDescription !== undefined) update.brandDescription = brandDescription;

  await db.collection("users").doc(session.user.id).update(update);
  return NextResponse.json({ success: true });
}
