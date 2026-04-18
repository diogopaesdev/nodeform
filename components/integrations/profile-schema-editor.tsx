"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2, Save, X } from "lucide-react";
import { ProfileField, ProfileSchema } from "@/types/addon";

interface Props {
  disabled?: boolean;
}

const OPERATOR_LABELS: Record<string, string> = {
  string: "Texto livre",
  enum: "Lista de opções",
};

export function ProfileSchemaEditor({ disabled }: Props) {
  const [schema, setSchema] = useState<ProfileSchema>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // New field form state
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<"string" | "enum">("string");
  const [newDescription, setNewDescription] = useState("");
  const [newOptions, setNewOptions] = useState(""); // comma-separated
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const res = await fetch("/api/workspace/profile-schema");
      if (res.ok) {
        const data = await res.json();
        setSchema(data.schema);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedSchema: ProfileSchema) => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/workspace/profile-schema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema: updatedSchema }),
      });
      if (res.ok) {
        setSchema(updatedSchema);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const validateKey = (key: string) => {
    if (!key) return "Obrigatório";
    if (!/^[a-z_][a-z0-9_]*$/.test(key)) return "Use apenas letras minúsculas, números e _";
    if (schema.some((f) => f.key === key)) return "Campo já existe";
    return "";
  };

  const handleAddField = async () => {
    const err = validateKey(newKey);
    if (err) { setKeyError(err); return; }
    if (!newLabel.trim()) return;
    if (newType === "enum" && !newOptions.trim()) return;

    const field: ProfileField = {
      key: newKey.trim(),
      label: newLabel.trim(),
      type: newType,
      description: newDescription.trim() || undefined,
      options: newType === "enum"
        ? newOptions.split(",").map((o) => o.trim()).filter(Boolean)
        : undefined,
    };

    const updated = [...schema, field];
    await handleSave(updated);

    // Reset form
    setNewKey(""); setNewLabel(""); setNewType("string");
    setNewDescription(""); setNewOptions(""); setKeyError("");
    setShowAddForm(false);
  };

  const handleRemoveField = async (key: string) => {
    if (!confirm(`Remover o campo "${key}"? Regras de elegibilidade que usam este campo serão afetadas.`)) return;
    await handleSave(schema.filter((f) => f.key !== key));
  };

  const handleUpdateField = async (key: string, updates: Partial<ProfileField>) => {
    const updated = schema.map((f) => f.key === key ? { ...f, ...updates } : f);
    await handleSave(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" /> Carregando schema...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Schema de Perfil</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Defina quais campos sua plataforma vai enviar no perfil de cada respondente.
          </p>
        </div>
        {!disabled && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo campo
          </button>
        )}
      </div>

      {/* Add field form */}
      {showAddForm && (
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Novo campo</span>
            <button onClick={() => { setShowAddForm(false); setKeyError(""); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Chave do campo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ex: specialty"
                value={newKey}
                onChange={(e) => { setNewKey(e.target.value.toLowerCase().replace(/\s/g, "_")); setKeyError(""); }}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {keyError && <p className="text-xs text-red-600">{keyError}</p>}
              <p className="text-xs text-gray-400">Nome usado no código (ex: <code className="font-mono">specialty</code>)</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Nome amigável <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="ex: Especialidade"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <p className="text-xs text-gray-400">Exibido nas regras de elegibilidade</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Tipo</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as "string" | "enum")}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
              >
                <option value="string">Texto livre</option>
                <option value="enum">Lista de opções fixas</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Descrição (opcional)</label>
              <input
                type="text"
                placeholder="ex: Especialidade médica"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>
          </div>

          {newType === "enum" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Opções válidas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="oncologia, clinico_geral, cardiologia, hematologia"
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              <p className="text-xs text-gray-400">Separe os valores com vírgula</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setShowAddForm(false)} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700">
              Cancelar
            </button>
            <button
              onClick={handleAddField}
              disabled={saving || !newKey || !newLabel || (newType === "enum" && !newOptions)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Salvar campo
            </button>
          </div>
        </div>
      )}

      {/* Fields list */}
      {schema.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl">
          Nenhum campo definido ainda.<br />
          <span className="text-xs">Adicione os campos que sua plataforma vai enviar no perfil.</span>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
          {schema.map((field) => (
            <div key={field.key} className="bg-white">
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === field.key ? null : field.key)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{field.key}</code>
                    <span className="text-sm font-medium text-gray-900 truncate">{field.label}</span>
                    <span className="text-xs text-gray-400">{OPERATOR_LABELS[field.type]}</span>
                  </div>
                  {field.type === "enum" && field.options && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {field.options.map((opt) => (
                        <span key={opt} className="px-1.5 py-0.5 text-xs bg-blue-50 text-blue-700 rounded">{opt}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!disabled && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveField(field.key); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {expanded === field.key
                    ? <ChevronUp className="w-4 h-4 text-gray-400" />
                    : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>

              {/* Expanded edit */}
              {expanded === field.key && !disabled && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-100 bg-gray-50">
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Nome amigável</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.key, { label: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Descrição</label>
                      <input
                        type="text"
                        value={field.description ?? ""}
                        onChange={(e) => handleUpdateField(field.key, { description: e.target.value || undefined })}
                        placeholder="Opcional"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                      />
                    </div>
                  </div>

                  {field.type === "enum" && (
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-700">Opções (separadas por vírgula)</label>
                      <input
                        type="text"
                        value={field.options?.join(", ") ?? ""}
                        onChange={(e) => handleUpdateField(field.key, {
                          options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean)
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {saved && (
        <p className="text-xs text-green-600 text-right">Schema salvo ✓</p>
      )}
    </div>
  );
}
