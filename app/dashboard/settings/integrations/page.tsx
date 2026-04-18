"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  KeyRound,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  BookmarkCheck,
} from "lucide-react";
import { ProfileSchemaEditor } from "@/components/integrations/profile-schema-editor";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
  rawKey?: string; // only present right after creation
}

export default function IntegrationsPage() {
  return (
    <Suspense>
      <IntegrationsContent />
    </Suspense>
  );
}

function IntegrationsContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const addonSuccess = searchParams.get("addon_success") === "true";

  const hasAddon = session?.user?.addons?.respondents?.active === true;
  const hasProgressAddon = session?.user?.addons?.surveyProgress?.active === true;

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activatingProgress, setActivatingProgress] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    if (hasAddon) loadKeys();
  }, [hasAddon]);

  const loadKeys = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workspace/api-keys");
      if (res.ok) {
        const data = await res.json();
        setKeys(data.keys);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActivateAddon = async () => {
    setActivating(true);
    try {
      const res = await fetch("/api/stripe/addon-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addonId: "respondents" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setActivating(false);
    }
  };

  const handleActivateProgressAddon = async () => {
    setActivatingProgress(true);
    try {
      const res = await fetch("/api/stripe/addon-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addonId: "surveyProgress" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setActivatingProgress(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/workspace/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setKeys((prev) => [data.key, ...prev]);
        setNewKeyName("");
        setShowCreate(false);
        setRevealedKey(data.key.id);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm("Revogar esta API key? Integrações que a utilizam pararão de funcionar.")) return;
    await fetch(`/api/workspace/api-keys/${keyId}`, { method: "DELETE" });
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Integrações</h1>
        <p className="text-sm text-gray-500 mt-1">
          Conecte sua plataforma ao NodeForm para autenticar respondentes via SSO.
        </p>
      </div>

      {addonSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <Check className="w-4 h-4 shrink-0" />
          Módulo ativado com sucesso!
        </div>
      )}

      {/* Addon card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Módulo Respondentes</h2>
                {hasAddon ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Ativo</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">Não ativo</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Autenticação dedicada, controle de acesso e integração B2B para pesquisas enterprise.
              </p>
            </div>
          </div>

          {!hasAddon && (
            <button
              onClick={handleActivateAddon}
              disabled={activating}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
            >
              {activating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Ativar módulo
            </button>
          )}
        </div>

        {!hasAddon && (
          <div className="px-5 pb-5 space-y-2">
            {[
              "Login obrigatório via OTP por e-mail ou SSO",
              "SSO — usuários da sua plataforma chegam autenticados, sem tela de login",
              "Sync de perfil em massa (até 500 respondentes por chamada)",
              "Elegibilidade por perfil — filtre por especialidade, setor, CRM e mais",
              "Critérios de visibilidade por questão — perguntas condicionais por perfil",
              "Participação única — bloqueio automático de segunda tentativa",
              "Cota máxima com encerramento automático da pesquisa",
              "Workspace Profile Schema com rule builder tipado",
              "API Keys seguras para integração server-to-server",
              "Painel de liberação de bonificação pós-participação",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3 text-gray-300 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Survey Progress Addon card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-gray-900">Módulo Progresso</h2>
                {hasProgressAddon ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Ativo</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">Não ativo</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Persistência de respostas entre sessões com retomada inteligente em qualquer dispositivo.
              </p>
            </div>
          </div>

          {!hasProgressAddon && (
            <button
              onClick={handleActivateProgressAddon}
              disabled={activatingProgress}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {activatingProgress ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Ativar módulo
            </button>
          )}
        </div>

        {!hasProgressAddon && (
          <div className="px-5 pb-5 space-y-2">
            {[
              "Progresso salvo automaticamente após cada resposta",
              "Respondente retoma de onde parou em qualquer device ou sessão",
              "Dialog de escolha: retomar de onde parou ou recomeçar do início",
              "Funciona com autenticação OTP e SSO",
              "Progresso deletado automaticamente ao concluir — sem dados residuais",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                <Lock className="w-3 h-3 text-gray-300 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        )}

        {hasProgressAddon && (
          <div className="px-5 pb-5 space-y-2">
            {[
              "Progresso salvo automaticamente após cada resposta",
              "Respondente retoma de onde parou em qualquer device ou sessão",
              "Dialog de escolha: retomar de onde parou ou recomeçar do início",
              "Funciona com autenticação OTP e SSO",
              "Progresso deletado automaticamente ao concluir — sem dados residuais",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-xs text-gray-500">
                <Check className="w-3 h-3 text-green-500 shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Keys section */}
      {hasAddon && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">API Keys</h2>
              <p className="text-xs text-gray-500">Use para autenticar chamadas server-to-server da sua plataforma.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadKeys} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova chave
              </button>
            </div>
          </div>

          {showCreate && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <input
                autoFocus
                type="text"
                placeholder="Nome da chave (ex: MOC Produção)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
              />
              <button
                onClick={handleCreateKey}
                disabled={creating || !newKeyName.trim()}
                className="px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50"
              >
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Criar"}
              </button>
              <button onClick={() => setShowCreate(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">
                Cancelar
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              Nenhuma API key criada ainda.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {keys.map((key) => (
                <div key={key.id} className="p-4 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{key.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                        title="Revogar chave"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {key.rawKey ? (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                      <code className="flex-1 text-xs font-mono text-amber-900 break-all">
                        {revealedKey === key.id ? key.rawKey : `${key.keyPrefix}${"•".repeat(40)}`}
                      </code>
                      <button
                        onClick={() => setRevealedKey(revealedKey === key.id ? null : key.id)}
                        className="text-amber-600 hover:text-amber-800 shrink-0"
                      >
                        {revealedKey === key.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.rawKey!, key.id)}
                        className="text-amber-600 hover:text-amber-800 shrink-0"
                      >
                        {copiedId === key.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ) : (
                    <code className="text-xs font-mono text-gray-400">{key.keyPrefix}{"•".repeat(40)}</code>
                  )}

                  {key.rawKey && (
                    <p className="text-xs text-amber-700">
                      Copie agora. A chave completa não será exibida novamente.
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Criada em {formatDate(key.createdAt)}</span>
                    {key.lastUsedAt && <span>· Último uso {formatDate(key.lastUsedAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Integration example */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold text-gray-700">Exemplo de integração (Node.js)</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`// 1. Gerar token SSO (backend da sua plataforma)
const res = await fetch('https://nodeform.app/api/sso/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    apiKey: 'nfk_sua_chave_aqui',
    surveyId: 'id_da_pesquisa',
    email: usuario.email,
    name: usuario.nome,
    profile: {
      specialty: usuario.especialidade, // ex: 'oncologia'
      sector: usuario.setor,           // ex: 'privado'
      crm: usuario.crm,
    }
  })
});
const { token } = await res.json();

// 2. Redirecionar o usuário
res.redirect(\`https://nodeform.app/survey/\${surveyId}?sso_token=\${token}\`);`}
            </pre>
          </div>

          {/* Profile Schema */}
          <div className="border border-gray-200 rounded-xl p-5">
            <ProfileSchemaEditor />
          </div>

          {/* Sync example */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
            <h3 className="text-xs font-semibold text-gray-700">Sync de perfil em massa (opcional)</h3>
            <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`// Atualizar perfis sem exigir login dos usuários
await fetch('https://nodeform.app/api/workspace/respondents/sync', {
  method: 'POST',
  body: JSON.stringify({
    apiKey: 'nfk_sua_chave_aqui',
    respondents: [
      { email: 'dr@email.com', name: 'Dr. João',
        profile: { specialty: 'oncologia', sector: 'privado' } },
      // ... até 500 por requisição
    ]
  })
});`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
