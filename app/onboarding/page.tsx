"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, ArrowRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function formatCNPJ(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

const PERKS = [
  "Editor visual node-based",
  "Fluxo condicional por resposta",
  "7 dias grátis, sem cartão",
];

export default function OnboardingPage() {
  const { update } = useSession();
  const { t } = useI18n();
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, cnpj }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao salvar dados");
        return;
      }

      // Atualiza o JWT e faz reload completo para garantir que o middleware
      // leia o cookie atualizado (router.push pode usar o cookie antigo)
      await update();
      window.location.href = "/dashboard";
    } catch {
      setError("Erro ao salvar dados. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="19" width="18" height="10" rx="3" fill="white"/>
                <rect x="28" y="8" width="17" height="10" rx="3" fill="white"/>
                <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55"/>
                <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7"/>
                <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
                <circle cx="21" cy="24" r="3" fill="white"/>
                <circle cx="28" cy="13" r="2.5" fill="white"/>
                <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55"/>
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">SurveyFlow</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="px-6 pt-6 pb-5 border-b border-gray-100">
            <h1 className="text-lg font-semibold text-gray-900">Bem-vindo ao SurveyFlow</h1>
            <p className="text-sm text-gray-500 mt-1">
              Só precisamos de um detalhe para começar.
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Razão Social <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Empresa Ltda."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoFocus
                  required
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 text-gray-900 placeholder-gray-400 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  CNPJ{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 text-gray-900 placeholder-gray-400 transition-colors"
                />
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !companyName.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors mt-1"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Começar agora
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trial perks */}
          <div className="px-6 pb-5">
            <div className="bg-gray-50 rounded-xl px-4 py-3.5 space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Incluído no trial
              </p>
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Você pode alterar essas informações depois em Configurações.
        </p>
      </div>
    </div>
  );
}
