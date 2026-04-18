"use client";

import { useState } from "react";
import { Loader2, Mail, KeyRound } from "lucide-react";

interface RespondentInfo {
  id: string;
  name: string;
  email: string;
}

interface Props {
  surveyId: string;
  surveyTitle: string;
  brandColor?: string;
  onAuthenticated: (respondent: RespondentInfo) => void;
}

type Step = "email" | "code";

export function RespondentLoginGate({ surveyId, surveyTitle, brandColor, onAuthenticated }: Props) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accent = brandColor || "#111827";

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/respondent/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, surveyId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar código");
        return;
      }

      setStep("code");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/respondent/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, surveyId, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Código inválido");
        return;
      }

      onAuthenticated(data.respondent);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold text-gray-900">Acesso à pesquisa</h1>
          <p className="text-sm text-gray-500 leading-snug">
            {step === "email"
              ? `Para participar de "${surveyTitle}", insira seu e-mail cadastrado.`
              : `Insira o código de 6 dígitos enviado para ${email}.`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !email}
              style={{ backgroundColor: accent }}
              className="w-full py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                </span>
              ) : (
                "Enviar código"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Código de verificação</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 tracking-widest font-mono"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              style={{ backgroundColor: accent }}
              className="w-full py-2.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-opacity"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>

            <button
              type="button"
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
            >
              Usar outro e-mail
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
