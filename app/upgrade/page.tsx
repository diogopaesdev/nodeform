"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Loader2, Sparkles, Check, LogOut } from "lucide-react";

const FEATURES = [
  "Pesquisas ilimitadas",
  "Respostas ilimitadas",
  "Editor visual node-based",
  "Exportação de dados",
  "Suporte prioritário",
];

export default function UpgradePage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-sm w-full p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Seu trial expirou</h1>
          <p className="text-sm text-gray-500 mt-2">
            Assine o Plano Pro para continuar usando o NodeForm
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-lg font-bold text-gray-900">Plano Pro</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-gray-900">
                R$ 499
              </span>
              <span className="text-xs text-gray-400">/mês</span>
            </div>
          </div>

          <ul className="space-y-2 mb-5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Assinar agora
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mb-4">
          Pagamento seguro via Stripe. Cancele a qualquer momento.
        </p>

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-xs text-gray-400">{session?.user?.email}</span>
          <span className="text-gray-200">·</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <LogOut className="w-3 h-3" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
