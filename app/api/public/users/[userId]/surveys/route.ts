import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const { db } = getFirebaseAdmin();

    const [surveysSnapshot, userDoc] = await Promise.all([
      db.collection("surveys").where("userId", "==", userId).get(),
      db.collection("users").doc(userId).get(),
    ]);

    const surveys = surveysSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          responseCount: data.responseCount || 0,
          timeLimit: data.timeLimit,
          prize: data.prize,
          updatedAt: data.updatedAt,
        };
      })
      .filter((s) => s.status === "published")
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(({ status, ...rest }) => rest);

    const userData = userDoc.data() || {};
    const brand = {
      brandColor: userData.brandColor || null,
      logoUrl: userData.logoUrl || null,
      displayName: userData.displayName || userData.companyName || null,
      brandDescription: userData.brandDescription || null,
    };

    return NextResponse.json({ surveys, brand });
  } catch (error) {
    console.error("Error fetching user surveys:", error);
    return NextResponse.json(
      { error: "Error fetching surveys" },
      { status: 500 }
    );
  }
}
