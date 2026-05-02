"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Loader2,
  Sparkles,
  Check,
  LogOut,
  Users,
  BookmarkCheck,
  MessageCircle,
  ArrowRight,
  Zap,
  Shield,
  Headphones,
  Star,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

const WHATSAPP_ENTERPRISE_URL = "https://wa.me/"; // adicione o número

const GROWTH_FEATURES = [
  "Até 5 pesquisas",
  "Até 500 respostas/mês",
  "Editor visual node-based",
  "Fluxo condicional por resposta",
  "Analytics e dashboard",
  "Exportação CSV",
  "3 créditos IA por mês",
  "Suporte padrão",
];

const PRO_FEATURES = [
  "Pesquisas ilimitadas",
  "Respostas ilimitadas",
  "Editor visual node-based",
  "Fluxo condicional por resposta",
  "Sistema de pontuação",
  "Analytics e dashboard",
  "Exportação CSV",
  "Identidade visual personalizada",
  "10 créditos IA por mês",
  "Módulos avançados disponíveis",
  "Suporte prioritário",
];

const ENTERPRISE_FEATURES = [
  "Tudo do plano Pro incluso",
  "Módulo Respondentes incluso",
  "Módulo Progresso incluso",
  "White-label completo",
  "Onboarding assistido",
  "SLA e estabilidade garantida",
  "Suporte dedicado",
  "Créditos IA customizados",
  "Customizações sob demanda",
];

const PRO_ADDONS = [
  {
    id: "respondents",
    name: "Módulo Respondentes",
    price: "R$ 449,90/mês",
    icon: Users,
    desc: "Autenticação, SSO, controle de acesso e integração B2B",
  },
  {
    id: "surveyProgress",
    name: "Módulo Progresso",
    price: "R$ 129,90/mês",
    icon: BookmarkCheck,
    desc: "Persistência de respostas entre sessões e dispositivos",
  },
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCheckout = async (planId: "growth" | "pro") => {
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          addons: planId === "pro" ? Array.from(selectedAddons) : [],
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-12">
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="navbar" />
      </div>

      {/* Header */}
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-7 h-7 text-white" />
        </div>
      </div>
      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold text-gray-900">Escolha seu plano</h1>
        <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
          Seu trial encerrou. Continue com o plano certo para o seu momento.
        </p>
      </div>

      {/* Plan cards */}
      <div className="w-full max-w-5xl grid md:grid-cols-3 gap-5">

        {/* ── Growth ───────────────────────────────────────────────── */}
        <div className="pt-5 flex flex-col">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1">
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Growth</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-extrabold text-gray-900 tracking-tight">R$&nbsp;97</span>
              <span className="text-sm text-gray-400">/mês</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Comece a capturar e organizar dados rapidamente
            </p>
          </div>

          <div className="px-6 py-5 flex-1">
            <ul className="space-y-2.5">
              {GROWTH_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => handleCheckout("growth")}
              disabled={loadingPlan !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-xl transition-colors"
            >
              {loadingPlan === "growth" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Começar agora <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              7 dias grátis · Cancele quando quiser
            </p>
          </div>
        </div>
        </div>

        {/* ── Pro (destaque) ────────────────────────────────────────── */}
        <div className="relative pt-5 flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
            <span className="flex items-center gap-1 bg-amber-400 text-gray-900 text-[11px] font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
              <Star className="w-3 h-3" />
              Mais utilizado
            </span>
          </div>

          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl ring-2 ring-gray-900 flex flex-col flex-1">
          <div className="px-6 pt-6 pb-5 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Pro</span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-extrabold text-white tracking-tight">R$&nbsp;499</span>
              <span className="text-sm text-gray-500">/mês</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automatize e escale seus fluxos com mais controle
            </p>
          </div>

          <div className="px-6 py-5 flex-1">
            <ul className="space-y-2.5">
              {PRO_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-300">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>

            {/* Addons para Pro */}
            <div className="mt-5 pt-5 border-t border-white/10 space-y-2">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Módulos opcionais
              </p>
              {PRO_ADDONS.map((addon) => {
                const isSelected = selectedAddons.has(addon.id);
                const Icon = addon.icon;
                return (
                  <label
                    key={addon.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-white/30 bg-white/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => toggleAddon(addon.id)}
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected ? "bg-white border-white" : "border-gray-500"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-gray-900" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="text-xs font-semibold text-gray-200">{addon.name}</span>
                        <span className="ml-auto text-[11px] text-gray-400 flex-shrink-0">+{addon.price}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">{addon.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="px-6 pb-6">
            <button
              onClick={() => handleCheckout("pro")}
              disabled={loadingPlan !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-900 bg-white hover:bg-gray-100 disabled:opacity-50 rounded-xl transition-colors"
            >
              {loadingPlan === "pro" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Assinar
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-gray-600 mt-2">
              7 dias grátis · Pagamento seguro via Stripe
            </p>
          </div>
          </div>
        </div>

        {/* ── Enterprise ───────────────────────────────────────────── */}
        <div className="pt-5 flex flex-col">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col flex-1">
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Enterprise</span>
            </div>
            <div className="mb-1">
              <span className="text-xl font-bold text-gray-900">Consulte</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Estruture operações críticas com segurança, escala e suporte dedicado
            </p>
          </div>

          <div className="px-6 py-5 flex-1">
            <ul className="space-y-2.5">
              {ENTERPRISE_FEATURES.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <Check className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                  {feat}
                </li>
              ))}
            </ul>
          </div>

          <div className="px-6 pb-6">
            <a
              href={WHATSAPP_ENTERPRISE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Falar com especialista
            </a>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Proposta personalizada · Sem compromisso
            </p>
          </div>
        </div>
        </div>
      </div>

      {/* Compare hint */}
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
        <Headphones className="w-3.5 h-3.5" />
        <span>Dúvidas? Fale com a gente via WhatsApp antes de assinar.</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        <span className="text-xs text-gray-400">{session?.user?.email}</span>
        <span className="text-gray-300">·</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          {t.upgrade.signOut}
        </button>
      </div>
    </div>
  );
}
