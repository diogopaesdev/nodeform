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
  CopyPlus,
  Tag,
  Plus,
  Banknote,
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
import { Survey, SurveyResponse, ChoiceOption, NodeSnapshot, BonusConfig, BonusCoupon, EligibilityRule } from "@/types/survey";
import { EligibilityRuleBuilder } from "@/components/editor/eligibility-rule-builder";
import { ParticipationWithRespondent } from "@/types/respondent";
import { useI18n } from "@/lib/i18n";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { CollaboratorsPanel } from "@/components/dashboard/collaborators-panel";

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

function BonusConfigSection({
  survey,
  surveyId,
  onSurveyChange,
}: {
  survey: Survey;
  surveyId: string;
  onSurveyChange: (s: Survey) => void;
}) {
  const existing = survey.bonusConfig;
  const [open, setOpen] = useState(!existing);
  const [type, setType] = useState<"none" | "value" | "coupons" | "shared_coupon">(existing?.type ?? "none");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [valueAmount, setValueAmount] = useState(existing?.type === "value" ? String(existing.value) : "");
  const [couponInput, setCouponInput] = useState("");
  const [sharedCode, setSharedCode] = useState(existing?.type === "shared_coupon" ? existing.code : "");
  const [sharedMaxQty, setSharedMaxQty] = useState(existing?.type === "shared_coupon" ? String(existing.maxQty) : "");
  const [eligibilityRules, setEligibilityRules] = useState<EligibilityRule[]>(existing?.bonusEligibilityRules ?? []);
  const [saving, setSaving] = useState(false);

  const coupons: BonusCoupon[] = existing?.type === "coupons" ? existing.coupons : [];
  const availableCount = coupons.filter((c) => !c.participationId).length;
  const assignedCount = coupons.filter((c) => c.participationId).length;

  const patchBonusConfig = async (bonusConfig: BonusConfig | null) => {
    await fetch(`/api/surveys/${surveyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bonusConfig }),
    });
    onSurveyChange({ ...survey, bonusConfig: bonusConfig ?? undefined });
  };

  const rules = eligibilityRules.length > 0 ? eligibilityRules : undefined;

  const saveConfig = async () => {
    setSaving(true);
    try {
      let cfg: BonusConfig | null = null;
      if (type === "value") {
        cfg = { type: "value", value: parseFloat(valueAmount) || 0, description: description || undefined, bonusEligibilityRules: rules };
      } else if (type === "coupons") {
        cfg = { type: "coupons", coupons, description: description || undefined, bonusEligibilityRules: rules };
      } else if (type === "shared_coupon") {
        const usedQty = existing?.type === "shared_coupon" ? (existing.usedQty ?? 0) : 0;
        cfg = { type: "shared_coupon", code: sharedCode, maxQty: parseInt(sharedMaxQty) || 0, usedQty, description: description || undefined, bonusEligibilityRules: rules };
      }
      await patchBonusConfig(cfg);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const addCoupons = async () => {
    const newCodes = couponInput
      .split("\n")
      .map((c) => c.trim().toUpperCase())
      .filter((c) => c.length > 0 && !coupons.some((ex) => ex.code === c));
    if (newCodes.length === 0) return;
    setSaving(true);
    try {
      const merged: BonusCoupon[] = [...coupons, ...newCodes.map((code) => ({ code }))];
      const cfg: BonusConfig = { type: "coupons", coupons: merged, description: description || undefined, bonusEligibilityRules: rules };
      await patchBonusConfig(cfg);
      setCouponInput("");
    } finally {
      setSaving(false);
    }
  };

  const removeCoupon = async (code: string) => {
    const updated = coupons.filter((c) => c.code !== code);
    const cfg: BonusConfig = {
      type: "coupons",
      coupons: updated,
      description: existing?.type === "coupons" ? existing.description : undefined,
      bonusEligibilityRules: existing?.type === "coupons" ? existing.bonusEligibilityRules : undefined,
    };
    await patchBonusConfig(cfg);
  };

  const getSummary = () => {
    if (!existing) return "Nenhum bônus configurado";
    const rulesSuffix = (existing.bonusEligibilityRules?.length ?? 0) > 0
      ? ` · ${existing.bonusEligibilityRules!.length} regra${existing.bonusEligibilityRules!.length !== 1 ? "s" : ""} de elegibilidade`
      : "";
    if (existing.type === "value") return `R$ ${existing.value.toFixed(2)} por respondente${existing.description ? ` · ${existing.description}` : ""}${rulesSuffix}`;
    if (existing.type === "coupons") return `${availableCount} disponível${availableCount !== 1 ? "s" : ""} · ${assignedCount} atribuído${assignedCount !== 1 ? "s" : ""}${rulesSuffix}`;
    if (existing.type === "shared_coupon") return `${existing.code} · ${existing.usedQty ?? 0}/${existing.maxQty} usos${rulesSuffix}`;
    return "";
  };

  const TYPE_OPTIONS = [
    { value: "none" as const, label: "Nenhum", icon: XCircle },
    { value: "value" as const, label: "Valor (R$)", icon: Banknote },
    { value: "coupons" as const, label: "Cupons únicos", icon: Tag },
    { value: "shared_coupon" as const, label: "Cupom c/ limite", icon: Hash },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Gift className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-900">Configuração do Bônus</span>
          {!open && (
            <span className="text-xs text-gray-400 truncate ml-1">{getSummary()}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
          {/* Type selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-colors ${
                  type === value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Description (all types except none) */}
          {type !== "none" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Descrição <span className="text-gray-400">(opcional)</span></label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: 20% de desconto na renovação"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}

          {/* Value fields */}
          {type === "value" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Valor por respondente (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valueAmount}
                onChange={(e) => setValueAmount(e.target.value)}
                placeholder="50.00"
                className="w-48 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}

          {/* Shared coupon fields */}
          {type === "shared_coupon" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Código do cupom</label>
                <input
                  type="text"
                  value={sharedCode}
                  onChange={(e) => setSharedCode(e.target.value.toUpperCase())}
                  placeholder="DESCONTO20"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Quantidade máxima de usos</label>
                <input
                  type="number"
                  min="1"
                  value={sharedMaxQty}
                  onChange={(e) => setSharedMaxQty(e.target.value)}
                  placeholder="50"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                {existing?.type === "shared_coupon" && (
                  <p className="text-[11px] text-gray-400 mt-1">{existing.usedQty ?? 0} uso{(existing.usedQty ?? 0) !== 1 ? "s" : ""} realizados</p>
                )}
              </div>
            </div>
          )}

          {/* Unique coupons fields */}
          {type === "coupons" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Adicionar códigos <span className="text-gray-400">(um por linha)</span></label>
                <textarea
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder={"PROMO001\nPROMO002\nPROMO003"}
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono resize-none"
                />
                <button
                  onClick={addCoupons}
                  disabled={!couponInput.trim() || saving}
                  className="mt-1.5 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-40 rounded-lg transition-colors"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Adicionar Cupons
                </button>
              </div>

              {coupons.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                    <span className="text-xs font-medium text-gray-600">
                      {coupons.length} cupom{coupons.length !== 1 ? "s" : ""} · {availableCount} disponível{availableCount !== 1 ? "s" : ""} · {assignedCount} atribuído{assignedCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                    {coupons.map((c) => (
                      <div key={c.code} className="flex items-center justify-between px-3 py-2">
                        <span className="text-xs font-mono text-gray-900">{c.code}</span>
                        {c.participationId ? (
                          <span className="text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Atribuído</span>
                        ) : (
                          <button
                            onClick={() => removeCoupon(c.code)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bonus eligibility rules */}
          {type !== "none" && (
            <div className="pt-2 border-t border-gray-100">
              <EligibilityRuleBuilder
                workspaceUserId={survey.userId}
                rules={eligibilityRules}
                onChange={setEligibilityRules}
                label="Elegibilidade para bonificação"
                hint="Regras AND — respondente deve atender a todas para receber o bônus automaticamente."
              />
            </div>
          )}

          {/* Save button */}
          {type !== "coupons" && (
            <div className="flex justify-end pt-1">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Salvar configuração
              </button>
            </div>
          )}
          {type === "coupons" && (
            <div className="flex justify-end pt-1">
              <button
                onClick={saveConfig}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Salvar configuração
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
      const prevP = participations.find((p) => p.id === participationId);
      const res = await fetch(
        `/api/surveys/${surveyId}/participations/${participationId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bonusStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (err.error) alert(err.error);
        return;
      }

      const data = await res.json();
      const assignedCoupon: string | undefined = data.bonusCouponCode;

      setParticipations((prev) =>
        prev.map((p) =>
          p.id === participationId
            ? {
                ...p,
                bonusStatus,
                bonusReleasedAt: bonusStatus === "released" ? new Date().toISOString() : bonusStatus === "pending" ? undefined : p.bonusReleasedAt,
                bonusCouponCode: bonusStatus === "released" ? (assignedCoupon ?? p.bonusCouponCode) : bonusStatus === "pending" ? undefined : p.bonusCouponCode,
              }
            : p
        )
      );

      // Update local survey bonusConfig to reflect coupon changes
      const cfg = survey.bonusConfig;
      if (cfg?.type === "coupons" && assignedCoupon && bonusStatus === "released") {
        const updatedCoupons = cfg.coupons.map((c) =>
          c.code === assignedCoupon ? { ...c, participationId, assignedAt: new Date().toISOString() } : c
        );
        onSurveyChange({ ...survey, bonusConfig: { ...cfg, coupons: updatedCoupons } });
      } else if (cfg?.type === "coupons" && prevP?.bonusCouponCode && bonusStatus === "pending") {
        const updatedCoupons = cfg.coupons.map((c) =>
          c.code === prevP.bonusCouponCode ? { code: c.code } : c
        );
        onSurveyChange({ ...survey, bonusConfig: { ...cfg, coupons: updatedCoupons } });
      } else if (cfg?.type === "shared_coupon") {
        if (bonusStatus === "released") {
          onSurveyChange({ ...survey, bonusConfig: { ...cfg, usedQty: (cfg.usedQty ?? 0) + 1 } });
        } else if (bonusStatus === "pending" && prevP?.bonusCouponCode) {
          onSurveyChange({ ...survey, bonusConfig: { ...cfg, usedQty: Math.max(0, (cfg.usedQty ?? 0) - 1) } });
        }
      }

      // Quota management
      if (prevP) {
        const wasIneligible = prevP.bonusStatus === "ineligible";
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

  const canRelease = (p: ParticipationWithRespondent): boolean => {
    const cfg = survey.bonusConfig;
    if (!cfg) return true;
    if (cfg.type === "coupons") return cfg.coupons.some((c) => !c.participationId);
    if (cfg.type === "shared_coupon") return (cfg.usedQty ?? 0) < cfg.maxQty;
    return true;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BonusConfigSection survey={survey} surveyId={surveyId} onSurveyChange={onSurveyChange} />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (participations.length === 0) {
    return (
      <div className="space-y-4">
        <BonusConfigSection survey={survey} surveyId={surveyId} onSurveyChange={onSurveyChange} />
        <div className="bg-white border border-gray-200 rounded-xl text-center py-16">
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
      {/* Bonus config section */}
      <BonusConfigSection survey={survey} surveyId={surveyId} onSurveyChange={onSurveyChange} />

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

      {/* Financial summary for value type */}
      {survey.bonusConfig?.type === "value" && (
        <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs text-gray-600">
          <Banknote className="w-4 h-4 text-gray-400 shrink-0" />
          <span>
            <span className="font-semibold text-amber-600">R$ {(counts.pending * survey.bonusConfig.value).toFixed(2)}</span> pendente ·{" "}
            <span className="font-semibold text-green-600">R$ {(counts.released * survey.bonusConfig.value).toFixed(2)}</span> liberado
            {survey.bonusConfig.description && <span className="text-gray-400"> · {survey.bonusConfig.description}</span>}
          </span>
        </div>
      )}

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
            const releaseBlocked = p.bonusStatus !== "released" && !canRelease(p);

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
                      {p.bonusCouponCode && (
                        <span className="flex items-center gap-1 text-[11px] font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                          <Tag className="w-3 h-3" />
                          {p.bonusCouponCode}
                        </span>
                      )}
                      {survey.bonusConfig?.type === "value" && p.bonusStatus === "released" && (
                        <span className="text-[11px] font-semibold text-green-600">
                          R$ {survey.bonusConfig.value.toFixed(2)}
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
                        disabled={isUpdating || releaseBlocked}
                        title={releaseBlocked ? "Sem bônus disponíveis" : undefined}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
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
  const [profileSchema, setProfileSchema] = useState<{ key: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [embedShowHeader, setEmbedShowHeader] = useState(true);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"analytics" | "responses" | "crossanalysis" | "bonus" | "collaborators">("analytics");
  const [isOwner, setIsOwner] = useState(true);
  const [collaboratorRole, setCollaboratorRole] = useState<"editor" | "viewer" | null>(null);
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
      setShareToken(data.survey.shareToken ?? null);
      if (data.isCollaborator) {
        setIsOwner(false);
        setCollaboratorRole(data.collaboratorRole ?? null);
      }
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
        if (data.profileSchema) setProfileSchema(data.profileSchema);
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

  const [duplicating, setDuplicating] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [sharingAnalysis, setSharingAnalysis] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleDuplicate = async () => {
    if (!survey || duplicating) return;
    setDuplicating(true);
    try {
      const res = await fetch(`/api/surveys/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        router.push(`/editor/${data.survey.id}`);
      }
    } catch (error) {
      console.error("Error duplicating survey:", error);
    } finally {
      setDuplicating(false);
    }
  };

  const handleShareAnalysis = async () => {
    if (sharingAnalysis) return;
    let token = shareToken;
    if (!token) {
      setSharingAnalysis(true);
      try {
        const res = await fetch(`/api/surveys/${id}/share`, { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          token = data.shareToken;
          setShareToken(token);
        }
      } catch (error) {
        console.error("Error generating share token:", error);
      } finally {
        setSharingAnalysis(false);
      }
    }
    if (token) {
      const url = `${window.location.origin}/share/${token}`;
      await navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
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

  const getEmbedCode = (showHeader = embedShowHeader) => {
    const url = getSurveyUrl();
    const params = ["embed=true", ...(!showHeader ? ["hide_header=true"] : [])].join("&");
    return `<iframe\n  id="surveyflow-survey"\n  src="${url}?${params}"\n  frameborder="0"\n  style="width: 100%; border: none; overflow: hidden;"\n  scrolling="no"\n></iframe>\n<script>\nwindow.addEventListener("message", function(e) {\n  if (e.data && e.data.type === "surveyflow-resize") {\n    document.getElementById("surveyflow-survey").style.height = e.data.height + "px";\n  }\n});\n</script>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  // Returns NodeSnapshot for an answer: prefers the saved snapshot (historical accuracy)
  // and falls back to the current survey node (for responses saved before snapshots were added).
  const getNodeData = (nodeId: string, response: SurveyResponse): NodeSnapshot | null => {
    if (response.nodeSnapshot?.[nodeId]) return response.nodeSnapshot[nodeId];
    const live = survey?.nodes.find((n) => n.id === nodeId);
    if (!live) return null;
    const d = live.data;
    const snap: NodeSnapshot = { type: d.type, title: (d.title as string) ?? "" };
    if (d.type === "singleChoice" || d.type === "multipleChoice") {
      snap.options = (d as { options: { id: string; label: string }[] }).options.map((o) => ({ id: o.id, label: o.label }));
    }
    if (d.type === "rating") {
      snap.minValue = (d as { minValue?: number }).minValue;
      snap.maxValue = (d as { maxValue?: number }).maxValue;
    }
    return snap;
  };

  const getAnswerLabel = (node: NodeSnapshot, answer: SurveyResponse["answers"][0]): string => {
    if (node.type === "presentation") {
      const parts = [];
      if (answer.respondentName) parts.push(`${t.surveyDetail.getAnswerLabel.namePrefix}${answer.respondentName}`);
      if (answer.respondentEmail) parts.push(`${t.surveyDetail.getAnswerLabel.emailPrefix}${answer.respondentEmail}`);
      return parts.length > 0 ? parts.join(" | ") : t.surveyDetail.getAnswerLabel.startedSurvey;
    }
    if (node.type === "singleChoice" && answer.selectedOptionId) {
      const option = node.options?.find((o) => o.id === answer.selectedOptionId);
      return option?.label || t.surveyDetail.getAnswerLabel.optionNotFound;
    }
    if (node.type === "multipleChoice" && answer.selectedOptionIds) {
      const labels = answer.selectedOptionIds.map((optId) => node.options?.find((o) => o.id === optId)?.label).filter(Boolean);
      return labels.join(", ") || t.surveyDetail.getAnswerLabel.noOptionSelected;
    }
    if (node.type === "rating" && answer.ratingValue !== undefined) {
      return `${answer.ratingValue} ${t.surveyDetail.getAnswerLabel.ratingOf} ${node.maxValue}`;
    }
    if (node.type === "textInput" && answer.textValue !== undefined) {
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
        const nodeData = getNodeData(node.id, response);
        return esc(answer && nodeData ? getAnswerLabel(nodeData, answer) : "");
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
        const nodeData = getNodeData(node.id, response);
        return answer && nodeData ? getAnswerLabel(nodeData, answer) : "";
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
          {isOwner && (
            <button
              onClick={handleDuplicate}
              disabled={duplicating}
              title="Duplicar pesquisa"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
            >
              {duplicating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <CopyPlus className="w-3.5 h-3.5" />}
              Duplicar
            </button>
          )}
          {(isOwner || collaboratorRole === "editor") && (
            <button
              onClick={() => router.push(`/editor/${survey.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />{t.surveyDetail.edit}
            </button>
          )}
        </div>
      </div>

      {/* ── Embed Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0 max-h-[85vh] flex flex-col overflow-hidden">
          <DialogTitle className="sr-only">{t.surveyDetail.embedModal.title}</DialogTitle>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{t.surveyDetail.embedModal.title}</h2>
              <p className="text-xs text-gray-500">{t.surveyDetail.embedModal.subtitle}</p>
            </div>
          </div>
          <div className="px-5 py-4 space-y-4 overflow-y-auto">
            {/* Embed options */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div>
                <p className="text-xs font-medium text-gray-800">Mostrar logo e cabeçalho</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Exibe o logo da marca e o título da pesquisa no embed</p>
              </div>
              <button
                role="switch"
                aria-checked={embedShowHeader}
                onClick={() => setEmbedShowHeader((v) => !v)}
                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${embedShowHeader ? "bg-gray-900" : "bg-gray-300"}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${embedShowHeader ? "translate-x-4" : "translate-x-0"}`}
                />
              </button>
            </div>

            {/* Code block */}
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
      {(survey.responseCount > 0 || isOwner) && (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {survey.responseCount > 0 && (<>
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
          </>)}
          {isOwner && (
            <button
              onClick={() => setActiveTab("collaborators")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "collaborators" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Colaboradores
              </span>
            </button>
          )}
        </div>
      )}

      {/* ── Analytics Tab ───────────────────────────────────────────────────── */}
      {(activeTab === "analytics" || survey.responseCount === 0) && activeTab !== "collaborators" && (
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
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={handleShareAnalysis}
                  disabled={sharingAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors disabled:opacity-50"
                >
                  {sharingAnalysis ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : copiedShare ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <LinkIcon className="w-3.5 h-3.5" />
                  )}
                  {copiedShare ? "Link copiado!" : shareToken ? "Copiar link da análise" : "Compartilhar análise"}
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {analytics.map((item) => (
                  <QuestionAnalyticsCard key={item.node.id} item={item} />
                ))}
              </div>
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
                    <div className="px-5 pb-4 pt-3 bg-gray-50 border-t border-gray-100 space-y-3">
                      {/* Profile fields from respondent schema */}
                      {response.profile && Object.keys(response.profile).length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Perfil do respondente
                          </p>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {Object.entries(response.profile).map(([key, value]) => {
                              const schemaField = profileSchema.find((f) => f.key === key);
                              const label = schemaField?.label ?? key.replace(/_/g, " ");
                              return (
                                <div key={key} className="bg-white border border-blue-100 rounded-lg p-3">
                                  <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1">
                                    {label}
                                  </p>
                                  <p className="text-xs text-gray-800">{String(value)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Survey answers */}
                      <div>
                        {(response.profile && Object.keys(response.profile).length > 0) && (
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Respostas da pesquisa
                          </p>
                        )}
                        <div className="grid sm:grid-cols-2 gap-2">
                          {response.answers.map((answer, i) => {
                            const nodeData = getNodeData(answer.nodeId, response);
                            if (!nodeData) return null;
                            return (
                              <div key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                  {nodeData.type === "presentation"
                                    ? t.surveyDetail.responses.identification
                                    : nodeData.title || t.surveyDetail.responses.questionLabel.replace("{n}", String(i + 1))}
                                </p>
                                <p className="text-xs text-gray-800">{getAnswerLabel(nodeData, answer)}</p>
                              </div>
                            );
                          })}
                        </div>
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

      {/* ── Collaborators Tab ───────────────────────────────────────────────── */}
      {activeTab === "collaborators" && isOwner && (
        <CollaboratorsPanel surveyId={id} />
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
