"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Loader2, Sparkles, Check, LogOut, Clock, Users, BookmarkCheck, Info } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

interface AddonOption {
  id: string;
  name: string;
  description: string;
  price: string;
  icon: React.ElementType;
  features: string[];
}

const ADDONS: AddonOption[] = [
  {
    id: "respondents",
    name: "Módulo Respondentes",
    description: "Autenticação dedicada, controle de acesso e integração B2B para pesquisas enterprise",
    price: "R$ 449,90/mês",
    icon: Users,
    features: [
      "Login obrigatório via OTP por e-mail ou SSO",
      "SSO — usuários da sua plataforma chegam autenticados, sem tela de login",
      "Sync de perfil em massa (até 500 respondentes por chamada)",
      "Elegibilidade por perfil — filtre por especialidade, setor, CRM e mais",
      "Critérios de visibilidade por questão — perguntas condicionais por perfil",
      "Participação única — bloqueio automático de segunda tentativa",
      "Cota máxima com encerramento automático da pesquisa",
      "Workspace Profile Schema com rule builder tipado",
      "API Keys seguras (prefixo nfk_) para integração server-to-server",
      "Painel de liberação de bonificação pós-participação",
    ],
  },
  {
    id: "surveyProgress",
    name: "Módulo Progresso",
    description: "Persistência de respostas entre sessões com retomada inteligente em qualquer dispositivo",
    price: "R$ 129,90/mês",
    icon: BookmarkCheck,
    features: [
      "Progresso salvo automaticamente após cada resposta",
      "Respondente retoma de onde parou em qualquer device ou sessão",
      "Dialog de escolha: retomar de onde parou ou recomeçar do início",
      "Funciona com autenticação OTP e SSO",
      "Progresso deletado automaticamente ao concluir — sem dados residuais",
    ],
  },
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(
    new Set(["respondents", "surveyProgress"])
  );

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addons: Array.from(selectedAddons) }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  const features = Object.values(t.upgrade.features);
  const soonFeatures = Object.values(t.upgrade.soonFeatures);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="absolute top-4 right-4">
        <LanguageToggle variant="navbar" />
      </div>

      <div className="w-full max-w-lg">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t.upgrade.trialExpired}</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
            {t.upgrade.trialExpiredDesc}
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Plan header */}
          <div className="bg-gray-900 px-6 py-5">
            <div className="mb-1">
              <span className="text-sm font-medium text-gray-400">{t.upgrade.planName}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {t.upgrade.planPrice}
              </span>
              <span className="text-sm text-gray-400">{t.upgrade.planPriceUnit}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{t.upgrade.planTrialDesc}</p>
          </div>

          {/* Features */}
          <div className="px-6 py-5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {t.upgrade.included}
            </p>

            <ul className="space-y-2.5 mb-4">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {soonFeatures.length > 0 && (
              <ul className="space-y-2.5 pt-3 border-t border-gray-100">
                {soonFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    <span>{feature}</span>
                    <span className="ml-auto text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {t.upgrade.comingSoon}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add-on modules */}
          <div className="px-6 py-5 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Módulos opcionais
              </p>
              <div className="group relative">
                <Info className="w-3 h-3 text-gray-300 cursor-default" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-52 bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-2 z-10 text-center">
                  Desmarca os que não precisa. Pode contratar individualmente depois.
                </div>
              </div>
            </div>

            {ADDONS.map((addon) => {
              const isSelected = selectedAddons.has(addon.id);
              const Icon = addon.icon;
              return (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggleAddon(addon.id)}
                  />
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? "bg-gray-900 border-gray-900"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Icon className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-sm font-semibold text-gray-900">{addon.name}</span>
                      <span className="ml-auto text-xs font-semibold text-gray-700 flex-shrink-0">
                        +{addon.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{addon.description}</p>

                    {isSelected && (
                      <ul className="mt-2 space-y-1">
                        {addon.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-gray-500">
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          {/* CTA */}
          <div className="px-6 py-5">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-xl transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.upgrade.subscribing}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t.upgrade.subscribe}
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              {t.upgrade.securePayment}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
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
    </div>
  );
}
