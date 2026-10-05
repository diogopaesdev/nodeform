import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { upsertRespondent, createRespondentSession } from "@/lib/services/respondents";

const SESSION_COOKIE = "respondent-session";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

// Called by survey page when ?sso_token= is present in URL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const surveyId = searchParams.get("surveyId");
    const isEmbed = searchParams.get("embed") === "true";

    if (!token || !surveyId) {
      return NextResponse.json({ error: "Token ou surveyId ausente" }, { status: 400 });
    }

    const { db } = getFirebaseAdmin();
    const tokenDoc = await db.collection("ssoTokens").doc(token).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const tokenData = tokenDoc.data()!;

    if (tokenData.used) {
      return NextResponse.json({ error: "Token já utilizado" }, { status: 401 });
    }

    if (new Date(tokenData.expiresAt) < new Date()) {
      await tokenDoc.ref.delete();
      return NextResponse.json({ error: "Token expirado" }, { status: 401 });
    }

    if (tokenData.surveyId !== surveyId) {
      return NextResponse.json({ error: "Token inválido para esta pesquisa" }, { status: 401 });
    }

    // Mark as used (single-use enforcement)
    await tokenDoc.ref.update({ used: true });

    // Upsert respondent with profile data from token
    const respondent = await upsertRespondent(tokenData.workspaceId, {
      name: tokenData.name as string,
      email: tokenData.email as string,
      ...(tokenData.profile as Record<string, unknown> ?? {}),
    });

    // Create respondent session
    const sessionToken = await createRespondentSession(respondent.id, tokenData.workspaceId);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      // SameSite=None exige Secure; sem isto o navegador descarta o cookie do
      // embed sem avisar, e o SSO "funciona" mas a sessão não persiste.
      secure: isEmbed || process.env.NODE_ENV === "production",
      // SameSite=none required for cross-origin iframes (embed mode)
      sameSite: isEmbed ? "none" : "lax",
      // Partitioned (CHIPS): guarda o cookie numa partição por site incorporador.
      // É o que Chrome (incluindo janela anônima), Safari e Firefox passaram a
      // exigir de cookie de terceiro — sem isso o respondente autentica pelo SSO
      // e as chamadas seguintes chegam sem sessão.
      ...(isEmbed ? { partitioned: true } : {}),
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    return NextResponse.json({
      respondent: {
        id: respondent.id,
        name: respondent.name,
        email: respondent.email,
      },
    });
  } catch (error) {
    console.error("SSO auth error:", error);
    return NextResponse.json({ error: "Erro ao autenticar" }, { status: 500 });
  }
}
