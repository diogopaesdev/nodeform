"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  Check,
  Lock,
  KeyRound,
  ListTree,
  LogIn,
  RefreshCw,
  Filter,
  Gift,
  AlertTriangle,
  ShieldCheck,
  CheckSquare,
  HelpCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

const BASE_URL = "https://surveyflowapp.com";

// ─── Reusable building blocks ──────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[11px] text-gray-400 hover:text-gray-200 bg-gray-800/80 rounded-md transition-colors"
      >
        {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      </button>
      <pre className="text-xs text-gray-100 bg-gray-900 rounded-xl p-4 overflow-x-auto whitespace-pre leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function Step({
  index,
  icon: Icon,
  title,
  children,
}: {
  index: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="scroll-mt-6" id={`step-${index}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center shrink-0 text-sm font-semibold">
          {index}
        </div>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-400" />
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="pl-11 space-y-3 text-sm text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

function Callout({
  variant = "info",
  children,
}: {
  variant?: "info" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    variant === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-800"
      : "bg-blue-50 border-blue-200 text-blue-800";
  return (
    <div className={`flex gap-2 p-3 border rounded-xl text-xs leading-relaxed ${styles}`}>
      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function IntegrationDocsPage() {
  const { t, locale } = useI18n();
  const { data: session } = useSession();

  const isEn = locale === "en";
  const workspaceId = session?.user?.id ?? "{workspaceId}";
  const isEnterprise = session?.user?.planId === "enterprise";
  const hasAddon = isEnterprise || session?.user?.addons?.respondents?.active === true;

  // Locked state — guide is only meaningful with the Respondents module active
  if (session && !hasAddon) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Link
          href="/dashboard/settings/integrations"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-6 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t.integrations.title}
        </Link>
        <div className="border border-gray-200 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <h1 className="text-base font-semibold text-gray-900">
            {isEn ? "Activate the Respondents Module" : "Ative o Módulo Respondentes"}
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
            {isEn
              ? "This integration guide becomes available once the Respondents Module is active on your workspace."
              : "Este guia de integração fica disponível assim que o Módulo Respondentes estiver ativo no seu workspace."}
          </p>
          <Link
            href="/dashboard/settings/integrations"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {isEn ? "Go to Integrations" : "Ir para Integrações"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/settings/integrations"
          className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-4 transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t.integrations.title}
        </Link>
        <h1 className="text-xl font-bold text-gray-900">
          {isEn ? "Integration guide" : "Guia de integração"}
        </h1>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">
          {isEn
            ? "Connect your platform to SurveyFlow so your already-logged-in users reach surveys without a second login. Follow the steps below in order."
            : "Conecte sua plataforma ao SurveyFlow para que seus usuários já logados cheguem às pesquisas sem um segundo login. Siga os passos abaixo na ordem."}
        </p>
      </div>

      {/* Overview / architecture */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {isEn ? "How it works" : "Como funciona"}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {isEn
            ? "Your backend authenticates the user (you already do this). When they open a survey, your backend asks SurveyFlow for a one-time SSO token and redirects the browser to the survey carrying that token. SurveyFlow validates it, creates the respondent session and shows the survey — no login screen."
            : "Seu backend autentica o usuário (você já faz isso). Quando ele abre uma pesquisa, seu backend pede ao SurveyFlow um token SSO de uso único e redireciona o navegador para a pesquisa com esse token. O SurveyFlow valida, cria a sessão do respondente e exibe a pesquisa — sem tela de login."}
        </p>
        <CodeBlock
          code={`${isEn ? "Your platform" : "Sua plataforma"} (backend)        SurveyFlow
      |                                |
      | 1. POST /api/sso/token  ───────>|  (Authorization: Bearer nfk_...)
      |                                |
      | <─── { token, expiresAt } ─────|  ${isEn ? "one-time, 5 min" : "uso único, 5 min"}
      |                                |
      | 2. 302 redirect browser ───────────────────────>  GET /survey/{id}?sso_token=...
                                                            ${isEn ? "respondent answers" : "respondente responde"}`}
        />
        <Callout>
          {isEn
            ? "The respondent never creates a SurveyFlow account. They exist only inside your workspace, identified by e-mail."
            : "O respondente nunca cria conta no SurveyFlow. Ele existe apenas dentro do seu workspace, identificado pelo e-mail."}
        </Callout>
      </section>

      {/* Step 1 — API key */}
      <Step index={1} icon={KeyRound} title={isEn ? "Create an API key" : "Crie uma API key"}>
        <p>
          {isEn
            ? "In Integrations, click “New key”, give it a name (e.g. “Production”) and copy it immediately — the full key is shown only once. Store it as an environment variable on your server."
            : "Em Integrações, clique em “Nova chave”, dê um nome (ex.: “Produção”) e copie imediatamente — a chave completa só aparece uma vez. Guarde como variável de ambiente no seu servidor."}
        </p>
        <CodeBlock code={`SURVEYFLOW_API_KEY=nfk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`} />
        <Callout variant="warning">
          {isEn
            ? "The API key is server-to-server only. Never expose it in frontend code, mobile apps or public repositories. To revoke a leaked key, delete it in Integrations — it stops working immediately."
            : "A API key é exclusivamente server-to-server. Nunca exponha no frontend, apps mobile ou repositórios públicos. Para revogar uma chave vazada, exclua em Integrações — ela para de funcionar na hora."}
        </Callout>
      </Step>

      {/* Step 2 — Profile schema */}
      <Step index={2} icon={ListTree} title={isEn ? "Define your profile schema" : "Defina seu profile schema"}>
        <p>
          {isEn
            ? "In Integrations, use the Profile Schema editor to declare the respondent fields you'll send (e.g. specialty, sector, crm). These field keys are what eligibility rules match against. Your public schema can be read at:"
            : "Em Integrações, use o editor de Profile Schema para declarar os campos do respondente que você vai enviar (ex.: specialty, sector, crm). Essas chaves são o que as regras de elegibilidade comparam. Seu schema público pode ser lido em:"}
        </p>
        <CodeBlock code={`GET ${BASE_URL}/api/public/workspace/${workspaceId}/profile-schema`} />
      </Step>

      {/* Step 3 — SSO */}
      <Step index={3} icon={LogIn} title={isEn ? "Generate the SSO token and redirect" : "Gere o token SSO e redirecione"}>
        <p>
          {isEn
            ? "From your backend, when a logged-in user opens a survey, request a token and redirect them. The profile you send is upserted automatically — no separate sync needed for this user."
            : "No seu backend, quando um usuário logado abre uma pesquisa, peça um token e redirecione. O profile enviado é gravado/atualizado automaticamente — sem sync separado para esse usuário."}
        </p>
        <CodeBlock
          code={`// Node.js
app.get("/survey/:surveyId", requireAuth, async (req, res) => {
  const user = req.user; // ${isEn ? "logged-in on your platform" : "logado na sua plataforma"}

  const r = await fetch("${BASE_URL}/api/sso/token", {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${process.env.SURVEYFLOW_API_KEY}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      surveyId: req.params.surveyId,
      email: user.email,
      name: user.fullName,
      profile: { specialty: user.specialty, sector: user.sector, crm: user.crm },
    }),
  });

  if (!r.ok) return res.status(500).send("${isEn ? "Could not start survey" : "Não foi possível iniciar a pesquisa"}");

  const { token } = await r.json();
  res.redirect(\`${BASE_URL}/survey/\${req.params.surveyId}?sso_token=\${token}\`);
});`}
        />
        <p className="text-xs text-gray-500">
          {isEn ? "Or with cURL:" : "Ou com cURL:"}
        </p>
        <CodeBlock
          code={`curl -X POST '${BASE_URL}/api/sso/token' \\
  -H 'Authorization: Bearer nfk_sua_chave_aqui' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "surveyId": "abc123",
    "email": "user@email.com",
    "name": "${isEn ? "Full Name" : "Nome Completo"}",
    "profile": { "specialty": "oncologia", "sector": "privado", "crm": "SP-123456" }
  }'

# → { "token": "a1b2c3...", "expiresAt": "2026-06-16T15:05:00.000Z" }`}
        />
        <Callout variant="warning">
          {isEn
            ? "The token expires in 5 minutes and is single-use. If it expires before the user clicks, SurveyFlow falls back to the e-mail OTP login screen — the flow still works, just not seamless."
            : "O token expira em 5 minutos e é de uso único. Se expirar antes do clique, o SurveyFlow cai na tela de login por OTP via e-mail — o fluxo continua funcionando, só não é seamless."}
        </Callout>
      </Step>

      {/* Embed / iframe */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-900">
          {isEn ? "Embedding surveys in your platform (iframe)" : "Incorporando pesquisas na sua plataforma (iframe)"}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {isEn
            ? "If you want the survey to appear inside your own page without any redirect, embed it in an iframe. Add ?embed=true to the survey URL — this hides the header and enables cross-origin cookie support so SSO works correctly inside the iframe."
            : "Se você quer que a pesquisa apareça dentro da sua própria página sem nenhum redirect, incorpore-a num iframe. Adicione ?embed=true à URL da pesquisa — isso oculta o cabeçalho e habilita o suporte a cookie cross-origin para que o SSO funcione corretamente dentro do iframe."}
        </p>
        <CodeBlock
          code={`// ${isEn ? "1. Backend: generate the SSO token as usual, then build the embed URL" : "1. Backend: gere o token SSO normalmente, depois monte a URL do embed"}
const { token } = await r.json();
const embedUrl = \`${BASE_URL}/survey/\${surveyId}?sso_token=\${token}&embed=true\`;

// ${isEn ? "2. Frontend: render the iframe" : "2. Frontend: renderize o iframe"}
<iframe
  src={embedUrl}
  style={{ width: "100%", height: "600px", border: "none" }}
  allow="clipboard-write"
/>`}
        />
        <Callout variant="warning">
          {isEn
            ? "The embed iframe requires HTTPS on both sides. The cross-origin cookie (SameSite=None; Secure) will not be set over plain HTTP, so SSO won't work on localhost without HTTPS. For local testing, use a tunnel (e.g. ngrok) or test in production."
            : "O iframe de embed exige HTTPS nos dois lados. O cookie cross-origin (SameSite=None; Secure) não é aceito em HTTP simples, então o SSO não funciona em localhost sem HTTPS. Para testes locais, use um túnel (ex.: ngrok) ou teste em produção."}
        </Callout>
      </section>

      {/* Step 4 — Sync */}
      <Step index={4} icon={RefreshCw} title={isEn ? "Keep profiles in sync (optional)" : "Mantenha os perfis sincronizados (opcional)"}>
        <p>
          {isEn
            ? "When a user's data changes on your side (e.g. they move from public to private sector), push updates without requiring them to open a survey. Up to 500 respondents per request."
            : "Quando os dados de um usuário mudam do seu lado (ex.: muda do setor público para o privado), envie atualizações sem exigir que ele abra uma pesquisa. Até 500 respondentes por requisição."}
        </p>
        <CodeBlock
          code={`curl -X POST '${BASE_URL}/api/workspace/respondents/sync' \\
  -H 'Authorization: Bearer nfk_sua_chave_aqui' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "respondents": [
      { "email": "dr@email.com", "name": "Dr. João",
        "profile": { "specialty": "oncologia", "sector": "privado" } }
    ]
  }'

# → { "synced": 1, "failed": 0 }`}
        />
      </Step>

      {/* Step 5 — Eligibility */}
      <Step index={5} icon={Filter} title={isEn ? "Control who can answer" : "Controle quem pode responder"}>
        <p>
          {isEn
            ? "Eligibility rules are set in the survey editor and matched against the profile you send. They work at two levels:"
            : "As regras de elegibilidade são configuradas no editor da pesquisa e comparadas com o profile que você envia. Funcionam em dois níveis:"}
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>{isEn ? "Survey level" : "Nível da pesquisa"}</strong> — {isEn
              ? "ineligible respondents are blocked entirely (they see an “out of profile” screen)."
              : "respondentes inelegíveis são bloqueados por completo (veem uma tela de “fora do perfil”)."}
          </li>
          <li>
            <strong>{isEn ? "Question level" : "Nível da questão"}</strong> — {isEn
              ? "individual questions are auto-skipped at runtime if the profile doesn't match."
              : "questões individuais são puladas automaticamente no runtime se o perfil não bater."}
          </li>
        </ul>
        <p>
          {isEn
            ? "Operators: equals, not_equals, in, not_in, exists, not_exists. All rules use AND logic. The field keys must match the keys you send in profile."
            : "Operadores: equals, not_equals, in, not_in, exists, not_exists. Todas as regras usam lógica AND. As chaves dos campos devem corresponder às que você envia no profile."}
        </p>
      </Step>

      {/* Step 6 — Participations & bonus */}
      <Step index={6} icon={Gift} title={isEn ? "Read participations and release bonuses" : "Leia participações e libere bonificações"}>
        <p>
          {isEn
            ? "Once people answer, pull participations to reconcile with your platform and release any reward. Each respondent can only participate once."
            : "Depois que as pessoas respondem, busque as participações para conciliar com sua plataforma e liberar a bonificação. Cada respondente só participa uma vez."}
        </p>
        <CodeBlock
          code={`# ${isEn ? "List participations" : "Listar participações"}
curl '${BASE_URL}/api/surveys/{surveyId}/participations' \\
  -H 'Authorization: Bearer nfk_sua_chave_aqui'

# ${isEn ? "Mark a bonus as released" : "Marcar bonificação como liberada"}
curl -X PATCH '${BASE_URL}/api/surveys/{surveyId}/participations/{participationId}' \\
  -H 'Authorization: Bearer nfk_sua_chave_aqui' \\
  -H 'Content-Type: application/json' \\
  -d '{ "bonusStatus": "released" }'`}
        />
      </Step>

      {/* Errors */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">{isEn ? "Error responses" : "Respostas de erro"}</h2>
        </div>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">{isEn ? "Code" : "Código"}</th>
                <th className="text-left px-3 py-2 font-semibold">{isEn ? "Meaning" : "Significado"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              <tr><td className="px-3 py-2 font-mono">401</td><td className="px-3 py-2">{isEn ? "Missing or invalid API key" : "API key ausente ou inválida"}</td></tr>
              <tr><td className="px-3 py-2 font-mono">403</td><td className="px-3 py-2">{isEn ? "Respondents Module not active" : "Módulo Respondentes não ativo"}</td></tr>
              <tr><td className="px-3 py-2 font-mono">404</td><td className="px-3 py-2">{isEn ? "Survey not found or not in this workspace" : "Pesquisa não encontrada ou fora deste workspace"}</td></tr>
              <tr><td className="px-3 py-2 font-mono">400</td><td className="px-3 py-2">{isEn ? "Invalid payload (bad e-mail, missing fields)" : "Payload inválido (e-mail malformado, campos faltando)"}</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Security */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">{isEn ? "Security" : "Segurança"}</h2>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>{isEn ? "Call /api/sso/token and /sync only from your backend." : "Chame /api/sso/token e /sync apenas pelo seu backend."}</li>
          <li>{isEn ? "Store the API key in environment variables, never in version control." : "Guarde a API key em variáveis de ambiente, nunca no controle de versão."}</li>
          <li>{isEn ? "Use one key per environment (dev/staging/prod) so you can revoke independently." : "Use uma chave por ambiente (dev/staging/prod) para poder revogar de forma independente."}</li>
          <li>{isEn ? "Never reuse or store SSO tokens — generate a fresh one per access." : "Nunca reutilize ou armazene tokens SSO — gere um novo a cada acesso."}</li>
        </ul>
      </section>

      {/* Checklist */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">{isEn ? "Go-live checklist" : "Checklist para produção"}</h2>
        </div>
        <ul className="space-y-1.5 text-sm text-gray-600">
          {(isEn
            ? [
                "Respondents Module active on the workspace",
                "API key generated and stored as an env var in production",
                "Profile schema defined matching the fields you send",
                "Backend route generating the SSO token and redirecting",
                "Tested a full flow with a real user",
                "Verified expired-token fallback (OTP login)",
                "Verified a respondent can't answer twice",
                "If using iframe embed: HTTPS on both sides and ?embed=true in the URL",
              ]
            : [
                "Módulo Respondentes ativo no workspace",
                "API key gerada e guardada como env var em produção",
                "Profile schema definido conforme os campos que você envia",
                "Rota backend gerando o token SSO e redirecionando",
                "Fluxo completo testado com um usuário real",
                "Fallback de token expirado verificado (login por OTP)",
                "Verificado que um respondente não responde duas vezes",
                "Se usando iframe embed: HTTPS nos dois lados e ?embed=true na URL",
              ]
          ).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="w-4 h-4 mt-0.5 rounded border border-gray-300 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-900">FAQ</h2>
        </div>
        <div className="space-y-3 text-sm">
          {(isEn
            ? [
                ["Does the respondent need a SurveyFlow account?", "No. They exist only inside your workspace, identified by e-mail."],
                ["What if the SSO token expires before the click?", "SurveyFlow shows the e-mail OTP login. The user enters their e-mail, gets a 6-digit code and accesses normally."],
                ["Can someone answer the same survey twice?", "No. Participation is bound to the respondent — any second attempt shows a “you already participated” screen."],
                ["Is the profile field required?", "Optional but recommended — it powers eligibility rules. Without it the respondent only has name and e-mail."],
                ["Can I embed the survey in an iframe?", "Yes. Add ?embed=true to the survey URL alongside the SSO token. This enables cross-origin cookie support (SameSite=None; Secure). Requires HTTPS on both sides — it won't work over plain HTTP."],
              ]
            : [
                ["O respondente precisa de conta no SurveyFlow?", "Não. Ele existe apenas dentro do seu workspace, identificado pelo e-mail."],
                ["E se o token SSO expirar antes do clique?", "O SurveyFlow exibe o login por OTP via e-mail. O usuário digita o e-mail, recebe um código de 6 dígitos e acessa normalmente."],
                ["Alguém pode responder a mesma pesquisa duas vezes?", "Não. A participação é vinculada ao respondente — qualquer nova tentativa mostra uma tela de “você já participou”."],
                ["O campo profile é obrigatório?", "Opcional, mas recomendado — é o que alimenta as regras de elegibilidade. Sem ele o respondente tem apenas nome e e-mail."],
                ["Posso incorporar a pesquisa num iframe?", "Sim. Adicione ?embed=true à URL da pesquisa junto com o token SSO. Isso habilita o suporte a cookie cross-origin (SameSite=None; Secure). Exige HTTPS nos dois lados — não funciona em HTTP simples."],
              ]
          ).map(([q, a]) => (
            <div key={q}>
              <p className="font-medium text-gray-800">{q}</p>
              <p className="text-gray-600 mt-0.5 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer link to API reference */}
      <div className="border-t border-gray-100 pt-6">
        <Link
          href="/dashboard/settings/integrations"
          className="text-xs text-gray-500 hover:text-gray-800 underline underline-offset-2"
        >
          {isEn
            ? "See the full endpoint reference in Integrations →"
            : "Veja a referência completa de endpoints em Integrações →"}
        </Link>
      </div>
    </div>
  );
}
