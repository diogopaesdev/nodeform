"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Loader2, Check, X, Database, ChevronDown, ChevronUp } from "lucide-react";
import type { PlanDocument, PlanLimitsConfig } from "@/lib/services/plans-firestore";

const DEFAULT_LIMITS: PlanLimitsConfig = {
  surveys: null,
  responsesPerMonth: null,
  aiCreditsPerMonth: 10,
  userTemplates: null,
  collaborators: null,
  canPurchaseAddons: false,
  includesAllAddons: false,
  hasWhiteLabel: false,
};

const BASE_PLANS = ["growth", "pro", "enterprise"];

function LimitValue({ value }: { value: number | null | boolean }) {
  if (value === null) return <span className="text-green-600 font-medium">∞</span>;
  if (typeof value === "boolean") return value
    ? <Check className="w-3.5 h-3.5 text-green-600" />
    : <X className="w-3.5 h-3.5 text-gray-300" />;
  return <span>{value}</span>;
}

function PlanForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: Partial<PlanDocument>;
  onSave: (data: Partial<PlanDocument>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<Partial<PlanDocument>>({
    id: "",
    name: "",
    stripePriceId: "",
    isCustom: true,
    active: true,
    limits: { ...DEFAULT_LIMITS },
    ...initial,
  });

  const setLimit = (key: keyof PlanLimitsConfig, raw: string | boolean) => {
    if (typeof raw === "boolean") {
      setForm((f) => ({ ...f, limits: { ...f.limits!, [key]: raw } }));
      return;
    }
    const val = raw === "" || raw === "null" ? null : Number(raw);
    setForm((f) => ({ ...f, limits: { ...f.limits!, [key]: val } }));
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">ID (slug único)</label>
          <input
            value={form.id ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))}
            disabled={!!initial?.id}
            placeholder="enterprise_acme"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-100"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Nome</label>
          <input
            value={form.name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Enterprise Acme"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Stripe Price ID</label>
        <input
          value={form.stripePriceId ?? ""}
          onChange={(e) => setForm((f) => ({ ...f, stripePriceId: e.target.value || null }))}
          placeholder="price_xxxxxxxxxxxxxx"
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900 font-mono"
        />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-3">Limites</p>
        <div className="grid grid-cols-2 gap-3">
          {(["surveys", "responsesPerMonth", "aiCreditsPerMonth", "userTemplates", "collaborators"] as const).map((key) => (
            <div key={key}>
              <label className="text-xs text-gray-400 mb-1 block">{key}</label>
              <input
                type="text"
                value={form.limits?.[key] === null ? "" : String(form.limits?.[key] ?? "")}
                onChange={(e) => setLimit(key, e.target.value)}
                placeholder="null = ilimitado"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 mt-3">
          {(["canPurchaseAddons", "includesAllAddons", "hasWhiteLabel"] as const).map((key) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.limits?.[key]}
                onChange={(e) => setLimit(key, e.target.checked)}
                className="rounded"
              />
              <span className="text-xs text-gray-600">{key}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!form.active}
            onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Ativo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer ml-4">
          <input
            type="checkbox"
            checked={!!form.isCustom}
            onChange={(e) => setForm((f) => ({ ...f, isCustom: e.target.checked }))}
            className="rounded"
          />
          <span className="text-xs text-gray-600">Customizado</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.id || !form.name}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 rounded-lg transition-colors"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [seedResults, setSeedResults] = useState<{ id: string; status: string }[] | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/plans");
      if (res.ok) setPlans((await res.json()).plans);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/admin/plans/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSeedResults(data.results);
        await fetchPlans();
      }
    } finally {
      setSeeding(false);
    }
  };

  const handleCreate = async (data: Partial<PlanDocument>) => {
    setCreating(true);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setShowCreateForm(false);
        await fetchPlans();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (planId: string, data: Partial<PlanDocument>) => {
    setSavingId(planId);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchPlans();
      }
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (planId: string) => {
    setDeletingId(planId);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
      if (res.ok) await fetchPlans();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Gerenciar Planos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Planos do Firestore com fallback estático</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Seed planos base
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo plano
          </button>
        </div>
      </div>

      {/* Seed results */}
      {seedResults && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-700 mb-2">Resultado do seed:</p>
          {seedResults.map((r) => (
            <p key={r.id} className="text-xs text-green-600">{r.id}: {r.status}</p>
          ))}
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Novo plano</p>
          <PlanForm
            onSave={handleCreate}
            onCancel={() => setShowCreateForm(false)}
            saving={creating}
          />
        </div>
      )}

      {/* Plans list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {editingId === plan.id ? (
                <div className="p-4">
                  <PlanForm
                    initial={plan}
                    onSave={(data) => handleUpdate(plan.id, data)}
                    onCancel={() => setEditingId(null)}
                    saving={savingId === plan.id}
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-center px-5 py-4 gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                        <code className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{plan.id}</code>
                        {plan.isCustom && (
                          <span className="text-[10px] font-bold bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">CUSTOM</span>
                        )}
                        {!plan.active && (
                          <span className="text-[10px] font-bold bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">INATIVO</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">
                        {plan.stripePriceId ?? <span className="italic">sem price ID</span>}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {expandedId === plan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => setEditingId(plan.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {!BASE_PLANS.includes(plan.id) && (
                        <button
                          onClick={() => handleDelete(plan.id)}
                          disabled={deletingId === plan.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {expandedId === plan.id && (
                    <div className="px-5 pb-4 border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        {(Object.entries(plan.limits) as [string, number | null | boolean][]).map(([key, val]) => (
                          <div key={key} className="bg-gray-50 rounded-lg px-3 py-2">
                            <p className="text-gray-400 mb-1">{key}</p>
                            <div className="font-medium text-gray-700 flex items-center">
                              <LimitValue value={val} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
