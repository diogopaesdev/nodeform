"use client";

import { useEffect, useState } from "react";
import { Mail, Trash2, Loader2, UserPlus, Users, Eye, Clock, CheckCircle } from "lucide-react";
import { SurveyCollaborator, CollaboratorRole } from "@/types/collaborator";

const ROLE_OPTIONS: { value: CollaboratorRole; label: string; desc: string }[] = [
  { value: "editor", label: "Editor", desc: "Pode editar a pesquisa" },
  { value: "viewer", label: "Visualizador", desc: "Pode ver resultados" },
];

const STATUS_BADGE: Record<SurveyCollaborator["status"], string> = {
  pending: "bg-amber-100 text-amber-700",
  accepted: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<SurveyCollaborator["status"], string> = {
  pending: "Pendente",
  accepted: "Aceito",
};

function RoleIcon({ role }: { role: CollaboratorRole }) {
  return role === "editor"
    ? <Users className="w-3.5 h-3.5" />
    : <Eye className="w-3.5 h-3.5" />;
}

export function CollaboratorsPanel({ surveyId }: { surveyId: string }) {
  const [collaborators, setCollaborators] = useState<SurveyCollaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollaborators();
  }, [surveyId]);

  const fetchCollaborators = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/surveys/${surveyId}/collaborators`);
      if (res.ok) {
        const data = await res.json();
        setCollaborators(data.collaborators ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    setInviteError("");
    setInviteSuccess(false);

    try {
      const res = await fetch(`/api/surveys/${surveyId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error ?? "Erro ao enviar convite.");
        return;
      }

      setInviteSuccess(true);
      setInviteEmail("");
      setCollaborators((prev) => [data.collaborator, ...prev]);
      setTimeout(() => setInviteSuccess(false), 3000);
    } catch {
      setInviteError("Erro de conexão. Tente novamente.");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    setRemovingId(collaboratorId);
    try {
      const res = await fetch(
        `/api/surveys/${surveyId}/collaborators/${collaboratorId}`,
        { method: "DELETE" }
      );
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.id !== collaboratorId));
      }
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Invite form */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Convidar colaborador</h2>
            <p className="text-xs text-gray-500">Envie um convite por e-mail</p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="px-5 py-4 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={inviteEmail}
                onChange={(e) => { setInviteEmail(e.target.value); setInviteError(""); }}
                disabled={inviting}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50"
                required
              />
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
              disabled={inviting}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={inviting || !inviteEmail.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {inviting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
              Convidar
            </button>
          </div>

          {/* Role description */}
          <p className="text-xs text-gray-400">
            {ROLE_OPTIONS.find((r) => r.value === inviteRole)?.desc}
          </p>

          {inviteError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {inviteError}
            </p>
          )}

          {inviteSuccess && (
            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Convite enviado com sucesso!
            </div>
          )}
        </form>
      </div>

      {/* Collaborators list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Colaboradores{collaborators.length > 0 ? ` (${collaborators.length})` : ""}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : collaborators.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Nenhum colaborador ainda.</p>
            <p className="text-xs text-gray-400 mt-0.5">Convide alguém para colaborar nesta pesquisa.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                {/* Avatar */}
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-500">
                  {c.invitedEmail[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">{c.invitedEmail}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full ${STATUS_BADGE[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <RoleIcon role={c.role} />
                      {c.role === "editor" ? "Editor" : "Visualizador"}
                    </span>
                    {c.status === "pending" && (
                      <>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expira em {new Date(c.expiresAt).toLocaleDateString("pt-BR")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(c.id)}
                  disabled={removingId === c.id}
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Remover colaborador"
                >
                  {removingId === c.id
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
