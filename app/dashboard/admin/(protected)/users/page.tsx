"use client";

import { useState, useCallback } from "react";
import { Loader2, Search, Save, CreditCard, AlertTriangle, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  planId: string | null;
  subscriptionStatus: string | null;
  trialEnd: string | null;
  addons: { respondents?: boolean; surveyProgress?: boolean };
}

interface BillingInfo {
  hasStripeCustomer: boolean;
  subscription?: {
    id: string;
    status: string;
    planId: string | null;
    trialEnd: string | null;
    currentPeriodEnd: string | null;
    cancelAt: string | null;
    canceledAt: string | null;
  } | null;
  lastInvoice?: {
    status: string | null;
    amountDue: number;
    currency: string;
    hostedInvoiceUrl: string | null;
  } | null;
  lastPaymentError?: {
    message: string | null;
    declineCode: string | null;
    code: string | null;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  trialing: "Em teste",
  active: "Ativo",
  past_due: "Pagamento atrasado",
  unpaid: "Não pago",
  canceled: "Cancelado",
  incomplete: "Incompleto",
  incomplete_expired: "Expirado sem pagamento",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency.toUpperCase() }).format(
    amount / 100
  );
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

  // Billing recovery modal
  const [billingUser, setBillingUser] = useState<AdminUser | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingData, setBillingData] = useState<BillingInfo | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [graceDays, setGraceDays] = useState(7);
  const [actionLoading, setActionLoading] = useState<"retry" | "grace" | null>(null);
  const [actionResult, setActionResult] = useState<{ ok: boolean; message: string } | null>(null);

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

  const openBillingModal = async (user: AdminUser) => {
    setBillingUser(user);
    setBillingData(null);
    setBillingError(null);
    setActionResult(null);
    setGraceDays(7);
    setBillingLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/billing`);
      const data = await res.json();
      if (!res.ok) {
        setBillingError(data.error ?? "Erro ao buscar dados de cobrança");
      } else {
        setBillingData(data);
      }
    } catch {
      setBillingError("Erro ao buscar dados de cobrança");
    } finally {
      setBillingLoading(false);
    }
  };

  const closeBillingModal = () => {
    setBillingUser(null);
    setBillingData(null);
    setBillingError(null);
    setActionResult(null);
  };

  const handleRetryCharge = async () => {
    if (!billingUser) return;
    setActionLoading("retry");
    setActionResult(null);
    try {
      const res = await fetch(`/api/admin/users/${billingUser.id}/retry-charge`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setActionResult({ ok: false, message: data.error ?? "Cobrança recusada" });
      } else {
        setActionResult({ ok: true, message: `Cobrança bem-sucedida — status: ${STATUS_LABELS[data.status] ?? data.status}` });
        await openBillingModal(billingUser);
      }
    } catch {
      setActionResult({ ok: false, message: "Erro ao tentar cobrar" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGrantGracePeriod = async () => {
    if (!billingUser) return;
    setActionLoading("grace");
    setActionResult(null);
    try {
      const res = await fetch(`/api/admin/users/${billingUser.id}/grace-period`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: graceDays }),
      });
      const data = await res.json();
      if (!res.ok || data.ok === false) {
        setActionResult({ ok: false, message: data.error ?? "Erro ao conceder carência" });
      } else {
        setActionResult({ ok: true, message: `Carência concedida até ${formatDate(data.trialEnd)}, sem cobrar.` });
        await openBillingModal(billingUser);
      }
    } catch {
      setActionResult({ ok: false, message: "Erro ao conceder carência" });
    } finally {
      setActionLoading(null);
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
                          <div className="flex items-center gap-2 flex-wrap">
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
                            <button
                              onClick={() => openBillingModal(user)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              <CreditCard className="w-3 h-3" />
                              Cobrança
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

      <Dialog open={!!billingUser} onOpenChange={(open) => !open && closeBillingModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Cobrança — {billingUser?.email ?? billingUser?.name ?? "usuário"}</DialogTitle>
            <DialogDescription>
              Estado real no Stripe e ações para recuperar uma assinatura cancelada por falha de pagamento.
            </DialogDescription>
          </DialogHeader>

          {billingLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            </div>
          )}

          {!billingLoading && billingError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {billingError}
            </div>
          )}

          {!billingLoading && billingData && !billingData.hasStripeCustomer && (
            <div className="text-sm text-gray-500">
              Este usuário não tem cliente Stripe associado — nada pra recuperar por aqui. Use o plano e status manuais na tabela.
            </div>
          )}

          {!billingLoading && billingData?.hasStripeCustomer && (
            <div className="space-y-4">
              {/* O que realmente aconteceu */}
              <div className="border border-gray-200 rounded-lg p-3 text-sm">
                <div className="font-medium text-gray-900 mb-2">O que aconteceu</div>
                {billingData.subscription ? (
                  <div className="space-y-1 text-gray-600">
                    <div>
                      Status no Stripe:{" "}
                      <span className="font-medium text-gray-900">
                        {STATUS_LABELS[billingData.subscription.status] ?? billingData.subscription.status}
                      </span>
                    </div>
                    {billingData.subscription.canceledAt && (
                      <div>Cancelada em: {formatDate(billingData.subscription.canceledAt)}</div>
                    )}
                    {billingData.subscription.trialEnd && (
                      <div>Trial até: {formatDate(billingData.subscription.trialEnd)}</div>
                    )}
                    {billingData.subscription.currentPeriodEnd && (
                      <div>Próxima cobrança/período até: {formatDate(billingData.subscription.currentPeriodEnd)}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">Nenhuma assinatura encontrada no Stripe para este cliente.</div>
                )}

                {billingData.lastPaymentError && (
                  <div className="mt-2 flex items-start gap-1.5 bg-red-50 border border-red-100 rounded-md p-2 text-red-700">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-medium">Última cobrança recusada</div>
                      <div>{billingData.lastPaymentError.message ?? billingData.lastPaymentError.code}</div>
                    </div>
                  </div>
                )}

                {billingData.lastInvoice && (
                  <div className="mt-2 flex items-center justify-between text-gray-600">
                    <span>
                      Última fatura: {billingData.lastInvoice.status ?? "—"} ·{" "}
                      {formatMoney(billingData.lastInvoice.amountDue, billingData.lastInvoice.currency)}
                    </span>
                    {billingData.lastInvoice.hostedInvoiceUrl && (
                      <a
                        href={billingData.lastInvoice.hostedInvoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
                      >
                        ver <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Ações */}
              <div className="border border-gray-200 rounded-lg p-3 space-y-3">
                <div className="font-medium text-gray-900 text-sm">Ações</div>
                <p className="text-xs text-gray-500">
                  Usa o plano atualmente salvo para este usuário ({rowStates[billingUser?.id ?? ""]?.planId ?? "—"}).
                  Pra cobrar em outro plano, mude o plano na tabela e clique em Salvar antes.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetryCharge}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {actionLoading === "retry" ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Retentar cobrança no plano atual
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={90}
                    value={graceDays}
                    onChange={(e) => setGraceDays(Number(e.target.value))}
                    className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <button
                    onClick={handleGrantGracePeriod}
                    disabled={actionLoading !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {actionLoading === "grace" ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Conceder dias sem cobrar
                  </button>
                </div>
                <p className="text-xs text-gray-400">
                  Usa o cartão já salvo no Stripe (não é removido ao cancelar) — o cliente não precisa fazer nada agora, só será cobrado quando a carência acabar.
                </p>
              </div>

              {actionResult && (
                <div
                  className={`text-sm rounded-lg p-3 ${
                    actionResult.ok
                      ? "bg-green-50 border border-green-200 text-green-700"
                      : "bg-red-50 border border-red-200 text-red-600"
                  }`}
                >
                  {actionResult.message}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
