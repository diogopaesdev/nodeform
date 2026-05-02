"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Lock, Loader2, Search, ArrowRight,
  HeartPulse, Building2, BarChart2, TrendingUp, Activity,
  Calendar, Briefcase, Target, Building, LayoutTemplate,
  Sparkles, Info,
} from "lucide-react";
import Link from "next/link";
import {
  SURVEY_TEMPLATES,
  SEGMENT_LABELS,
  COMPLEXITY_LABELS,
  LANGUAGE_LABELS,
  cloneTemplate,
} from "@/lib/templates";
import type { SurveyTemplate } from "@/lib/templates";

// ─── Config ───────────────────────────────────────────────────────────────────

const SEGMENT_ICONS: Record<string, React.ElementType> = {
  "clinicas-esteticas": HeartPulse,
  "imobiliarias": Building2,
  "pesquisa-de-mercado": BarChart2,
  "infoprodutores": TrendingUp,
  "healthcare": Activity,
  "eventos": Calendar,
  "recrutamento": Briefcase,
  "marketing": Target,
  "empresas": Building,
};

const COMPLEXITY_STYLES: Record<SurveyTemplate["complexity"], { bg: string; text: string }> = {
  basic:        { bg: "bg-gray-100",   text: "text-gray-600" },
  intermediate: { bg: "bg-blue-50",    text: "text-blue-700" },
  advanced:     { bg: "bg-purple-50",  text: "text-purple-700" },
};

const LANG_STYLES: Record<string, { bg: string; text: string }> = {
  pt: { bg: "bg-green-50",  text: "text-green-700" },
  en: { bg: "bg-blue-50",   text: "text-blue-700" },
  es: { bg: "bg-yellow-50", text: "text-yellow-700" },
};

const LOCK_LABELS: Record<SurveyTemplate["complexity"], string> = {
  basic:        "",
  intermediate: "Plano Pro",
  advanced:     "Enterprise",
};

const ALL_SEGMENTS = Array.from(new Set(SURVEY_TEMPLATES.map((t) => t.segment)));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAccessibleLevels(
  subscriptionStatus?: string,
  planId?: string,
): Set<SurveyTemplate["complexity"]> {
  // Trial period never grants template access
  if (subscriptionStatus !== "active") return new Set();

  const levels = new Set<SurveyTemplate["complexity"]>(["basic"]);
  if (planId === "pro" || planId === "enterprise") levels.add("intermediate");
  if (planId === "enterprise") levels.add("advanced");
  return levels;
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({
  template,
  isLocked,
  onUse,
  loading,
}: {
  template: SurveyTemplate;
  isLocked: boolean;
  onUse: (t: SurveyTemplate) => void;
  loading: boolean;
}) {
  const Icon = SEGMENT_ICONS[template.segment] ?? LayoutTemplate;
  const complexity = COMPLEXITY_STYLES[template.complexity];
  const nodeCount = template.nodes.length;

  return (
    <div className={`relative flex flex-col rounded-2xl border bg-white transition-all ${isLocked ? "opacity-70" : "hover:shadow-md hover:border-gray-300"} border-gray-200`}>
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon className="w-4.5 h-4.5 text-gray-600" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {template.languages?.map((lang) => (
              <span key={lang} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${LANG_STYLES[lang]?.bg} ${LANG_STYLES[lang]?.text}`}>
                {LANGUAGE_LABELS[lang]}
              </span>
            ))}
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${complexity.bg} ${complexity.text}`}>
              {COMPLEXITY_LABELS[template.complexity]}
            </span>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
          {SEGMENT_LABELS[template.segment] ?? template.segment}
        </p>
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug mb-2">
          {template.title}
        </h3>
        <p className="text-[13px] text-gray-500 leading-relaxed">
          {template.description}
        </p>
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-gray-400">{nodeCount} perguntas</span>
          {isLocked ? (
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
              <Lock className="w-3 h-3" />
              {LOCK_LABELS[template.complexity]}
            </div>
          ) : (
            <button
              onClick={() => onUse(template)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>Usar template <ArrowRight className="w-3 h-3" /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const subscriptionStatus = session?.user?.subscriptionStatus;
  const planId = session?.user?.planId;
  const isTrialing = subscriptionStatus === "trialing";
  const accessibleLevels = getAccessibleLevels(subscriptionStatus, planId);

  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState<string | null>(null);
  const [complexity, setComplexity] = useState<SurveyTemplate["complexity"] | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = SURVEY_TEMPLATES.filter((t) => {
    const matchSearch =
      !search ||
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchSegment = !segment || t.segment === segment;
    const matchComplexity = !complexity || t.complexity === complexity;
    return matchSearch && matchSegment && matchComplexity;
  });

  const handleUse = async (template: SurveyTemplate) => {
    if (!accessibleLevels.has(template.complexity)) {
      router.push("/dashboard/settings");
      return;
    }
    setLoadingId(template.id);
    try {
      const res = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: template.id }),
      });
      const data = await res.json();
      if (data.survey) router.push(`/editor/${data.survey.id}`);
    } catch {
      setLoadingId(null);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Biblioteca de Templates</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Escolha um template, edite os textos e publique — sem partir do zero.
        </p>
      </div>

      {/* Trial banner */}
      {isTrialing && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl mb-6">
          <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            Templates não estão disponíveis durante o <strong>período de teste</strong>. Assine um plano para acessar.
          </p>
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            Assinar agora <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Growth partial-access banner */}
      {!isTrialing && planId === "growth" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl mb-6">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-800 flex-1">
            No <strong>Plano Growth</strong> você acessa os templates Básicos. Templates Intermediários e Avançados exigem o Plano Pro ou Enterprise.
          </p>
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            Ver planos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Pro partial-access banner (advanced locked) */}
      {!isTrialing && planId === "pro" && (
        <div className="flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl mb-6">
          <Info className="w-4 h-4 text-purple-500 flex-shrink-0" />
          <p className="text-sm text-purple-800 flex-1">
            No <strong>Plano Pro</strong> você acessa templates Básicos e Intermediários. Templates Avançados estão disponíveis no Enterprise.
          </p>
          <button
            onClick={() => router.push("/dashboard/settings")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            Conhecer Enterprise <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar templates..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 placeholder-gray-400"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {(["basic", "intermediate", "advanced"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setComplexity(complexity === c ? null : c)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                complexity === c
                  ? `${COMPLEXITY_STYLES[c].bg} ${COMPLEXITY_STYLES[c].text} ring-1 ring-current ring-offset-0`
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {COMPLEXITY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Segment tabs */}
      <div className="flex items-center gap-1.5 flex-wrap mb-6">
        <button
          onClick={() => setSegment(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            !segment
              ? "bg-gray-900 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Todos ({SURVEY_TEMPLATES.length})
        </button>
        {ALL_SEGMENTS.map((seg) => {
          const Icon = SEGMENT_ICONS[seg] ?? LayoutTemplate;
          const count = SURVEY_TEMPLATES.filter((t) => t.segment === seg).length;
          return (
            <button
              key={seg}
              onClick={() => setSegment(segment === seg ? null : seg)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                segment === seg
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-3 h-3" />
              {SEGMENT_LABELS[seg]} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <LayoutTemplate className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum template encontrado para esse filtro.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              isLocked={!accessibleLevels.has(tpl.complexity)}
              onUse={handleUse}
              loading={loadingId === tpl.id}
            />
          ))}
        </div>
      )}

      {/* AI upsell */}
      <div className="mt-12 flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl">
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Não encontrou o que procura?</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Use a IA para gerar um survey totalmente personalizado — descreva o que precisa e ela monta o fluxo completo.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xl transition-colors flex-shrink-0"
        >
          Gerar com IA <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
