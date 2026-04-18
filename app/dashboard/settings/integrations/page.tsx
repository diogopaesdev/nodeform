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
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ProfileSchemaEditor } from "@/components/integrations/profile-schema-editor";
import { useI18n } from "@/lib/i18n";

// ─── Code Example Component ───────────────────────────────────────────────────

type Lang = "node" | "python" | "php" | "curl";

const LANG_LABELS: Record<Lang, string> = {
  node: "Node.js",
  python: "Python",
  php: "PHP",
  curl: "cURL",
};

function CodeExample({
  title,
  snippets,
}: {
  title: string;
  snippets: Record<Lang, string>;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const [lang, setLang] = useState<Lang>("node");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        {open ? (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>

      {open && (
        <div>
          <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-white">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                  lang === l
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              {copied ? (
                <><Check className="w-3 h-3 text-green-500" /> {t.common.copied}</>
              ) : (
                <><Copy className="w-3 h-3" /> {t.common.copy}</>
              )}
            </button>
          </div>
          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre leading-relaxed p-4 bg-gray-50">
            {snippets[lang]}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Code Snippets ─────────────────────────────────────────────────────────────

const SSO_SNIPPETS: Record<Lang, string> = {
  node: `const res = await fetch('https://surveyflowapp.com/api/sso/token', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nfk_sua_chave_aqui',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    surveyId: 'id_da_pesquisa',
    email: usuario.email,
    name: usuario.nome,
    profile: {
      specialty: usuario.especialidade,
      sector: usuario.setor,
      crm: usuario.crm,
    },
  }),
});
const { token } = await res.json();

// Redirecionar o usuário
res.redirect(\`https://surveyflowapp.com/survey/\${surveyId}?sso_token=\${token}\`);`,

  python: `import requests

res = requests.post(
    'https://surveyflowapp.com/api/sso/token',
    headers={
        'Authorization': 'Bearer nfk_sua_chave_aqui',
        'Content-Type': 'application/json',
    },
    json={
        'surveyId': 'id_da_pesquisa',
        'email': usuario['email'],
        'name': usuario['nome'],
        'profile': {
            'specialty': usuario['especialidade'],
            'sector': usuario['setor'],
            'crm': usuario['crm'],
        },
    },
)
token = res.json()['token']

# Redirecionar o usuário
redirect_url = f'https://surveyflowapp.com/survey/{survey_id}?sso_token={token}'`,

  php: `<?php
$ch = curl_init('https://surveyflowapp.com/api/sso/token');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer nfk_sua_chave_aqui',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode([
        'surveyId' => 'id_da_pesquisa',
        'email'    => $usuario['email'],
        'name'     => $usuario['nome'],
        'profile'  => [
            'specialty' => $usuario['especialidade'],
            'sector'    => $usuario['setor'],
            'crm'       => $usuario['crm'],
        ],
    ]),
]);
$token = json_decode(curl_exec($ch), true)['token'];
curl_close($ch);

// Redirecionar o usuário
header("Location: https://surveyflowapp.com/survey/{$surveyId}?sso_token={$token}");`,

  curl: `curl -X POST 'https://surveyflowapp.com/api/sso/token' \\
  -H 'Authorization: Bearer nfk_sua_chave_aqui' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "surveyId": "id_da_pesquisa",
    "email": "usuario@email.com",
    "name": "Nome do Usuário",
    "profile": { "specialty": "oncologia", "sector": "privado", "crm": "12345" }
  }'`,
};

const SYNC_SNIPPETS: Record<Lang, string> = {
  node: `await fetch('https://surveyflowapp.com/api/workspace/respondents/sync', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer nfk_sua_chave_aqui',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    respondents: [
      { email: 'dr@email.com', name: 'Dr. João',
        profile: { specialty: 'oncologia', sector: 'privado' } },
      // ... até 500 por requisição
    ],
  }),
});`,

  python: `import requests

requests.post(
    'https://surveyflowapp.com/api/workspace/respondents/sync',
    headers={'Authorization': 'Bearer nfk_sua_chave_aqui'},
    json={
        'respondents': [
            { 'email': 'dr@email.com', 'name': 'Dr. João',
              'profile': { 'specialty': 'oncologia', 'sector': 'privado' } },
            # ... até 500 por requisição
        ],
    },
)`,

  php: `<?php
$ch = curl_init('https://surveyflowapp.com/api/workspace/respondents/sync');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer nfk_sua_chave_aqui',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode([
        'respondents' => [
            [ 'email'   => 'dr@email.com', 'name' => 'Dr. João',
              'profile' => [ 'specialty' => 'oncologia', 'sector' => 'privado' ] ],
            // ... até 500 por requisição
        ],
    ]),
]);
curl_exec($ch);
curl_close($ch);`,

  curl: `curl -X POST 'https://surveyflowapp.com/api/workspace/respondents/sync' \\
  -H 'Authorization: Bearer nfk_sua_chave_aqui' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "respondents": [
      { "email": "dr@email.com", "name": "Dr. João",
        "profile": { "specialty": "oncologia", "sector": "privado" } }
    ]
  }'`,
};

// ─── API Reference ────────────────────────────────────────────────────────────

const METHOD_BADGE: Record<string, string> = {
  POST:   "bg-blue-100 text-blue-700",
  GET:    "bg-green-100 text-green-700",
  PATCH:  "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-600",
  PUT:    "bg-purple-100 text-purple-700",
};

function makeSnippets(
  template: Record<Lang, string>,
  apiKey: string,
): Record<Lang, string> {
  const result = {} as Record<Lang, string>;
  for (const lang of Object.keys(template) as Lang[]) {
    result[lang] = template[lang].replaceAll("nfk_sua_chave_aqui", apiKey);
  }
  return result;
}

function ApiEndpointCard({
  method,
  path,
  summary,
  description,
  snippets,
  response,
  footer,
}: {
  method: string;
  path: string;
  summary: string;
  description: string;
  snippets: Record<Lang, string>;
  response: string;
  footer?: React.ReactNode;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        <span className={`shrink-0 px-2 py-0.5 text-[11px] font-bold rounded-md ${METHOD_BADGE[method] ?? "bg-gray-100 text-gray-600"}`}>
          {method}
        </span>
        <code className="flex-1 text-xs text-gray-700 font-mono truncate">{path}</code>
        <span className="text-xs text-gray-400 hidden sm:block truncate max-w-[200px]">{summary}</span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          <p className="px-4 py-3 text-xs text-gray-500 leading-relaxed">{description}</p>

          <div className="px-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{t.integrations.apiRef.request}</p>
            <CodeExample title="" snippets={snippets} />
          </div>

          <div className="px-4 py-3 space-y-2">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{t.integrations.apiRef.response}</p>
            <pre className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-x-auto">
              {response}
            </pre>
          </div>

          {footer && (
            <div className="px-4 py-3">{footer}</div>
          )}
        </div>
      )}
    </div>
  );
}

function makePlatformSnippets(
  method: string,
  path: string,
  apiKey: string,
  body?: object,
): Record<Lang, string> {
  const url = `https://surveyflowapp.com${path}`;
  const hasBody = body !== undefined;
  const bodyJson = hasBody ? JSON.stringify(body, null, 2) : "";

  return {
    node: `const res = await fetch('${url}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer ${apiKey}',${hasBody ? "\n    'Content-Type': 'application/json'," : ""}
  },${hasBody ? `\n  body: JSON.stringify(${bodyJson}),` : ""}
});
const data = await res.json();`,

    python: `import requests

res = requests.${method.toLowerCase()}(
    '${url}',
    headers={'Authorization': f'Bearer ${apiKey}'},${hasBody ? `\n    json=${JSON.stringify(body)},` : ""}
)
data = res.json()`,

    php: `<?php
$ch = curl_init('${url}');
curl_setopt_array($ch, [
    CURLOPT_CUSTOMREQUEST  => '${method}',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ${apiKey}',${hasBody ? "\n        'Content-Type: application/json'," : ""}
    ],${hasBody ? `\n    CURLOPT_POSTFIELDS => '${JSON.stringify(body)}',` : ""}
]);
$data = json_decode(curl_exec($ch), true);
curl_close($ch);`,

    curl: `curl${method !== "GET" ? ` -X ${method}` : ""} '${url}' \\
  -H 'Authorization: Bearer ${apiKey}'${hasBody ? ` \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(body)}'` : ""}`,
  };
}

function EndpointGroup({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="px-1">
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="text-[11px] text-gray-400 font-mono mt-0.5">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function ApiReferenceSection({ apiKeyPrefix }: { apiKeyPrefix?: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(true);
  const key = apiKeyPrefix ?? "nfk_sua_chave_aqui";

  const ssoSnippets    = makeSnippets(SSO_SNIPPETS, key);
  const syncSnippets   = makeSnippets(SYNC_SNIPPETS, key);

  const schemaSnippets: Record<Lang, string> = {
    node:   `const res = await fetch('https://surveyflowapp.com/api/public/workspace/{userId}/profile-schema');\nconst { fields } = await res.json();`,
    python: `import requests\n\nres = requests.get('https://surveyflowapp.com/api/public/workspace/{userId}/profile-schema')\nfields = res.json()['fields']`,
    php:    `<?php\n$data = json_decode(file_get_contents(\n    'https://surveyflowapp.com/api/public/workspace/{userId}/profile-schema'\n), true);\n$fields = $data['fields'];`,
    curl:   `curl 'https://surveyflowapp.com/api/public/workspace/{userId}/profile-schema'`,
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <BookOpen className="w-4 h-4 text-gray-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{t.integrations.apiRef.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{t.integrations.apiRef.subtitle}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {!apiKeyPrefix && (
            <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {t.integrations.apiRef.noKeyHint}
            </div>
          )}

          <div className="p-4 space-y-6">

            {/* Group 1: SSO & Respondentes */}
            <EndpointGroup
              label={t.integrations.apiRef.groups.integration}
              desc={t.integrations.apiRef.groups.integrationDesc}
            >
              <ApiEndpointCard
                method="POST"
                path="/api/sso/token"
                summary={t.integrations.apiRef.endpoints.sso.summary}
                description={t.integrations.apiRef.endpoints.sso.description}
                snippets={ssoSnippets}
                response={`{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "expiresAt": "2026-04-18T15:00:00.000Z" }`}
                footer={
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{t.integrations.apiRef.redirectTo}</p>
                    <code className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 block">
                      {`https://surveyflowapp.com/survey/{surveyId}?sso_token={token}`}
                    </code>
                  </div>
                }
              />
              <ApiEndpointCard
                method="POST"
                path="/api/workspace/respondents/sync"
                summary={t.integrations.apiRef.endpoints.sync.summary}
                description={t.integrations.apiRef.endpoints.sync.description}
                snippets={syncSnippets}
                response={`{ "synced": 3, "failed": 0 }`}
              />
              <ApiEndpointCard
                method="GET"
                path="/api/public/workspace/{userId}/profile-schema"
                summary={t.integrations.apiRef.endpoints.schema.summary}
                description={t.integrations.apiRef.endpoints.schema.description}
                snippets={schemaSnippets}
                response={`{\n  "fields": [\n    { "key": "specialty", "label": "Especialidade", "type": "text" },\n    { "key": "crm",       "label": "CRM",            "type": "text" }\n  ]\n}`}
                footer={<p className="text-xs text-gray-400">{t.integrations.apiRef.noAuth}</p>}
              />
            </EndpointGroup>

            {/* Group 2: Plataforma */}
            <EndpointGroup
              label={t.integrations.apiRef.groups.platform}
              desc={t.integrations.apiRef.groups.platformDesc}
            >
              <ApiEndpointCard
                method="GET"
                path="/api/surveys"
                summary={t.integrations.apiRef.endpoints.surveys.summary}
                description={t.integrations.apiRef.endpoints.surveys.description}
                snippets={makePlatformSnippets("GET", "/api/surveys", key)}
                response={`{\n  "surveys": [\n    { "id": "abc123", "title": "Pesquisa de Satisfação", "status": "published", "responseCount": 42 }\n  ]\n}`}
              />
              <ApiEndpointCard
                method="GET"
                path="/api/surveys/{id}"
                summary={t.integrations.apiRef.endpoints.survey.summary}
                description={t.integrations.apiRef.endpoints.survey.description}
                snippets={makePlatformSnippets("GET", "/api/surveys/{id}", key)}
                response={`{ "survey": { "id": "abc123", "title": "...", "status": "published", "nodes": [...], "edges": [...] } }`}
              />
              <ApiEndpointCard
                method="GET"
                path="/api/surveys/{id}/responses"
                summary={t.integrations.apiRef.endpoints.responses.summary}
                description={t.integrations.apiRef.endpoints.responses.description}
                snippets={makePlatformSnippets("GET", "/api/surveys/{id}/responses", key)}
                response={`{\n  "responses": [\n    { "id": "r1", "respondentName": "Dr. João", "totalScore": 11, "completedAt": "2026-04-18T..." }\n  ]\n}`}
              />
              <ApiEndpointCard
                method="GET"
                path="/api/surveys/{id}/participations"
                summary={t.integrations.apiRef.endpoints.participations.summary}
                description={t.integrations.apiRef.endpoints.participations.description}
                snippets={makePlatformSnippets("GET", "/api/surveys/{id}/participations", key)}
                response={`{\n  "participations": [\n    { "id": "p1", "name": "Dr. João", "email": "dr@email.com", "bonusStatus": "pending", "profile": { "specialty": "oncologia" } }\n  ]\n}`}
                footer={<p className="text-xs text-gray-400">{t.integrations.apiRef.requiresRespondentsAddon}</p>}
              />
              <ApiEndpointCard
                method="PATCH"
                path="/api/surveys/{id}/participations/{participationId}"
                summary={t.integrations.apiRef.endpoints.updateParticipation.summary}
                description={t.integrations.apiRef.endpoints.updateParticipation.description}
                snippets={makePlatformSnippets("PATCH", "/api/surveys/{id}/participations/{participationId}", key, { bonusStatus: "released" })}
                response={`{ "success": true }`}
                footer={<p className="text-xs text-gray-400">{t.integrations.apiRef.requiresRespondentsAddon}</p>}
              />
            </EndpointGroup>

          </div>
        </div>
      )}
    </div>
  );
}

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
  const { t } = useI18n();
  const { data: session, update: updateSession } = useSession(); // updateSession força o JWT a reler o Firestore após confirmação
  const searchParams = useSearchParams();
  const addonSuccess = searchParams.get("addon_success") === "true";
  const [syncing, setSyncing] = useState(false);

  // Ao montar, compara Firestore com a sessão em cache — corrige JWT desatualizado
  useEffect(() => {
    const sync = async () => {
      try {
        const res = await fetch("/api/workspace/addons");
        if (!res.ok) return;
        const data = await res.json();
        const sessionAddons = session?.user?.addons ?? {};
        const firestoreDiffers =
          (data.addons?.respondents?.active === true && sessionAddons?.respondents?.active !== true) ||
          (data.addons?.surveyProgress?.active === true && sessionAddons?.surveyProgress?.active !== true);

        if (firestoreDiffers) {
          await updateSession();
          window.location.replace("/dashboard/settings/integrations");
        }
      } catch {
        // silently ignore
      }
    };

    if (session) sync();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!addonSuccess) return;

    setSyncing(true);
    let attempts = 0;

    const poll = async () => {
      try {
        const res = await fetch("/api/workspace/addons");
        if (res.ok) {
          const data = await res.json();
          const activated =
            data.addons?.respondents?.active === true ||
            data.addons?.surveyProgress?.active === true;

          if (activated) {
            await updateSession();
            window.location.replace("/dashboard/settings/integrations");
            return;
          }
        }
      } catch {
        // ignora erros de rede e tenta novamente
      }

      attempts++;
      if (attempts < 10) setTimeout(poll, 1500);
      else setSyncing(false);
    };

    setTimeout(poll, 1500);
  }, [addonSuccess]);

  const hasAddon = session?.user?.addons?.respondents?.active === true;
  const hasProgressAddon = session?.user?.addons?.surveyProgress?.active === true;

  const subscriptionStatus = session?.user?.subscriptionStatus;
  const trialEnd = session?.user?.trialEnd;
  const hasSubscription =
    subscriptionStatus === "active" ||
    subscriptionStatus === "trialing" ||
    (!!trialEnd && new Date(trialEnd).getTime() > Date.now());

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
    if (!confirm(t.integrations.apiKeys.revokeConfirm)) return;
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
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t.integrations.back}
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">{t.integrations.title}</h1>
        <p className="text-sm text-gray-500 mt-1">{t.integrations.subtitle}</p>
      </div>

      {addonSuccess && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          {syncing ? (
            <Loader2 className="w-4 h-4 shrink-0 animate-spin text-green-600" />
          ) : (
            <Check className="w-4 h-4 shrink-0" />
          )}
          {syncing ? t.integrations.syncing : t.integrations.addonActivated}
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
                <h2 className="text-sm font-semibold text-gray-900">{t.integrations.respondentsAddon.name}</h2>
                {hasAddon ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">{t.integrations.respondentsAddon.active}</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">{t.integrations.respondentsAddon.inactive}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {t.integrations.respondentsAddon.description}
              </p>
            </div>
          </div>

          {!hasAddon && (
            hasSubscription ? (
              <button
                onClick={handleActivateAddon}
                disabled={activating}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {activating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {t.integrations.respondentsAddon.activate}
              </button>
            ) : (
              <Link
                href="/dashboard/settings?require_plan=true&addon=respondents"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.integrations.respondentsAddon.requiresSubscription}
              </Link>
            )
          )}
        </div>

        {!hasAddon && (
          <div className="px-5 pb-5 space-y-2">
            {(t.integrations.respondentsAddon.features as readonly string[]).map((feature) => (
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
                <h2 className="text-sm font-semibold text-gray-900">{t.integrations.progressAddon.name}</h2>
                {hasProgressAddon ? (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">{t.integrations.progressAddon.active}</span>
                ) : (
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">{t.integrations.progressAddon.inactive}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                {t.integrations.progressAddon.description}
              </p>
            </div>
          </div>

          {!hasProgressAddon && (
            hasSubscription ? (
              <button
                onClick={handleActivateProgressAddon}
                disabled={activatingProgress}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {activatingProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {t.integrations.progressAddon.activate}
              </button>
            ) : (
              <Link
                href="/dashboard/settings?require_plan=true&addon=surveyProgress"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {t.integrations.progressAddon.requiresSubscription}
              </Link>
            )
          )}
        </div>

        <div className="px-5 pb-5 space-y-2">
          {(t.integrations.progressAddon.features as readonly string[]).map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-gray-500">
              {hasProgressAddon
                ? <Check className="w-3 h-3 text-green-500 shrink-0" />
                : <Lock className="w-3 h-3 text-gray-300 shrink-0" />}
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* API Keys section */}
      {hasAddon && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{t.integrations.apiKeys.title}</h2>
              <p className="text-xs text-gray-500">{t.integrations.apiKeys.subtitle}</p>
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
                {t.integrations.apiKeys.newKey}
              </button>
            </div>
          </div>

          {showCreate && (
            <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <input
                autoFocus
                type="text"
                placeholder={t.integrations.apiKeys.namePlaceholder}
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
                {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.integrations.apiKeys.create}
              </button>
              <button onClick={() => setShowCreate(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">
                {t.common.cancel}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">
              {t.integrations.apiKeys.empty}
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
                      {t.integrations.apiKeys.copyNow}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{t.integrations.apiKeys.createdAt} {formatDate(key.createdAt)}</span>
                    {key.lastUsedAt && <span>· {t.integrations.apiKeys.lastUsed} {formatDate(key.lastUsedAt)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Profile Schema */}
          <div className="border border-gray-200 rounded-xl p-5">
            <ProfileSchemaEditor />
          </div>

          {/* API Reference */}
          <ApiReferenceSection apiKeyPrefix={keys[0]?.keyPrefix} />
        </div>
      )}
    </div>
  );
}
