"use client";

import { useState, useCallback } from "react";
import { Loader2, Search, Save } from "lucide-react";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  planId: string | null;
  subscriptionStatus: string | null;
  trialEnd: string | null;
  addons: { respondents?: boolean; surveyProgress?: boolean };
}

interface RowState {
  planId: string;
  subscriptionStatus: string;
  addonRespondents: boolean;
  addonSurveyProgress: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

const PLAN_OPTIONS = ["growth", "pro", "enterprise"];
const STATUS_OPTIONS = ["active", "trialing", "past_due", "inactive"];
const ADDON_LABELS: { id: "respondents" | "surveyProgress"; label: string }[] = [
  { id: "respondents", label: "Respondentes" },
  { id: "surveyProgress", label: "Salvar progresso" },
];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  const buildRowState = (u: AdminUser): RowState => ({
    planId: u.planId ?? "growth",
    subscriptionStatus: u.subscriptionStatus ?? "inactive",
    addonRespondents: u.addons?.respondents === true,
    addonSurveyProgress: u.addons?.surveyProgress === true,
    saving: false,
    saved: false,
    error: null,
  });

  const search = useCallback(async (q: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      const url = q.trim()
        ? `/api/admin/users?q=${encodeURIComponent(q.trim())}`
        : "/api/admin/users";
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFetchError(data.error ?? "Erro ao buscar usuários");
        setUsers(null);
        return;
      }
      const data = await res.json();
      const list: AdminUser[] = data.users ?? [];
      setUsers(list);
      const states: Record<string, RowState> = {};
      for (const u of list) states[u.id] = buildRowState(u);
      setRowStates(states);
    } catch {
      setFetchError("Erro ao buscar usuários");
      setUsers(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = async (userId: string) => {
    const row = rowStates[userId];
    if (!row) return;

    setRowStates((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], saving: true, saved: false, error: null },
    }));

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          planId: row.planId,
          subscriptionStatus: row.subscriptionStatus === "inactive" ? "inactive" : row.subscriptionStatus,
          addons: {
            respondents: row.addonRespondents,
            surveyProgress: row.addonSurveyProgress,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setRowStates((prev) => ({
          ...prev,
          [userId]: { ...prev[userId], saving: false, error: data.error ?? "Erro ao salvar" },
        }));
        return;
      }

      setRowStates((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], saving: false, saved: true },
      }));

      setTimeout(() => {
        setRowStates((prev) => ({
          ...prev,
          [userId]: { ...prev[userId], saved: false },
        }));
      }, 2000);
    } catch {
      setRowStates((prev) => ({
        ...prev,
        [userId]: { ...prev[userId], saving: false, error: "Erro ao salvar" },
      }));
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">Atribua planos e status de assinatura</p>
        </div>
        <a
          href="/dashboard/admin/plans"
          className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2 transition-colors"
        >
          Gerenciar Planos
        </a>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search(query)}
            placeholder="Buscar por email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
        <button
          onClick={() => search(query)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Buscar
        </button>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {fetchError}
        </div>
      )}

      {/* Results */}
      {users !== null && (
        <>
          {users.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-400">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Plano</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Módulos</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => {
                    const row = rowStates[user.id];
                    if (!row) return null;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">
                          {user.name ?? <span className="text-gray-300 italic">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                          {user.email ?? <span className="text-gray-300 italic">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={row.planId}
                            onChange={(e) =>
                              setRowStates((prev) => ({
                                ...prev,
                                [user.id]: { ...prev[user.id], planId: e.target.value, saved: false },
                              }))
                            }
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                          >
                            {PLAN_OPTIONS.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={row.subscriptionStatus}
                            onChange={(e) =>
                              setRowStates((prev) => ({
                                ...prev,
                                [user.id]: { ...prev[user.id], subscriptionStatus: e.target.value, saved: false },
                              }))
                            }
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            {ADDON_LABELS.map(({ id, label }) => {
                              const field = id === "respondents" ? "addonRespondents" : "addonSurveyProgress";
                              return (
                                <label key={id} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={row[field]}
                                    onChange={(e) =>
                                      setRowStates((prev) => ({
                                        ...prev,
                                        [user.id]: { ...prev[user.id], [field]: e.target.checked, saved: false },
                                      }))
                                    }
                                    className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                                  />
                                  {label}
                                </label>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSave(user.id)}
                              disabled={row.saving}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
                            >
                              {row.saving ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Save className="w-3 h-3" />
                              )}
                              Salvar
                            </button>
                            {row.saved && (
                              <span className="text-xs text-green-600 font-medium">Salvo!</span>
                            )}
                            {row.error && (
                              <span className="text-xs text-red-500">{row.error}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {users === null && !loading && !fetchError && (
        <div className="text-center py-16 text-sm text-gray-400">
          Use o campo acima para buscar usuários por email, ou clique em Buscar para ver os mais recentes.
        </div>
      )}
    </div>
  );
}
