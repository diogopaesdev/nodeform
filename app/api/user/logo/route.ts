import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getFirebaseAdmin } from "@/lib/firebase-admin";

function getExt(name: string) {
  const m = name.match(/\.[^.]+$/);
  return m ? m[0] : "";
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "File required" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only images allowed" }, { status: 400 });
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: "Max 2MB" }, { status: 400 });

  const { storage } = getFirebaseAdmin();
  const bucket = storage.bucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = `logos/${session.user.id}/logo_${Date.now()}${getExt(file.name)}`;

  const blob = bucket.file(filename);
  await blob.save(buffer, {
    metadata: { contentType: file.type, cacheControl: "public, max-age=31536000" },
  });
  await blob.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
  return NextResponse.json({ url: publicUrl });
}
