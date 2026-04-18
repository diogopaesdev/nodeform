import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hasAddon } from "@/lib/services/addons";
import { createApiKey, listApiKeys } from "@/lib/services/api-keys";

const CreateSchema = z.object({
  name: z.string().min(1).max(80),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasAddon(session.user.id, "respondents"))) {
    return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
  }

  const keys = await listApiKeys(session.user.id);
  return NextResponse.json({ keys });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await hasAddon(session.user.id, "respondents"))) {
    return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
  }

  const parsed = CreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Nome inválido" }, { status: 400 });
  }

  const { record, rawKey } = await createApiKey(session.user.id, parsed.data.name);

  // rawKey shown only once
  return NextResponse.json({ key: { ...record, rawKey } }, { status: 201 });
}
