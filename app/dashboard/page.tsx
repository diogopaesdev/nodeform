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
  Sparkles,
  ArrowRight,
  Zap,
  ShoppingCart,
  AlertTriangle,
  Lock,
  HeartPulse,
  Building2,
  Activity,
  Calendar,
  LayoutTemplate,
} from "lucide-react";
import { SURVEY_TEMPLATES } from "@/lib/templates";
import type { SurveyTemplate } from "@/lib/templates";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { Survey, DashboardStats } from "@/types/survey";
import { useSession } from "next-auth/react";
import { useI18n } from "@/lib/i18n";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<Survey["status"], string> = {
  draft:     "bg-gray-100 text-gray-600",
  published: "bg-green-100 text-green-700",
  finished:  "bg-blue-100 text-blue-700",
  archived:  "bg-amber-100 text-amber-700",
};

const STATUS_COLOR: Record<Survey["status"], { color: string; dot: string }> = {
  draft:     { color: "#e5e7eb", dot: "bg-gray-400" },
  published: { color: "#86efac", dot: "bg-green-400" },
  finished:  { color: "#93c5fd", dot: "bg-blue-400" },
  archived:  { color: "#fcd34d", dot: "bg-amber-400" },
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
  const { t } = useI18n();
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      {payload[0].value} {payload[0].value === 1 ? t.surveyDetail.analytics.resp : t.common.responses}
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

// ─── Template segment icons ───────────────────────────────────────────────────

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  "clinicas-esteticas": HeartPulse,
  "imobiliarias": Building2,
  "pesquisa-de-mercado": BarChart2,
  "infoprodutores": TrendingUp,
  "healthcare": Activity,
  "eventos": Calendar,
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTab, setCreateTab] = useState<"ai" | "templates">("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState("");
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyingCredits, setBuyingCredits] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; surveyId: string; surveyTitle: string; loading: boolean }>({
    open: false, surveyId: "", surveyTitle: "", loading: false,
  });

  // STATUS_META built inside component so labels are translated
  const STATUS_META: Record<Survey["status"], { label: string; color: string; dot: string }> = {
    draft:     { label: t.dashboard.status.draft,     color: "#e5e7eb", dot: "bg-gray-400" },
    published: { label: t.dashboard.status.published, color: "#86efac", dot: "bg-green-400" },
    finished:  { label: t.dashboard.status.finished,  color: "#93c5fd", dot: "bg-blue-400" },
    archived:  { label: t.dashboard.status.archived,  color: "#fcd34d", dot: "bg-amber-400" },
  };

  useEffect(() => {
    fetchData();
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/user/credits");
      if (res.ok) {
        const data = await res.json();
        setCredits(data.credits);
      }
    } catch {
      // silently fail
    }
  };

  const handleBuyCredits = async (quantity: number) => {
    setBuyingCredits(true);
    try {
      const res = await fetch("/api/stripe/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      // silently fail
    } finally {
      setBuyingCredits(false);
    }
  };

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

  const isPro = session?.user?.subscriptionStatus === "active";

  const handleCreateFromTemplate = async (template: SurveyTemplate) => {
    if (!isPro) {
      router.push("/dashboard/settings");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (data.survey) {
        router.push(`/editor/${data.survey.id}`);
      }
    } catch (error) {
      console.error("Error creating survey from template:", error);
      setCreating(false);
    }
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;
    setGeneratingAi(true);
    setAiError("");
    try {
      const res = await fetch("/api/surveys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === "NO_CREDITS") {
          setCreateModalOpen(false);
          setBuyModalOpen(true);
        } else {
          setAiError(data.error || t.dashboard.errors.generate);
        }
        return;
      }
      setCredits((c) => (c !== null ? c - 1 : null));
      setCreateModalOpen(false);
      setAiPrompt("");
      router.push(`/editor/${data.surveyId}`);
    } catch {
      setAiError(t.dashboard.errors.connection);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleDeleteSurvey = (id: string, title: string) => {
    setDeleteModal({ open: true, surveyId: id, surveyTitle: title, loading: false });
  };

  const confirmDeleteSurvey = async () => {
    setDeleteModal((m) => ({ ...m, loading: true }));
    try {
      await fetch(`/api/surveys/${deleteModal.surveyId}`, { method: "DELETE" });
      setSurveys(surveys.filter((s) => s.id !== deleteModal.surveyId));
      if (stats) {
        setStats({ ...stats, totalSurveys: stats.totalSurveys - 1 });
      }
      setDeleteModal({ open: false, surveyId: "", surveyTitle: "", loading: false });
    } catch (error) {
      console.error("Error deleting survey:", error);
      setDeleteModal((m) => ({ ...m, loading: false }));
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
        color: STATUS_COLOR[status as Survey["status"]]?.color ?? "#e5e7eb",
      }))
      .sort((a, b) => b.value - a.value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveys, t]);

  const nonDraftSurveys = surveys.filter((s) => s.status !== "draft");
  const avgResponses =
    nonDraftSurveys.length > 0
      ? (nonDraftSurveys.reduce((a, s) => a + s.responseCount, 0) / nonDraftSurveys.length).toFixed(1)
      : "0";

  const maxResponses = useMemo(
    () => Math.max(...surveys.map((s) => s.responseCount), 1),
    [surveys]
  );

  // ── Stat cards config ───────────────────────────────────────────────────────

  const statCards = [
    {
      label: t.dashboard.stats.surveys,
      value: stats?.totalSurveys ?? 0,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: t.dashboard.stats.responses,
      value: stats?.totalResponses ?? 0,
      icon: Users,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      label: t.dashboard.stats.active,
      value: stats?.activeSurveys ?? 0,
      icon: TrendingUp,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: t.dashboard.stats.avg,
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
          <h1 className="text-xl font-semibold text-gray-900">{t.dashboard.title}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Credits badge */}
          {credits !== null && (
            <button
              onClick={() => setBuyModalOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                credits === 0
                  ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  : credits <= 3
                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {credits === 0 ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              {credits !== 1
                ? t.dashboard.credits.badgePlural.replace("{n}", String(credits))
                : t.dashboard.credits.badge.replace("{n}", String(credits))}
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            {copiedLink ? (
              <><Check className="w-3.5 h-3.5 text-green-600" />{t.common.copied}</>
            ) : (
              <><LinkIcon className="w-3.5 h-3.5" />{t.common.share}</>
            )}
          </button>
          <button
            onClick={() => setEmbedModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            {t.common.embed}
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.dashboard.newSurvey}
          </button>
        </div>
      </div>

      {/* ── Buy Credits Modal ───────────────────────────────────────────────── */}
      <Dialog open={buyModalOpen} onOpenChange={setBuyModalOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          <DialogTitle className="sr-only">{t.dashboard.credits.modalTitle}</DialogTitle>
          <DialogDescription className="sr-only">{t.dashboard.credits.packageDesc}</DialogDescription>

          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">{t.dashboard.credits.modalTitle}</h2>
                <p className="text-xs text-gray-500">
                  {credits !== null ? (
                    credits === 0
                      ? t.dashboard.credits.noCredits
                      : credits !== 1
                        ? t.dashboard.credits.availablePlural.replace("{n}", String(credits))
                        : t.dashboard.credits.available.replace("{n}", String(credits))
                  ) : t.dashboard.credits.modalTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Free credits info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-700 mb-1">{t.dashboard.credits.freeTitle}</p>
              <p className="text-xs text-gray-500" dangerouslySetInnerHTML={{ __html: t.dashboard.credits.freeInfo }} />
            </div>

            {/* Package */}
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2">{t.dashboard.credits.buyTitle}</p>
              <button
                onClick={() => handleBuyCredits(10)}
                disabled={buyingCredits}
                className="w-full flex items-center justify-between px-4 py-4 bg-white border-2 border-gray-900 hover:bg-gray-50 disabled:opacity-50 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{t.dashboard.credits.packageName}</p>
                    <p className="text-xs text-gray-500">{t.dashboard.credits.packageDesc}</p>
                  </div>
                </div>
                <div className="text-right">
                  {buyingCredits ? (
                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  ) : (
                    <>
                      <p className="text-base font-bold text-gray-900">{t.dashboard.credits.packagePrice}</p>
                      <p className="text-[10px] text-gray-400">{t.dashboard.credits.packagePriceUnit}</p>
                    </>
                  )}
                </div>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
              <ShoppingCart className="w-3 h-3" />
              {t.dashboard.credits.securePayment}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Create Modal ────────────────────────────────────────────────────── */}
      <Dialog open={createModalOpen} onOpenChange={(open) => { setCreateModalOpen(open); if (!open) { setAiPrompt(""); setAiError(""); setCreateTab("ai"); } }}>
        <DialogContent className="max-w-lg p-0 gap-0">
          <DialogTitle className="sr-only">{t.dashboard.createModal.title}</DialogTitle>
          <DialogDescription className="sr-only">{t.dashboard.createModal.subtitle}</DialogDescription>

          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">{t.dashboard.createModal.title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">{t.dashboard.createModal.subtitle}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4">
            <button
              onClick={() => setCreateTab("ai")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                createTab === "ai"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Gerar com IA
            </button>
            <button
              onClick={() => setCreateTab("templates")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                createTab === "templates"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <LayoutTemplate className="w-3 h-3" />
              Templates
              {!isPro && <Lock className="w-2.5 h-2.5 opacity-60" />}
            </button>
          </div>

          <div className="p-6 space-y-4">

            {/* ── AI tab ── */}
            {createTab === "ai" && (
              <>
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{t.dashboard.createModal.aiTitle}</p>
                        <p className="text-xs text-gray-500">{t.dashboard.createModal.aiSubtitle}</p>
                      </div>
                    </div>
                    {credits !== null && (
                      <button
                        onClick={() => { setCreateModalOpen(false); setBuyModalOpen(true); }}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 ${
                          credits === 0
                            ? "bg-red-100 text-red-700"
                            : credits <= 3
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Zap className="w-3 h-3" />
                        {credits !== 1
                          ? t.dashboard.credits.badgePlural.replace("{n}", String(credits))
                          : t.dashboard.credits.badge.replace("{n}", String(credits))}
                      </button>
                    )}
                  </div>

                  <textarea
                    value={aiPrompt}
                    onChange={(e) => { setAiPrompt(e.target.value); setAiError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerateWithAi(); }}
                    placeholder={t.dashboard.createModal.aiPlaceholder}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-gray-900 placeholder-gray-400 resize-none"
                  />

                  {aiError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{aiError}</p>
                  )}

                  {credits === 0 && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      {t.dashboard.createModal.aiNoCredits}{" "}
                      <button onClick={() => { setCreateModalOpen(false); setBuyModalOpen(true); }} className="underline font-medium">
                        {t.dashboard.createModal.aiBuyCredits}
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateWithAi}
                    disabled={!aiPrompt.trim() || generatingAi || credits === 0}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {generatingAi ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />{t.dashboard.createModal.aiGenerating}</>
                    ) : (
                      <><Sparkles className="w-4 h-4" />{t.dashboard.createModal.aiGenerate}</>
                    )}
                  </button>
                  {!generatingAi && aiPrompt.trim() && (
                    <p className="text-[11px] text-gray-400 text-center">{t.dashboard.createModal.aiHint}</p>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{t.dashboard.createModal.or}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Manual */}
                <button
                  onClick={() => { setCreateModalOpen(false); handleCreateSurvey(); }}
                  disabled={creating || generatingAi}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PenSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{t.dashboard.createModal.manualTitle}</p>
                      <p className="text-xs text-gray-500">{t.dashboard.createModal.manualSubtitle}</p>
                    </div>
                  </div>
                  {creating
                    ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    : <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  }
                </button>
              </>
            )}

            {/* ── Templates tab ── */}
            {createTab === "templates" && (
              <>
                {!isPro && (
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
                    <span>
                      Templates fazem parte do <strong>Plano Pro</strong>.{" "}
                      <button
                        onClick={() => { setCreateModalOpen(false); router.push("/dashboard/settings"); }}
                        className="underline font-medium"
                      >
                        Assinar agora
                      </button>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  {SURVEY_TEMPLATES.filter((t) => t.complexity === "basic").map((tpl) => {
                    const Icon = TEMPLATE_ICONS[tpl.segment] ?? LayoutTemplate;
                    const locked = !isPro;
                    return (
                      <button
                        key={tpl.id}
                        onClick={() => handleCreateFromTemplate(tpl)}
                        disabled={creating}
                        className={`relative text-left p-3.5 rounded-xl border transition-all ${
                          locked
                            ? "border-gray-200 bg-gray-50 opacity-70 cursor-pointer"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        {locked && (
                          <div className="absolute top-2.5 right-2.5">
                            <Lock className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center mb-2.5">
                          <Icon className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        <p className="text-xs font-semibold text-gray-900 leading-snug mb-1">{tpl.title}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{tpl.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Ver todos */}
                <button
                  onClick={() => { setCreateModalOpen(false); router.push("/dashboard/templates"); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <LayoutTemplate className="w-3 h-3" />
                  Ver todos os templates ({SURVEY_TEMPLATES.length})
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-xs text-gray-400">{t.dashboard.createModal.or}</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                <button
                  onClick={() => { setCreateModalOpen(false); handleCreateSurvey(); }}
                  disabled={creating}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <PenSquare className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{t.dashboard.createModal.manualTitle}</p>
                      <p className="text-xs text-gray-500">{t.dashboard.createModal.manualSubtitle}</p>
                    </div>
                  </div>
                  {creating
                    ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    : <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  }
                </button>
              </>
            )}

          </div>
        </DialogContent>
      </Dialog>

      {/* ── Embed Modal ─────────────────────────────────────────────────────── */}
      <Dialog open={embedModalOpen} onOpenChange={setEmbedModalOpen}>
        <DialogContent className="max-w-3xl p-0 gap-0">
          <DialogTitle className="sr-only">{t.dashboard.embedModal.title}</DialogTitle>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">{t.dashboard.embedModal.title}</h2>
              <p className="text-xs text-gray-500">{t.dashboard.embedModal.subtitle}</p>
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
                  <><Check className="w-3 h-3 text-green-400" />{t.common.copied}</>
                ) : (
                  <><Copy className="w-3 h-3" />{t.common.copy}</>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {t.dashboard.embedModal.disclaimer}
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
              <h2 className="text-sm font-semibold text-gray-900">{t.dashboard.charts.responsesBySurvey}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {t.dashboard.charts.responsesBySurveyDesc.replace("{n}", String(topSurveys.length))}
              </p>
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
                {t.dashboard.charts.published}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-3 h-3 rounded-sm bg-gray-300 inline-block" />
                {t.dashboard.charts.others}
              </div>
            </div>
          </div>

          {/* Donut chart – distribuição de status */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900">{t.dashboard.charts.byStatus}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{t.dashboard.charts.byStatusDesc}</p>
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
            <h2 className="text-sm font-semibold text-gray-900">{t.dashboard.table.title}</h2>
            {!loading && surveys.length > 0 && (
              <p className="text-xs text-gray-400 mt-0.5">
                {surveys.length !== 1
                  ? t.dashboard.table.subtitlePlural.replace("{n}", String(surveys.length))
                  : t.dashboard.table.subtitle.replace("{n}", String(surveys.length))}
              </p>
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
            <h3 className="text-sm font-medium text-gray-900 mb-1">{t.dashboard.table.empty.title}</h3>
            <p className="text-xs text-gray-500 mb-4">{t.dashboard.table.empty.desc}</p>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.dashboard.table.empty.cta}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-2.5 bg-gray-50 text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              <span>{t.dashboard.table.survey}</span>
              <span className="text-right w-20">{t.dashboard.table.responses}</span>
              <span className="w-28 text-center">{t.dashboard.table.performance}</span>
              <span className="w-24 text-right">{t.dashboard.table.updated}</span>
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
                      <span className="text-xs text-gray-400 ml-1">{t.dashboard.table.resp}</span>
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
                        title={t.surveyDetail.viewResults}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => router.push(`/editor/${survey.id}`)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        title={t.common.edit}
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
                            onClick={() => handleDeleteSurvey(survey.id, survey.title)}
                            className="text-red-600 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            {t.common.delete}
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

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => !deleteModal.loading && setDeleteModal((m) => ({ ...m, open }))}
        title={t.surveys.deleteModal.title}
        description={t.surveys.deleteModal.description}
        confirmName={deleteModal.surveyTitle}
        onConfirm={confirmDeleteSurvey}
        loading={deleteModal.loading}
        labels={{
          deleteButton: t.surveys.deleteModal.deleteButton,
          cancelButton: t.common.cancel,
          cannotBeUndone: t.surveys.deleteModal.cannotBeUndone,
          typeToConfirm: t.surveys.deleteModal.typeToConfirm,
          inputPlaceholder: t.surveys.deleteModal.inputPlaceholder,
        }}
      />
    </div>
  );
}
