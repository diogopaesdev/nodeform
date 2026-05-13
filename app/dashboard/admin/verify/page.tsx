"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ShieldCheck, Mail } from "lucide-react";

export default function AdminVerifyPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const requestCode = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/request-code", { method: "POST" });
      if (res.ok) {
        setSent(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao enviar código");
      }
    } finally {
      setSending(false);
    }
  };

  useEffect(() => { requestCode(); }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        router.push("/dashboard/admin/plans");
      } else {
        const data = await res.json();
        setError(data.error ?? "Código inválido");
        setCode("");
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Verificação Admin</h1>
            <p className="text-sm text-gray-500 mt-1">
              {sent
                ? `Código enviado para ${session?.user?.email ?? "seu e-mail"}`
                : "Enviando código de verificação..."}
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full text-center text-2xl font-bold tracking-widest border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={!sent || verifying}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={code.length !== 6 || verifying || !sent}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-xl transition-colors"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
            </button>

            <button
              type="button"
              onClick={requestCode}
              disabled={sending || !sent}
              className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
              Reenviar código
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
