import { NextRequest, NextResponse } from "next/server";
import { getProfileSchema } from "@/lib/services/profile-schema";

// Public read — schema is not sensitive, needed by authenticated editors
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const schema = await getProfileSchema(userId);
  return NextResponse.json({ schema });
}
