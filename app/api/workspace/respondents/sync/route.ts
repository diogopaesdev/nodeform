import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/services/api-keys";
import { hasAddon } from "@/lib/services/addons";
import { upsertRespondent } from "@/lib/services/respondents";

// Server-to-server: MOC backend pushes profile updates without requiring user to log in
const RespondentSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  profile: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

const Schema = z.object({
  apiKey: z.string().min(1),
  respondents: z.array(RespondentSchema).min(1).max(500),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { apiKey, respondents } = parsed.data;

    const keyRecord = await validateApiKey(apiKey);
    if (!keyRecord) {
      return NextResponse.json({ error: "API key inválida" }, { status: 401 });
    }

    if (!(await hasAddon(keyRecord.workspaceId, "respondents"))) {
      return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
    }

    const results = await Promise.allSettled(
      respondents.map((r) =>
        upsertRespondent(keyRecord.workspaceId, {
          name: r.name,
          email: r.email,
          ...(r.profile ?? {}),
        })
      )
    );

    const synced = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({ synced, failed });
  } catch (error) {
    console.error("Respondent sync error:", error);
    return NextResponse.json({ error: "Erro ao sincronizar respondentes" }, { status: 500 });
  }
}
