"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { EligibilityRule, ProfileField, ProfileSchema } from "@/types/addon";

interface Props {
  workspaceUserId: string; // to fetch schema
  rules: EligibilityRule[];
  onChange: (rules: EligibilityRule[]) => void;
  label?: string;
  hint?: string;
}

const OPERATORS = [
  { value: "equals",     label: "é igual a" },
  { value: "not_equals", label: "é diferente de" },
  { value: "in",         label: "está em" },
  { value: "not_in",     label: "não está em" },
  { value: "exists",     label: "está preenchido" },
  { value: "not_exists", label: "está vazio" },
] as const;

const NO_VALUE_OPS = ["exists", "not_exists"];
const MULTI_VALUE_OPS = ["in", "not_in"];

function newRule(): EligibilityRule {
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    field: "",
    operator: "equals",
    value: "",
    label: "",
  };
}

export function EligibilityRuleBuilder({
  workspaceUserId,
  rules,
  onChange,
  label = "Regras de elegibilidade",
  hint = "Respondentes precisam atender a TODAS as regras para acessar.",
}: Props) {
  const [schema, setSchema] = useState<ProfileSchema>([]);
  const [schemaLoaded, setSchemaLoaded] = useState(false);

  useEffect(() => {
    if (!workspaceUserId) return;
    fetch(`/api/public/workspace/${workspaceUserId}/profile-schema`)
      .then((r) => r.json())
      .then((d) => { setSchema(d.schema ?? []); setSchemaLoaded(true); })
      .catch(() => setSchemaLoaded(true));
  }, [workspaceUserId]);

  const getField = (key: string): ProfileField | undefined =>
    schema.find((f) => f.key === key);

  const updateRule = (id: string, patch: Partial<EligibilityRule>) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRule = (id: string) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  const addRule = () => onChange([...rules, newRule()]);

  const renderValueInput = (rule: EligibilityRule) => {
    if (NO_VALUE_OPS.includes(rule.operator as string)) return null;

    const field = getField(rule.field);
    const isMulti = MULTI_VALUE_OPS.includes(rule.operator as string);

    if (field?.type === "enum" && field.options) {
      if (isMulti) {
        const selected = Array.isArray(rule.value) ? rule.value : [];
        return (
          <div className="flex flex-wrap gap-1.5">
            {field.options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  const next = selected.includes(opt)
                    ? selected.filter((v) => v !== opt)
                    : [...selected, opt];
                  updateRule(rule.id, { value: next });
                }}
                className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                  selected.includes(opt)
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        );
      }
      return (
        <select
          value={typeof rule.value === "string" ? rule.value : ""}
          onChange={(e) => updateRule(rule.id, { value: e.target.value })}
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
        >
          <option value="">Selecione...</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (isMulti) {
      return (
        <input
          type="text"
          placeholder="valor1, valor2, valor3"
          value={Array.isArray(rule.value) ? rule.value.join(", ") : (rule.value as string) ?? ""}
          onChange={(e) =>
            updateRule(rule.id, {
              value: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
            })
          }
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      );
    }

    return (
      <input
        type="text"
        placeholder="valor"
        value={typeof rule.value === "string" ? rule.value : ""}
        onChange={(e) => updateRule(rule.id, { value: e.target.value })}
        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-700">{label}</p>
          {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
        <button
          type="button"
          onClick={addRule}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Adicionar regra
        </button>
      </div>

      {schemaLoaded && schema.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Nenhum campo de perfil configurado. Defina o schema em{" "}
            <strong>Dashboard → Configurações → Integrações</strong> para usar campos como dropdown.
          </span>
        </div>
      )}

      {rules.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-3">
          Sem regras — todos os respondentes autenticados podem acessar.
        </p>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div key={rule.id} className="border border-gray-200 rounded-xl p-3 space-y-2 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Regra {idx + 1}</span>
                <button
                  type="button"
                  onClick={() => removeRule(rule.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Label amigável (exibida na tela de inelegível) */}
              <input
                type="text"
                placeholder="Mensagem de bloqueio (ex: Pesquisa exclusiva para oncologistas)"
                value={rule.label ?? ""}
                onChange={(e) => updateRule(rule.id, { label: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white text-gray-700"
              />

              <div className="flex items-start gap-2 flex-wrap">
                {/* Campo */}
                {schema.length > 0 ? (
                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(rule.id, { field: e.target.value, value: "" })}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                  >
                    <option value="">Campo...</option>
                    {schema.map((f) => (
                      <option key={f.key} value={f.key}>{f.label} ({f.key})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="campo (ex: specialty)"
                    value={rule.field}
                    onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white w-40"
                  />
                )}

                {/* Operador */}
                <select
                  value={rule.operator}
                  onChange={(e) => updateRule(rule.id, { operator: e.target.value as EligibilityRule["operator"], value: "" })}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                >
                  {OPERATORS.map((op) => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                {/* Valor */}
                {renderValueInput(rule)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
