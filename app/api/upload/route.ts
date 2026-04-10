import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getSurvey } from "@/lib/services/surveys";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const surveyId = formData.get("surveyId") as string | null;

    if (!file || !surveyId) {
      return NextResponse.json({ error: "File and surveyId are required" }, { status: 400 });
    }

    const survey = await getSurvey(surveyId);
    if (!survey || survey.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Max 5MB (after client compression)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const { storage } = getFirebaseAdmin();
    const bucket = storage.bucket();

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `surveys/${surveyId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;

    const blob = bucket.file(filename);
    await blob.save(buffer, {
      metadata: {
        contentType: file.type,
        cacheControl: "public, max-age=31536000",
      },
    });

    await blob.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
