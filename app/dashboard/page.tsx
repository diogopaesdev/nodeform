"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  TrendingUp,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Code,
  Copy,
  Check,
  Link as LinkIcon,
  BarChart2,
  PenSquare,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Survey, DashboardStats } from "@/types/survey";
import { useSession } from "next-auth/react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_META: Record<Survey["status"], { label: string; color: string; dot: string }> = {
  draft:     { label: "Rascunho",  color: "#e5e7eb", dot: "bg-gray-400" },
  published: { label: "Publicada", color: "#86efac", dot: "bg-green-400" },
  finished:  { label: "Finalizada",color: "#93c5fd", dot: "bg-blue-400" },
  archived:  { label: "Arquivada", color: "#fcd34d", dot: "bg-amber-400" },
};

const STATUS_BADGE: Record<Survey["status"], string> = {
  draft:     "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  finished:  "bg-blue-100 text-blue-700",
  archived:  "bg-amber-100 text-amber-700",
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Custom Tooltip for BarChart ──────────────────────────────────────────────

function BarTooltip({ active, payload }: { active?: boolean; payload?: { value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      {payload[0].value} {payload[0].value === 1 ? "resposta" : "respostas"}
    </div>
  );
}

// ─── Custom Tooltip for PieChart ──────────────────────────────────────────────

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      {payload[0].name}: {payload[0].value}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/surveys?stats=true");
      const data = await res.json();
      setSurveys(data.surveys || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSurvey = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Nova Pesquisa" }),
      });
      const data = await res.json();
      if (data.survey) {
        router.push(`/editor/${data.survey.id}`);
      }
    } catch (error) {
      console.error("Error creating survey:", error);
      setCreating(false);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta pesquisa?")) return;
    try {
      await fetch(`/api/surveys/${id}`, { method: "DELETE" });
      setSurveys(surveys.filter((s) => s.id !== id));
      if (stats) {
        setStats({ ...stats, totalSurveys: stats.totalSurveys - 1 });
      }
    } catch (error) {
      console.error("Error deleting survey:", error);
    }
  };

  const getSurveysListUrl = () => {
    if (typeof window === "undefined" || !session?.user?.id) return "";
    return `${window.location.origin}/surveys/user/${session.user.id}`;
  };

  const getEmbedCode = () => {
    const url = getSurveysListUrl();
    return `<iframe
  id="surveyflow-list"
  src="${url}?embed=true"
  frameborder="0"
  style="width: 100%; border: none; overflow: hidden;"
  scrolling="no"
></iframe>
<script>
window.addEventListener("message", function(e) {
  if (e.data && e.data.type === "surveyflow-resize") {
    document.getElementById("surveyflow-list").style.height = e.data.height + "px";
  }
});
</script>`;
  };

  const handleCopyEmbed = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(getSurveysListUrl());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── Derived chart data ──────────────────────────────────────────────────────

  const topSurveys = useMemo(
    () =>
      [...surveys]
        .sort((a, b) => b.responseCount - a.responseCount)
        .slice(0, 6)
        .map((s) => ({
          name: s.title.length > 22 ? s.title.slice(0, 22) + "…" : s.title,
          value: s.responseCount,
          status: s.status,
        })),
    [surveys]
  );

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    surveys.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([status, count]) => ({
        name: STATUS_META[status as Survey["status"]]?.label ?? status,
        value: count,
        color: STATUS_META[status as Survey["status"]]?.color ?? "#e5e7eb",
      }))
      .sort((a, b) => b.value - a.value);
  }, [surveys]);

  const avgResponses =
    surveys.length > 0
      ? (surveys.reduce((a, s) => a + s.responseCount, 0) / surveys.length).toFixed(1)
      : "0";

  const maxResponses = useMemo(
    () => Math.max(...surveys.map((s) => s.responseCount), 1),
    [surveys]
  );

  // ── Stat cards config ───────────────────────────────────────────────────────

  const statCards = [
    {
      label: "Pesquisas",
      value: stats?.totalSurveys ?? 0,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Respostas",
      value: stats?.totalResponses ?? 0,
      icon: Users,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: "Ativas",
      value: stats?.activeSurveys ?? 0,
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Média / Pesquisa",
      value: avgResponses,
      icon: BarChart2,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="p-6 max-w-7xl space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Acompanhe o desempenho das suas pesquisas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            {copiedLink ? (
              <><Check className="w-3.5 h-3.5 text-green-600" />Copiado!</>
            ) : (
              <><LinkIcon className="w-3.5 h-3.5" />Compartilhar</>
            )}
          </button>
          <button
            onClick={() => setEmbedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            Incorporar
          </button>
          <button
            onClick={handleCreateSurvey}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-md transition-colors"
          >
            {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Nova Pesquisa
          </button>
        </div>
      </div>

      {/* ── Embed Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogTitle className="sr-only">Incorporar Lista de Pesquisas</DialogTitle>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">Incorporar Lista de Pesquisas</h2>
              <p className="text-xs text-gray-500">Cole o código no HTML do seu site</p>
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
                {copiedEmbed ? (
                  <><Check className="w-3 h-3 text-green-400" />Copiado!</>
                ) : (
                  <><Copy className="w-3 h-3" />Copiar</>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              O iframe se adapta automaticamente ao tamanho do conteúdo. Apenas pesquisas com status &quot;Publicada&quot; aparecerão.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
            </div>
            {loading ? (
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────────── */}
      {!loading && surveys.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-4">

          {/* Bar chart – respostas por pesquisa */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Respostas por Pesquisa</h2>
              <p className="text-xs text-gray-400 mt-0.5">Top {topSurveys.length} pesquisas com mais respostas</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={topSurveys}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                barCategoryGap="30%"
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: "#f3f4f6" }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {topSurveys.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.status === "published" ? "#111827" : "#d1d5db"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm bg-gray-900 inline-block" />
                Publicada
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
                Outros
              </div>
            </div>
          </div>

          {/* Donut chart – distribuição de status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Por Status</h2>
              <p className="text-xs text-gray-400 mt-0.5">Distribuição das pesquisas</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {statusData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-gray-600">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Surveys Table ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Suas Pesquisas</h2>
            {!loading && surveys.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">{surveys.length} pesquisa{surveys.length !== 1 ? "s" : ""} no total</p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : surveys.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <PenSquare className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Nenhuma pesquisa criada</h3>
            <p className="text-xs text-gray-500 mb-4">Comece criando sua primeira pesquisa interativa</p>
            <button
              onClick={handleCreateSurvey}
              disabled={creating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
            >
              {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Criar Pesquisa
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              <span>Pesquisa</span>
              <span className="text-right w-20">Respostas</span>
              <span className="w-28 text-center">Desempenho</span>
              <span className="w-24 text-right">Atualização</span>
              <span className="w-20" />
            </div>

            {[...surveys]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((survey) => {
                const pct = maxResponses > 0 ? (survey.responseCount / maxResponses) * 100 : 0;
                return (
                  <div
                    key={survey.id}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors"
                  >
                    {/* Title + status */}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{survey.title}</p>
                      <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${STATUS_BADGE[survey.status]}`}>
                        {STATUS_META[survey.status].label}
                      </span>
                    </div>

                    {/* Response count */}
                    <div className="w-20 text-right">
                      <span className="text-sm font-semibold text-gray-900">{survey.responseCount}</span>
                      <span className="text-xs text-gray-400 ml-1">resp.</span>
                    </div>

                    {/* Mini progress bar */}
                    <div className="w-28">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gray-900 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Date */}
                    <div className="w-24 text-right">
                      <span className="text-xs text-gray-400">{formatDate(survey.updatedAt)}</span>
                    </div>

                    {/* Actions */}
                    <div className="w-20 flex items-center justify-end gap-1">
                      <button
                        onClick={() => router.push(`/dashboard/survey/${survey.id}`)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Ver resultados"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => router.push(`/editor/${survey.id}`)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-[120px]">
                          <DropdownMenuItem
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="text-red-600 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
