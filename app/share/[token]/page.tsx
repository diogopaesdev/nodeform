"use client";

import { useEffect, useState, useMemo, use } from "react";
import { BarChart3, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Survey, SurveyResponse } from "@/types/survey";

interface SharedData {
  survey: Pick<Survey, "id" | "title" | "description" | "nodes" | "edges" | "enableScoring" | "responseCount">;
  responses: SurveyResponse[];
}

function useAnalytics(survey: SharedData["survey"] | null, responses: SurveyResponse[]) {
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
                ? answer.selectedOptionId ? [answer.selectedOptionId] : []
                : answer.selectedOptionIds ?? [];
            ids.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
          });
          const options = (node.data as { options?: { id: string; label: string }[] }).options ?? [];
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
          const data = node.data as { minValue?: number; maxValue?: number };
          const min = data.minValue ?? 1;
          const max = data.maxValue ?? 5;
          const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
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

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { pct: number } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      {payload[0].value} respostas ({payload[0].payload.pct}%)
    </div>
  );
}

function AnalyticsCard({ item }: {
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
  const maxVal = Math.max(...item.chartData.map((d) => d.value), 1);
  const typeLabel =
    item.type === "singleChoice" ? "Escolha única" :
    item.type === "multipleChoice" ? "Múltipla escolha" : "Avaliação";

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">{typeLabel}</p>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{item.node.data.title || "Sem título"}</p>
        </div>
        <span className="flex-shrink-0 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {item.total} resp.
        </span>
      </div>
      <div className="px-5 py-4">
        {item.type === "rating" && item.avg !== undefined ? (
          <div className="space-y-4">
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
                <p className="text-[11px] text-gray-400 mt-1">Média de {item.total} avaliações</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {item.chartData.map((d) => (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-4 text-right flex-shrink-0">{d.name}</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-900 rounded-full transition-all" style={{ width: `${maxVal > 0 ? (d.value / maxVal) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={item.chartData.length * 36 + 8}>
            <BarChart data={item.chartData} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap="25%">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
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

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [data, setData] = useState<SharedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then(setData)
      .catch(() => setError("Link inválido ou expirado."))
      .finally(() => setLoading(false));
  }, [token]);

  const analytics = useAnalytics(data?.survey ?? null, data?.responses ?? []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">{error ?? "Algo deu errado."}</p>
        </div>
      </div>
    );
  }

  const { survey, responses } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Análise de Pesquisa</p>
          <h1 className="text-xl font-semibold text-gray-900">{survey.title}</h1>
          {survey.description && (
            <p className="text-sm text-gray-500 mt-1">{survey.description}</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              {responses.length} resposta{responses.length !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-gray-600">
              <BarChart3 className="w-4 h-4 text-gray-400" />
              {analytics.length} pergunta{analytics.length !== 1 ? "s" : ""} analisada{analytics.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {analytics.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <BarChart3 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhuma análise disponível.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {analytics.map((item) => (
              <AnalyticsCard key={item.node.id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-xs text-gray-400">
          Criado com <a href="/" className="text-gray-600 hover:underline">NodeForm</a>
        </p>
      </div>
    </div>
  );
}
