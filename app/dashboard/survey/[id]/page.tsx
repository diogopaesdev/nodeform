"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Users,
  Calendar,
  BarChart3,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2,
  User,
  Mail,
  Clock,
  ChevronDown,
  ChevronUp,
  Code,
  Globe,
  FileEdit,
  Archive,
  Download,
  Star,
  Hash,
  TrendingUp,
  GitCompareArrows,
  Gift,
  XCircle,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Survey, SurveyResponse, ChoiceOption } from "@/types/survey";
import { ParticipationWithRespondent } from "@/types/respondent";
import { useI18n } from "@/lib/i18n";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<Survey["status"], string> = {
  draft:     "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  finished:  "bg-blue-100 text-blue-700",
  archived:  "bg-amber-100 text-amber-700",
};

function formatDate(dateString: string, short = false) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(short ? {} : { hour: "2-digit", minute: "2-digit" }),
  });
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ─── Question analytics ────────────────────────────────────────────────────────

function useQuestionAnalytics(survey: Survey | null, responses: SurveyResponse[]) {
  return useMemo(() => {
    if (!survey || responses.length === 0) return [];

    return survey.nodes
      .filter((n) => ["singleChoice", "multipleChoice", "rating"].includes(n.data.type))
      .map((node) => {
        const type = node.data.type;

        if (type === "singleChoice" || type === "multipleChoice") {
          const counts: Record<string, number> = {};
          responses.forEach((r) => {
            const answer = r.answers.find((a) => a.nodeId === node.id);
            if (!answer) return;
            const ids =
              type === "singleChoice"
                ? answer.selectedOptionId
                  ? [answer.selectedOptionId]
                  : []
                : answer.selectedOptionIds ?? [];
            ids.forEach((id) => {
              counts[id] = (counts[id] || 0) + 1;
            });
          });

          const options = node.data.options ?? [];
          const chartData = options.map((opt) => ({
            name: opt.label.length > 28 ? opt.label.slice(0, 28) + "…" : opt.label,
            value: counts[opt.id] || 0,
            pct: responses.length > 0 ? Math.round(((counts[opt.id] || 0) / responses.length) * 100) : 0,
          }));

          return { node, type, chartData, total: responses.length };
        }

        if (type === "rating") {
          const values: number[] = [];
          responses.forEach((r) => {
            const answer = r.answers.find((a) => a.nodeId === node.id);
            if (answer?.ratingValue !== undefined) values.push(answer.ratingValue);
          });

          const min = node.data.minValue ?? 1;
          const max = node.data.maxValue ?? 5;
          const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

          // Distribution per rating value
          const dist: Record<number, number> = {};
          for (let i = min; i <= max; i++) dist[i] = 0;
          values.forEach((v) => { dist[v] = (dist[v] || 0) + 1; });

          const chartData = Object.entries(dist).map(([val, count]) => ({
            name: String(val),
            value: count,
            pct: values.length > 0 ? Math.round((count / values.length) * 100) : 0,
          }));

          return { node, type, chartData, avg, min, max, total: values.length };
        }

        return null;
      })
      .filter(Boolean) as {
        node: Survey["nodes"][0];
        type: string;
        chartData: { name: string; value: number; pct: number }[];
        avg?: number;
        min?: number;
        max?: number;
        total: number;
      }[];
  }, [survey, responses]);
}

// ─── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { pct: number } }[] }) {
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      {payload[0].value} {t.surveyDetail.analytics.resp} ({payload[0].payload.pct}%)
    </div>
  );
}

// ─── Question Card ─────────────────────────────────────────────────────────────

function QuestionAnalyticsCard({ item }: {
  item: {
    node: Survey["nodes"][0];
    type: string;
    chartData: { name: string; value: number; pct: number }[];
    avg?: number;
    min?: number;
    max?: number;
    total: number;
  };
}) {
  const { t } = useI18n();
  const maxVal = Math.max(...item.chartData.map((d) => d.value), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
            {item.type === "singleChoice"
              ? t.surveyDetail.analytics.singleChoice
              : item.type === "multipleChoice"
              ? t.surveyDetail.analytics.multipleChoice
              : t.surveyDetail.analytics.rating}
          </p>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{item.node.data.title || t.surveyDetail.analytics.noTitle}</p>
        </div>
        <span className="flex-shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {item.total} {t.surveyDetail.analytics.resp}
        </span>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        {item.type === "rating" && item.avg !== undefined ? (
          <div className="space-y-4">
            {/* Average score highlight */}
            <div className="flex items-center gap-4">
              <div className="flex items-end gap-1">
                <span className="text-3xl font-bold text-gray-900">{item.avg.toFixed(1)}</span>
                <span className="text-sm text-gray-400 mb-1">/ {item.max}</span>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full"
                    style={{ width: `${((item.avg - (item.min ?? 1)) / ((item.max ?? 5) - (item.min ?? 1))) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  {t.surveyDetail.analytics.avg.replace("{n}", String(item.total))}
                </p>
              </div>
            </div>
            {/* Distribution */}
            <div className="space-y-1.5">
              {item.chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-4 text-right flex-shrink-0">{d.name}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 rounded-full transition-all"
                      style={{ width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={item.chartData.length * 36 + 8}>
            <BarChart
              data={item.chartData}
              layout="vertical"
              margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
              barCategoryGap="25%"
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={160}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 11, fill: "#9ca3af", formatter: (v: unknown) => `${Math.round(((v as number) / (item.total || 1)) * 100)}%` }}>
                {item.chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#111827" : i === 1 ? "#374151" : i === 2 ? "#6b7280" : "#d1d5db"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── Cross-analysis ───────────────────────────────────────────────────────────

const CROSS_COLORS = ["#111827", "#374151", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb", "#1d4ed8", "#7c3aed", "#065f46", "#92400e"];

function getNodeOptions(node: Survey["nodes"][0]): ChoiceOption[] {
  const d = node.data;
  if (d.type === "singleChoice" || d.type === "multipleChoice") return d.options;
  return [];
}

function useCrossAnalytics(
  survey: Survey | null,
  responses: SurveyResponse[],
  segmentNodeId: string | null,
  targetNodeId: string | null,
) {
  return useMemo(() => {
    if (!survey || !segmentNodeId || !targetNodeId || segmentNodeId === targetNodeId || responses.length === 0) return null;

    const segmentNode = survey.nodes.find((n) => n.id === segmentNodeId);
    const targetNode = survey.nodes.find((n) => n.id === targetNodeId);
    if (!segmentNode || !targetNode) return null;

    const segOpts = getNodeOptions(segmentNode);
    const tgtOpts = getNodeOptions(targetNode);
    if (segOpts.length === 0 || tgtOpts.length === 0) return null;

    const rows = segOpts.map((segOpt) => {
      const segResponses = responses.filter((r) => {
        const ans = r.answers.find((a) => a.nodeId === segmentNodeId);
        if (!ans) return false;
        if (segmentNode.data.type === "singleChoice") return ans.selectedOptionId === segOpt.id;
        return ans.selectedOptionIds?.includes(segOpt.id) ?? false;
      });

      const counts: Record<string, number> = {};
      tgtOpts.forEach((o) => { counts[o.id] = 0; });
      segResponses.forEach((r) => {
        const ans = r.answers.find((a) => a.nodeId === targetNodeId);
        if (!ans) return;
        if (targetNode.data.type === "singleChoice" && ans.selectedOptionId) {
          counts[ans.selectedOptionId] = (counts[ans.selectedOptionId] || 0) + 1;
        } else if (targetNode.data.type === "multipleChoice" && ans.selectedOptionIds) {
          ans.selectedOptionIds.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
        }
      });

      const row: Record<string, string | number> = {
        name: segOpt.label.length > 22 ? segOpt.label.slice(0, 22) + "…" : segOpt.label,
        _total: segResponses.length,
      };
      tgtOpts.forEach((o) => { row[o.id] = counts[o.id]; });
      return row;
    }).filter((r) => (r._total as number) > 0);

    return { rows, segmentNode, targetNode, tgtOpts };
  }, [survey, responses, segmentNodeId, targetNodeId]);
}

function CrossAnalysisPanel({
  survey,
  responses,
}: {
  survey: Survey;
  responses: SurveyResponse[];
}) {
  const { t } = useI18n();
  const choiceNodes = survey.nodes.filter((n) =>
    n.data.type === "singleChoice" || n.data.type === "multipleChoice"
  );

  const [segmentId, setSegmentId] = useState<string>(choiceNodes[0]?.id ?? "");
  const [targetId, setTargetId] = useState<string>(choiceNodes[1]?.id ?? "");

  const result = useCrossAnalytics(survey, responses, segmentId, targetId);

  if (choiceNodes.length < 2) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl text-center py-16">
        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <GitCompareArrows className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">{t.surveyDetail.crossAnalysis.needMoreQuestions}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selects */}
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {t.surveyDetail.crossAnalysis.segmentBy}
            </label>
            <select
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {choiceNodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.data.title || t.surveyDetail.analytics.noTitle}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              {t.surveyDetail.crossAnalysis.analyzeQuestion}
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              {choiceNodes
                .filter((n) => n.id !== segmentId)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.title || t.surveyDetail.analytics.noTitle}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      {!result || result.rows.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl text-center py-16">
          <p className="text-sm text-gray-500">{t.surveyDetail.crossAnalysis.noData}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-2 border-b border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-800">
                {result.targetNode.data.title || t.surveyDetail.analytics.noTitle}
              </span>
              {" · "}{t.surveyDetail.crossAnalysis.segmentBy.toLowerCase()}{": "}
              <span className="font-semibold text-gray-800">
                {result.segmentNode.data.title || t.surveyDetail.analytics.noTitle}
              </span>
            </p>
          </div>
          <div className="px-5 py-4">
            <ResponsiveContainer width="100%" height={Math.max(280, result.rows.length * 60 + 60)}>
              <BarChart
                data={result.rows}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barCategoryGap="30%"
                barGap={2}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={150}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const opt = result.tgtOpts.find((o) => o.id === String(name));
                    return [String(value) + " " + t.surveyDetail.crossAnalysis.respondents, opt?.label ?? String(name)];
                  }}
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                />
                <Legend
                  formatter={(value: string) => {
                    const opt = result.tgtOpts.find((o) => o.id === value);
                    const label = opt?.label ?? value;
                    return label.length > 30 ? label.slice(0, 30) + "…" : label;
                  }}
                  wrapperStyle={{ fontSize: 11, paddingTop: 12 }}
                />
                {result.tgtOpts.map((opt, i) => (
                  <Bar
                    key={opt.id}
                    dataKey={opt.id}
                    radius={[0, 4, 4, 0]}
                    fill={CROSS_COLORS[i % CROSS_COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bonus Panel ─────────────────────────────────────────────────────────────

const BONUS_STATUS_META = {
  pending:    { label: "Pendente",    badge: "bg-amber-100 text-amber-700" },
  released:   { label: "Liberado",   badge: "bg-green-100 text-green-700" },
  ineligible: { label: "Inelegível", badge: "bg-red-100 text-red-600" },
};

function BonusPanel({ surveyId, survey, onSurveyChange }: {
  surveyId: string;
  survey: Survey;
  onSurveyChange: (s: Survey) => void;
}) {
  const [participations, setParticipations] = useState<ParticipationWithRespondent[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchParticipations();
  }, [surveyId]);

  const fetchParticipations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/participations`);
      if (res.ok) {
        const data = await res.json();
        setParticipations(data.participations ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateBonus = async (
    participationId: string,
    bonusStatus: "pending" | "released" | "ineligible"
  ) => {
    setUpdating(participationId);
    try {
      const res = await fetch(
        `/api/surveys/${surveyId}/participations/${participationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bonusStatus }),
        }
      );
      if (!res.ok) return;

      setParticipations((prev) =>
        prev.map((p) =>
          p.id === participationId
            ? {
                ...p,
                bonusStatus,
                bonusReleasedAt: bonusStatus === "released" ? new Date().toISOString() : p.bonusReleasedAt,
              }
            : p
        )
      );

      // Reflect quota changes on survey object
      const prev = participations.find((p) => p.id === participationId);
      if (prev) {
        const wasIneligible = prev.bonusStatus === "ineligible";
        const becomingIneligible = bonusStatus === "ineligible";
        if (!wasIneligible && becomingIneligible) {
          const newCount = survey.responseCount - 1;
          const newStatus =
            survey.status === "finished" && survey.maxResponses && newCount < survey.maxResponses
              ? "published"
              : survey.status;
          onSurveyChange({ ...survey, responseCount: newCount, status: newStatus });
        } else if (wasIneligible && !becomingIneligible) {
          const newCount = survey.responseCount + 1;
          const newStatus =
            survey.maxResponses && newCount >= survey.maxResponses ? "finished" : survey.status;
          onSurveyChange({ ...survey, responseCount: newCount, status: newStatus });
        }
      }
    } finally {
      setUpdating(null);
    }
  };

  const counts = useMemo(() => ({
    total: participations.length,
    pending: participations.filter((p) => p.bonusStatus === "pending").length,
    released: participations.filter((p) => p.bonusStatus === "released").length,
    ineligible: participations.filter((p) => p.bonusStatus === "ineligible").length,
  }), [participations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (participations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="text-center py-16">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Gift className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhum respondente concluiu ainda</h3>
          <p className="text-xs text-gray-500">
            As participações concluídas aparecerão aqui para revisão e liberação de bonificação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: counts.total, color: "text-gray-900" },
          { label: "Pendentes", value: counts.pending, color: "text-amber-600" },
          { label: "Liberados", value: counts.released, color: "text-green-600" },
          { label: "Inelegíveis", value: counts.ineligible, color: "text-red-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Respondentes</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {participations.map((p) => {
            const meta = BONUS_STATUS_META[p.bonusStatus];
            const isUpdating = updating === p.id;
            const profileEntries = Object.entries(p.profile).filter(
              ([, v]) => v !== undefined && v !== null && v !== ""
            );

            return (
              <div key={p.id} className="px-5 py-4">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
                    {getInitials(p.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900">{p.name}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Mail className="w-3 h-3" />{p.email}
                      </span>
                      <span className={`px-2 py-0.5 text-[11px] font-medium rounded-full ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {p.completedAt && (
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />{formatDate(p.completedAt)}
                        </span>
                      )}
                      {p.totalScore !== undefined && survey.enableScoring && (
                        <span className="text-[11px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                          {p.totalScore} pts
                        </span>
                      )}
                      {p.bonusReleasedAt && (
                        <span className="text-[11px] text-green-600">
                          Liberado em {formatDate(p.bonusReleasedAt)}
                        </span>
                      )}
                    </div>

                    {profileEntries.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profileEntries.map(([k, v]) => (
                          <span key={k} className="text-[11px] bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5 text-gray-600">
                            <span className="font-medium text-gray-400">{k}:</span> {String(v)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {p.bonusStatus !== "released" && (
                      <button
                        onClick={() => updateBonus(p.id, "released")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                        Liberar
                      </button>
                    )}
                    {p.bonusStatus !== "ineligible" && (
                      <button
                        onClick={() => updateBonus(p.id, "ineligible")}
                        disabled={isUpdating}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Inelegível
                      </button>
                    )}
                    {p.bonusStatus !== "pending" && (
                      <button
                        onClick={() => updateBonus(p.id, "pending")}
                        disabled={isUpdating}
                        title="Reverter para pendente"
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!survey.requiresRespondentLogin && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Esta pesquisa não exige login de respondente. Apenas participações autenticadas aparecem aqui.
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SurveyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();
  const { data: session } = useSession();
  const hasRespondentsAddon = session?.user?.addons?.respondents?.active === true;
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "responses" | "crossanalysis" | "bonus">("analytics");
  const [deleteResponseModal, setDeleteResponseModal] = useState<{ open: boolean; responseId: string; loading: boolean }>({
    open: false, responseId: "", loading: false,
  });

  // STATUS_META built inside component so labels are translated
  const STATUS_META: Record<Survey["status"], { label: string; badge: string }> = {
    draft:     { label: t.surveyDetail.status.draft,     badge: "bg-gray-100 text-gray-600" },
    published: { label: t.surveyDetail.status.published, badge: "bg-green-100 text-green-700" },
    finished:  { label: t.surveyDetail.status.finished,  badge: "bg-blue-100 text-blue-700" },
    archived:  { label: t.surveyDetail.status.archived,  badge: "bg-amber-100 text-amber-700" },
  };

  const analytics = useQuestionAnalytics(survey, responses);

  useEffect(() => {
    fetchSurvey();
  }, [id]);

  useEffect(() => {
    if (survey && survey.responseCount > 0) fetchResponses();
  }, [survey]);

  const fetchSurvey = async () => {
    try {
      const res = await fetch(`/api/surveys/${id}`);
      if (!res.ok) { router.push("/dashboard"); return; }
      const data = await res.json();
      setSurvey(data.survey);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    setLoadingResponses(true);
    try {
      const res = await fetch(`/api/surveys/${id}/responses`);
      if (res.ok) {
        const data = await res.json();
        setResponses(data.responses || []);
      }
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoadingResponses(false);
    }
  };

  const handleDeleteResponse = (responseId: string) => {
    setDeleteResponseModal({ open: true, responseId, loading: false });
  };

  const confirmDeleteResponse = async () => {
    setDeleteResponseModal((m) => ({ ...m, loading: true }));
    try {
      const res = await fetch(`/api/surveys/${id}/responses?responseId=${deleteResponseModal.responseId}`, { method: "DELETE" });
      if (res.ok) {
        setResponses(responses.filter((r) => r.id !== deleteResponseModal.responseId));
        if (survey) setSurvey({ ...survey, responseCount: survey.responseCount - 1 });
      }
      setDeleteResponseModal({ open: false, responseId: "", loading: false });
    } catch (error) {
      console.error("Error deleting response:", error);
      setDeleteResponseModal((m) => ({ ...m, loading: false }));
    }
  };

  const handleUpdateStatus = async (newStatus: Survey["status"]) => {
    if (!survey) return;
    try {
      const res = await fetch(`/api/surveys/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) setSurvey({ ...survey, status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getSurveyUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/survey/${id}`;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getSurveyUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEmbedCode = () => {
    const url = getSurveyUrl();
    return `<iframe\n  id="surveyflow-survey"\n  src="${url}?embed=true"\n  frameborder="0"\n  style="width: 100%; border: none; overflow: hidden;"\n  scrolling="no"\n></iframe>\n<script>\nwindow.addEventListener("message", function(e) {\n  if (e.data && e.data.type === "surveyflow-resize") {\n    document.getElementById("surveyflow-survey").style.height = e.data.height + "px";\n  }\n});\n</script>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const getAnswerLabel = (node: Survey["nodes"][0], answer: SurveyResponse["answers"][0]): string => {
    const data = node.data;
    if (data.type === "presentation") {
      const parts = [];
      if (answer.respondentName) parts.push(`${t.surveyDetail.getAnswerLabel.namePrefix}${answer.respondentName}`);
      if (answer.respondentEmail) parts.push(`${t.surveyDetail.getAnswerLabel.emailPrefix}${answer.respondentEmail}`);
      return parts.length > 0 ? parts.join(" | ") : t.surveyDetail.getAnswerLabel.startedSurvey;
    }
    if (data.type === "singleChoice" && answer.selectedOptionId) {
      const option = data.options.find((o) => o.id === answer.selectedOptionId);
      return option?.label || t.surveyDetail.getAnswerLabel.optionNotFound;
    }
    if (data.type === "multipleChoice" && answer.selectedOptionIds) {
      const labels = answer.selectedOptionIds.map((optId) => data.options.find((o) => o.id === optId)?.label).filter(Boolean);
      return labels.join(", ") || t.surveyDetail.getAnswerLabel.noOptionSelected;
    }
    if (data.type === "rating" && answer.ratingValue !== undefined) {
      return `${answer.ratingValue} ${t.surveyDetail.getAnswerLabel.ratingOf} ${data.maxValue}`;
    }
    if (data.type === "textInput" && answer.textValue !== undefined) {
      return answer.textValue;
    }
    return t.surveyDetail.getAnswerLabel.noAnswer;
  };

  const handleExportCSV = () => {
    if (!survey || responses.length === 0) return;
    const esc = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
    const questionNodes = survey.nodes.filter((n) => n.data.type !== "presentation" && n.data.type !== "endScreen");
    const headers = [t.surveyDetail.csv.name, t.surveyDetail.csv.email, ...questionNodes.map((n) => n.data.title || t.surveyDetail.csv.question), ...(survey.enableScoring ? [t.surveyDetail.csv.score] : []), t.surveyDetail.csv.date];
    const rows = responses.map((response) => [
      esc(response.respondentName || ""),
      esc(response.respondentEmail || ""),
      ...questionNodes.map((node) => {
        const answer = response.answers.find((a) => a.nodeId === node.id);
        return esc(answer ? getAnswerLabel(node, answer) : "");
      }),
      ...(survey.enableScoring ? [String(response.totalScore)] : []),
      formatDate(response.completedAt),
    ]);
    const csv = [headers.map(esc).join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${survey.title.replace(/[^a-zA-Z0-9]/g, "_")}_respostas.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportXLSX = async () => {
    if (!survey || responses.length === 0) return;
    const XLSX = await import("xlsx");
    const questionNodes = survey.nodes.filter((n) => n.data.type !== "presentation" && n.data.type !== "endScreen");
    const headers = [t.surveyDetail.csv.name, t.surveyDetail.csv.email, ...questionNodes.map((n) => n.data.title || t.surveyDetail.csv.question), ...(survey.enableScoring ? [t.surveyDetail.csv.score] : []), t.surveyDetail.csv.date];
    const rows = responses.map((response) => [
      response.respondentName || "",
      response.respondentEmail || "",
      ...questionNodes.map((node) => {
        const answer = response.answers.find((a) => a.nodeId === node.id);
        return answer ? getAnswerLabel(node, answer) : "";
      }),
      ...(survey.enableScoring ? [response.totalScore] : []),
      formatDate(response.completedAt),
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Respostas");
    XLSX.writeFile(wb, `${survey.title.replace(/[^a-zA-Z0-9]/g, "_")}_respostas.xlsx`);
  };

  const avgScore = useMemo(() => {
    if (!survey?.enableScoring || responses.length === 0) return null;
    return (responses.reduce((a, r) => a + r.totalScore, 0) / responses.length).toFixed(1);
  }, [survey, responses]);

  // ── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-6xl">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!survey) return null;

  const questionCount = survey.nodes.filter((n) => !["presentation", "endScreen"].includes(n.data.type)).length;

  return (
    <div className="p-6 max-w-6xl space-y-6">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        {t.surveyDetail.back}
      </Link>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h1 className="text-xl font-semibold text-gray-900 truncate">{survey.title}</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-opacity hover:opacity-80 ${STATUS_META[survey.status].badge}`}>
                  {STATUS_META[survey.status].label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[140px]">
                <DropdownMenuItem onClick={() => handleUpdateStatus("draft")} className={`text-xs ${survey.status === "draft" ? "bg-gray-50" : ""}`}>
                  <FileEdit className="w-3.5 h-3.5 mr-2 text-gray-500" />{t.surveyDetail.status.setDraft}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus("published")} className={`text-xs ${survey.status === "published" ? "bg-gray-50" : ""}`}>
                  <Globe className="w-3.5 h-3.5 mr-2 text-green-600" />{t.surveyDetail.status.setPublished}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus("finished")} className={`text-xs ${survey.status === "finished" ? "bg-gray-50" : ""}`}>
                  <Check className="w-3.5 h-3.5 mr-2 text-blue-600" />{t.surveyDetail.status.setFinished}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleUpdateStatus("archived")} className={`text-xs ${survey.status === "archived" ? "bg-gray-50" : ""}`}>
                  <Archive className="w-3.5 h-3.5 mr-2 text-amber-600" />{t.surveyDetail.status.setArchived}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {survey.description && (
            <p className="text-sm text-gray-500 mt-0.5">{survey.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            {copied
              ? <><Check className="w-3.5 h-3.5 text-green-600" />{t.common.copied}</>
              : <><LinkIcon className="w-3.5 h-3.5" />{t.common.share}</>}
          </button>
          {session?.user?.planId === "growth" ? (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-300 bg-white border border-gray-100 rounded-md cursor-not-allowed"
              title="Embed disponível a partir do Plano Pro"
            >
              <Code className="w-3.5 h-3.5" />{t.common.embed}
            </div>
          ) : (
            <button
              onClick={() => setEmbedModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
            >
              <Code className="w-3.5 h-3.5" />{t.common.embed}
            </button>
          )}
          <button
            onClick={() => router.push(`/editor/${survey.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />{t.surveyDetail.edit}
          </button>
        </div>
      </div>

      {/* ── Embed Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogTitle className="sr-only">{t.surveyDetail.embedModal.title}</DialogTitle>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{t.surveyDetail.embedModal.title}</h2>
              <p className="text-xs text-gray-500">{t.surveyDetail.embedModal.subtitle}</p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 text-xs overflow-x-auto">
                <code>{getEmbedCode()}</code>
              </pre>
              <button
                onClick={handleCopyEmbed}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              >
                {copiedEmbed
                  ? <><Check className="w-3 h-3 text-green-400" />{t.common.copied}</>
                  : <><Copy className="w-3 h-3" />{t.common.copy}</>}
              </button>
            </div>
            <p className="text-xs text-gray-400">{t.surveyDetail.embedModal.disclaimer}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{t.surveyDetail.stats.responses}</span>
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{survey.responseCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{t.surveyDetail.stats.questions}</span>
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Hash className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{questionCount}</p>
        </div>

        {avgScore !== null ? (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{t.surveyDetail.stats.avgScore}</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{avgScore}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{t.surveyDetail.stats.updatedAt}</span>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900">{formatDate(survey.updatedAt, true)}</p>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{t.surveyDetail.stats.createdAt}</span>
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">{formatDate(survey.createdAt, true)}</p>
        </div>
      </div>

      {/* ── Survey Link ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3">
        <LinkIcon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <div className="flex-1 font-mono text-xs text-gray-500 truncate">{getSurveyUrl()}</div>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex-shrink-0"
        >
          {copied
            ? <><Check className="w-3 h-3 text-green-600" />{t.common.copied}</>
            : <><Copy className="w-3 h-3" />{t.common.copy}</>}
        </button>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      {survey.responseCount > 0 && (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "analytics" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              {t.surveyDetail.tabs.analytics}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "responses" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {t.surveyDetail.tabs.responses.replace("{n}", String(survey.responseCount))}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("crossanalysis")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "crossanalysis" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="flex items-center gap-1.5">
              <GitCompareArrows className="w-3.5 h-3.5" />
              {t.surveyDetail.tabs.crossAnalysis}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("bonus")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "bonus" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <span className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              Bonificação
            </span>
          </button>
        </div>
      )}

      {/* ── Analytics Tab ───────────────────────────────────────────────────── */}
      {(activeTab === "analytics" || survey.responseCount === 0) && (
        <>
          {survey.responseCount === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="text-center py-16">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{t.surveyDetail.analytics.noResponses}</h3>
                <p className="text-xs text-gray-500">{t.surveyDetail.analytics.noResponsesDesc}</p>
              </div>
            </div>
          ) : loadingResponses ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : analytics.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {analytics.map((item) => (
                <QuestionAnalyticsCard key={item.node.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="text-center py-16">
                <p className="text-sm text-gray-500">{t.surveyDetail.analytics.noQuestions}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Responses Tab ───────────────────────────────────────────────────── */}
      {activeTab === "responses" && survey.responseCount > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">{t.surveyDetail.responses.title}</h2>
            {responses.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    {t.surveyDetail.responses.exportCsv}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={handleExportCSV} className="text-xs cursor-pointer">
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportXLSX} className="text-xs cursor-pointer">
                    Exportar Excel (.xlsx)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {loadingResponses ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {responses.map((response, idx) => (
                <div key={response.id}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedResponse(expandedResponse === response.id ? null : response.id)}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-600">
                      {getInitials(response.respondentName)}
                    </div>

                    {/* Identity */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {response.respondentName ? (
                          <span className="text-sm font-medium text-gray-900">{response.respondentName}</span>
                        ) : (
                          <span className="text-sm text-gray-400 italic">{t.surveyDetail.responses.anonymous}</span>
                        )}
                        {response.respondentEmail && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Mail className="w-3 h-3" />{response.respondentEmail}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />{formatDate(response.completedAt)}
                        </span>
                        <span className="text-[11px] text-gray-300">·</span>
                        <span className="text-[11px] text-gray-400">#{idx + 1}</span>
                      </div>
                    </div>

                    {/* Score + controls */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {survey.enableScoring && (
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                          {response.totalScore} pts
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteResponse(response.id); }}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {expandedResponse === response.id
                        ? <ChevronUp className="w-4 h-4 text-gray-400" />
                        : <ChevronDown className="w-4 h-4 text-gray-400" />
                      }
                    </div>
                  </div>

                  {/* Expanded answers */}
                  {expandedResponse === response.id && (
                    <div className="px-5 pb-4 pt-1 bg-gray-50 border-t border-gray-100">
                      <div className="grid sm:grid-cols-2 gap-2 mt-2">
                        {response.answers.map((answer, i) => {
                          const node = survey.nodes.find((n) => n.id === answer.nodeId);
                          if (!node) return null;
                          return (
                            <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                {node.data.type === "presentation"
                                  ? t.surveyDetail.responses.identification
                                  : node.data.title || t.surveyDetail.responses.questionLabel.replace("{n}", String(i + 1))}
                              </p>
                              <p className="text-xs text-gray-800">{getAnswerLabel(node, answer)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cross-Analysis Tab ──────────────────────────────────────────────── */}
      {activeTab === "crossanalysis" && survey.responseCount > 0 && (
        loadingResponses ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <CrossAnalysisPanel survey={survey} responses={responses} />
        )
      )}

      {/* ── Bonus Tab ───────────────────────────────────────────────────────── */}
      {activeTab === "bonus" && (
        !hasRespondentsAddon || !survey.requiresRespondentLogin ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center space-y-6">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Painel de Bonificação indisponível</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Para usar o painel de bonificação, as seguintes condições precisam estar ativas:
              </p>
            </div>
            <div className="flex flex-col gap-3 max-w-sm mx-auto text-left">
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${hasRespondentsAddon ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${hasRespondentsAddon ? "bg-green-500" : "bg-gray-300"}`}>
                  {hasRespondentsAddon
                    ? <Check className="w-3 h-3 text-white" />
                    : <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${hasRespondentsAddon ? "text-green-700" : "text-gray-700"}`}>
                    Módulo Respondentes ativo
                  </p>
                  {!hasRespondentsAddon && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Ative o Módulo Respondentes em <span className="font-medium">Configurações → Integrações</span>.
                    </p>
                  )}
                </div>
              </div>
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${survey.requiresRespondentLogin ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${survey.requiresRespondentLogin ? "bg-green-500" : "bg-gray-300"}`}>
                  {survey.requiresRespondentLogin
                    ? <Check className="w-3 h-3 text-white" />
                    : <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <div>
                  <p className={`text-xs font-semibold ${survey.requiresRespondentLogin ? "text-green-700" : "text-gray-700"}`}>
                    Login obrigatório para respondentes
                  </p>
                  {!survey.requiresRespondentLogin && (
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Ative nas configurações da pesquisa no editor.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <BonusPanel
            surveyId={id}
            survey={survey}
            onSurveyChange={setSurvey}
          />
        )
      )}

      <DeleteConfirmModal
        open={deleteResponseModal.open}
        onOpenChange={(open) => !deleteResponseModal.loading && setDeleteResponseModal((m) => ({ ...m, open }))}
        title={t.surveyDetail.deleteResponseModal.title}
        description={t.surveyDetail.deleteResponseModal.description}
        onConfirm={confirmDeleteResponse}
        loading={deleteResponseModal.loading}
        labels={{
          deleteButton: t.surveyDetail.deleteResponseModal.deleteButton,
          cancelButton: t.common.cancel,
          cannotBeUndone: t.surveyDetail.deleteResponseModal.cannotBeUndone,
        }}
      />
    </div>
  );
}
