import { NextRequest, NextResponse } from "next/server";
import { getSurvey } from "@/lib/services/surveys";
import { getSurveyEvents } from "@/lib/services/survey-events";
import { getSurveyProgressList } from "@/lib/services/respondents";
import { resolveWorkspace } from "@/lib/services/resolve-workspace";
import { getCollaboratorAccessForUser } from "@/lib/services/collaborators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await resolveWorkspace(request);
    if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { id: surveyId } = await params;
    const survey = await getSurvey(surveyId);
    if (!survey) return NextResponse.json({ error: "Pesquisa não encontrada" }, { status: 404 });

    const isOwner = survey.userId === auth.workspaceId;
    if (!isOwner) {
      const role = await getCollaboratorAccessForUser(surveyId, auth.workspaceId);
      if (!role) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const [events, inProgress] = await Promise.all([
      getSurveyEvents(surveyId),
      getSurveyProgressList(surveyId),
    ]);

    const opened = events.filter((e) => e.type === "opened").length;

    // Inelegíveis: agrega por respondente (uma pessoa pode tentar várias vezes).
    const ineligibleEvents = events
      .filter((e) => e.type === "blocked_ineligible")
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    const ineligibleMap = new Map<
      string,
      { respondentId?: string; name: string; email: string; reason?: string; attempts: number; lastAt: string }
    >();
    for (const e of ineligibleEvents) {
      const key = e.respondentId ?? e.respondentEmail ?? e.id;
      const existing = ineligibleMap.get(key);
      if (existing) {
        existing.attempts += 1;
      } else {
        ineligibleMap.set(key, {
          respondentId: e.respondentId,
          name: e.respondentName ?? "—",
          email: e.respondentEmail ?? "—",
          reason: e.reason,
          attempts: 1,
          lastAt: e.createdAt,
        });
      }
    }
    const ineligible = Array.from(ineligibleMap.values());

    const completed = Math.max(0, survey.responseCount ?? 0);

    return NextResponse.json({
      counts: {
        opened,
        ineligiblePeople: ineligible.length,
        ineligibleAttempts: ineligibleEvents.length,
        inProgress: inProgress.length,
        completed,
      },
      ineligible,
      inProgress,
    });
  } catch (error) {
    console.error("Error fetching survey activity:", error);
    return NextResponse.json({ error: "Erro ao buscar atividades" }, { status: 500 });
  }
}
