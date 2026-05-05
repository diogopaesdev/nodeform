"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Users, Eye, CheckCircle, XCircle, Loader2, LogIn } from "lucide-react";

interface InviteInfo {
  surveyId: string;
  surveyTitle: string;
  inviterName: string;
  invitedEmail: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted";
  expiresAt: string;
}

const ROLE_LABEL: Record<"editor" | "viewer", string> = {
  editor: "Editor",
  viewer: "Visualizador",
};

const ROLE_DESC: Record<"editor" | "viewer", string> = {
  editor: "Você poderá editar o fluxo e as configurações da pesquisa.",
  viewer: "Você poderá visualizar os resultados e respostas da pesquisa.",
};

export default function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "accepted" | "expired" | "not_found">("idle");

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      const res = await fetch(`/api/invitations/${token}`);
      if (res.status === 404) { setState("not_found"); return; }
      if (res.status === 410) { setState("expired"); return; }
      if (!res.ok) { setError("Erro ao carregar convite."); return; }
      const data = await res.json();
      setInvite(data.invite);
      if (data.invite.status === "accepted") setState("accepted");
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!session) {
      signIn(undefined, { callbackUrl: `/invite/${token}` });
      return;
    }

    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/invitations/${token}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao aceitar convite.");
        return;
      }
      setState("accepted");
      setTimeout(() => router.push(`/dashboard/survey/${data.surveyId}`), 1500);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-sm p-8 space-y-6">
        {/* Logo */}
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto">
          <span className="text-white text-xl font-bold">S</span>
        </div>

        {/* States */}
        {state === "not_found" && (
          <div className="text-center space-y-2">
            <XCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="text-base font-semibold text-gray-900">Convite não encontrado</h1>
            <p className="text-sm text-gray-500">Este link de convite é inválido ou já foi removido.</p>
          </div>
        )}

        {state === "expired" && (
          <div className="text-center space-y-2">
            <XCircle className="w-10 h-10 text-amber-400 mx-auto" />
            <h1 className="text-base font-semibold text-gray-900">Convite expirado</h1>
            <p className="text-sm text-gray-500">Este convite expirou. Peça ao administrador que envie um novo.</p>
          </div>
        )}

        {state === "accepted" && (
          <div className="text-center space-y-2">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
            <h1 className="text-base font-semibold text-gray-900">Convite aceito!</h1>
            <p className="text-sm text-gray-500">Redirecionando para a pesquisa...</p>
          </div>
        )}

        {state === "idle" && invite && (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-base font-semibold text-gray-900">Convite para colaborar</h1>
              <p className="text-sm text-gray-500">
                <strong className="text-gray-800">{invite.inviterName}</strong> convidou você para colaborar em uma pesquisa.
              </p>
            </div>

            {/* Survey info */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Pesquisa</p>
              <p className="text-sm font-semibold text-gray-900">{invite.surveyTitle}</p>

              <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  {invite.role === "editor"
                    ? <Users className="w-3.5 h-3.5 text-white" />
                    : <Eye className="w-3.5 h-3.5 text-white" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{ROLE_LABEL[invite.role]}</p>
                  <p className="text-xs text-gray-500">{ROLE_DESC[invite.role]}</p>
                </div>
              </div>
            </div>

            {/* Email match warning when logged in with different email */}
            {session && session.user.email?.toLowerCase() !== invite.invitedEmail && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <XCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Este convite foi enviado para <strong>{invite.invitedEmail}</strong>. Você está logado como <strong>{session.user.email}</strong>.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            {!session ? (
              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Fazer login para aceitar
              </button>
            ) : (
              <button
                onClick={handleAccept}
                disabled={accepting || session.user.email?.toLowerCase() !== invite.invitedEmail}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {accepting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Aceitando...</>
                  : <><CheckCircle className="w-4 h-4" />Aceitar convite</>}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
