import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { validateApiKey } from "@/lib/services/api-keys";
import { hasAddon } from "@/lib/services/addons";
import { getSurvey } from "@/lib/services/surveys";
import { upsertRespondent } from "@/lib/services/respondents";

// Server-to-server endpoint: MOC backend calls this to get a one-time SSO token
const Schema = z.object({
  surveyId: z.string().min(1).max(100),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  profile: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes, single-use

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    if (!auth?.startsWith("Bearer nfk_")) {
      return NextResponse.json({ error: "API key ausente ou inválida" }, { status: 401 });
    }
    const keyRecord = await validateApiKey(auth.slice(7));
    if (!keyRecord) {
      return NextResponse.json({ error: "API key inválida" }, { status: 401 });
    }

    if (!(await hasAddon(keyRecord.workspaceId, "respondents"))) {
      return NextResponse.json({ error: "Módulo Respondentes não ativo" }, { status: 403 });
    }

    const parsed = Schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    const { surveyId, email, name, profile } = parsed.data;

    const survey = await getSurvey(surveyId);
    if (!survey || survey.userId !== keyRecord.workspaceId) {
      return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });
    }

    // Upsert respondent with latest profile data from the client platform
    await upsertRespondent(keyRecord.workspaceId, {
      name,
      email,
      ...(profile as Record<string, unknown> ?? {}),
    });

    // Generate one-time SSO token
    const { db } = getFirebaseAdmin();
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS).toISOString();

    await db.collection("ssoTokens").doc(token).set({
      token,
      workspaceId: keyRecord.workspaceId,
      surveyId,
      email,
      name,
      profile: profile ?? {},
      expiresAt,
      used: false,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ token, expiresAt });
  } catch (error) {
    console.error("SSO token error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
