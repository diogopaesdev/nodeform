"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  Loader2, ArrowRight, Check, GitBranch, BarChart2,
  Share2, Clock, Zap, Shield, Users, TrendingUp,
} from "lucide-react";

// ─── Flow Mockup ──────────────────────────────────────────────────────────────

// Posições dos nós (left, top) e dimensões calculadas:
//
// N1 Apresentação : left=40,  top=90,  w=224, h≈132 → handle-right x=264, y=156
// N2 Escolha      : left=364, top=110, w=240, h≈184 → handle-left  x=364, y=202
//                   opt1 handle-right x=604, y=202+14=... calculado abaixo
//                   header(44)+title(24)+mt(8)+opt1-center(14) = 90 → y=110+90=200
//                   opt2-center: y=200+34=234  opt3-center: y=234+34=268
// N3 Avaliação    : left=620, top=250, w=208, h≈128 → handle-left  x=620, y=314
// N4 Tela Final   : left=620, top=65,  w=192, h≈92  → handle-left  x=620, y=111

function FlowMockup() {
  // Handle positions (center de cada círculo)
  const n1Right  = { x: 264, y: 156 }  // Apresentação → saída
  const n2Left   = { x: 300, y: 202 }  // Escolha ← entrada
  const n2Opt1   = { x: 540, y: 200 }  // Escolha opt1 → saída
  const n2Opt2   = { x: 540, y: 234 }  // Escolha opt2 → saída
  const n2Opt3   = { x: 540, y: 268 }  // Escolha opt3 → saída
  const n3Left   = { x: 620, y: 314 }  // Avaliação ← entrada
  const n4Left   = { x: 620, y: 111 }  // Tela Final ← entrada

  const curve = (a: {x:number,y:number}, b: {x:number,y:number}) => {
    const cx = (a.x + b.x) / 2
    return `M ${a.x} ${a.y} C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`
  }

  return (
    <div className="relative w-full h-[400px] select-none pointer-events-none overflow-hidden"
      style={{
        backgroundImage: "radial-gradient(circle, #e5e7eb 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
    >
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
        {/* Apresentação → Escolha */}
        <path d={curve(n1Right, n2Left)} fill="none" stroke="#d1d5db" strokeWidth="2" />
        {/* opt1 → Tela Final */}
        <path d={curve(n2Opt1, n4Left)} fill="none" stroke="#d1d5db" strokeWidth="2" />
        {/* opt2 → Avaliação */}
        <path d={curve(n2Opt2, n3Left)} fill="none" stroke="#d1d5db" strokeWidth="2" />
        {/* opt3 → Avaliação */}
        <path d={curve(n2Opt3, n3Left)} fill="none" stroke="#d1d5db" strokeWidth="2" />

        {/* Handle dots — sobrepõem as linhas */}
        <circle cx={n1Right.x}  cy={n1Right.y}  r="5" fill="white" stroke="#f97316" strokeWidth="2" />
        <circle cx={n2Left.x}   cy={n2Left.y}   r="5" fill="white" stroke="#3b82f6" strokeWidth="2" />
        <circle cx={n2Opt1.x}   cy={n2Opt1.y}   r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
        <circle cx={n2Opt2.x}   cy={n2Opt2.y}   r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
        <circle cx={n2Opt3.x}   cy={n2Opt3.y}   r="4" fill="white" stroke="#3b82f6" strokeWidth="2" />
        <circle cx={n3Left.x}   cy={n3Left.y}   r="5" fill="white" stroke="#a855f7" strokeWidth="2" />
        <circle cx={n4Left.x}   cy={n4Left.y}   r="5" fill="white" stroke="#ef4444" strokeWidth="2" />
      </svg>

      {/* Node: Apresentação — left=40 top=90 w=224 h≈132 → handle-right y=156 */}
      <div className="absolute bg-white rounded-2xl shadow-sm border-2 border-orange-400 w-56" style={{ left: 40, top: 90, zIndex: 1 }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5 3.5l7 4.5-7 4.5V3.5z"/>
            </svg>
          </div>
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Apresentação</span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-sm font-bold text-gray-900">Bem-vindo à Pesquisa</p>
          <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">Esta pesquisa leva apenas alguns minutos.</p>
        </div>
        <div className="px-3 pb-3 mt-2">
          <div className="w-full h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-[11px] font-semibold text-white">Iniciar Pesquisa</span>
          </div>
        </div>
      </div>

      {/* Node: Escolha Simples — left=300 top=110 w=240 */}
      <div className="absolute bg-white rounded-2xl shadow-sm border border-gray-200 w-60" style={{ left: 300, top: 110, zIndex: 1 }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full border-2 border-blue-400" />
          </div>
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Escolha Simples</span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-sm font-bold text-gray-900">Como nos conheceu?</p>
        </div>
        <div className="px-3 pb-3 mt-2 space-y-1.5">
          {["Indicação de amigo", "Redes sociais", "Google"].map((opt, i) => (
            <div key={i} className="relative flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-3 h-3 rounded-full border-2 border-blue-300 flex-shrink-0" />
              <span className="text-[11px] text-gray-600">{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Node: Avaliação — left=620 top=250 w=208 h≈128 → handle-left y=314 */}
      <div className="absolute bg-white rounded-2xl shadow-sm border border-gray-200 w-52" style={{ left: 620, top: 250, zIndex: 1 }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Avaliação</span>
        </div>
        <div className="px-3 pb-1">
          <p className="text-sm font-bold text-gray-900">Como foi sua experiência?</p>
        </div>
        <div className="px-3 pb-3 mt-2">
          <div className="flex gap-1">
            {[1,2,3,4,5].map((n) => (
              <div key={n} className={`flex-1 h-7 rounded-lg border text-[10px] flex items-center justify-center font-bold ${n <= 4 ? "bg-purple-500 border-purple-500 text-white" : "bg-white border-gray-200 text-gray-400"}`}>
                {n}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-gray-400">Ruim</span>
            <span className="text-[9px] text-gray-400">Ótimo</span>
          </div>
        </div>
      </div>

      {/* Node: Tela Final — left=620 top=65 w=192 h≈92 → handle-left y=111 */}
      <div className="absolute bg-white rounded-2xl shadow-sm border border-gray-200 w-48" style={{ left: 620, top: 65, zIndex: 1 }}>
        <div className="px-3 pt-3 pb-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400" />
          </div>
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Tela Final</span>
        </div>
        <div className="px-3 pb-3">
          <p className="text-sm font-bold text-gray-900">Obrigado! 🎉</p>
          <p className="text-[11px] text-gray-400 mt-1">Sua resposta foi registrada com sucesso.</p>
        </div>
      </div>

      {/* Gradient edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white to-transparent" style={{ zIndex: 3 }} />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" style={{ zIndex: 3 }} />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" style={{ zIndex: 3 }} />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: GitBranch,
    color: "bg-blue-50 text-blue-600",
    title: "Fluxo condicional",
    description: "Cada resposta leva o usuário por um caminho diferente. Crie jornadas personalizadas arrastando e conectando nós no canvas.",
  },
  {
    icon: TrendingUp,
    color: "bg-green-50 text-green-600",
    title: "Pontuação automática",
    description: "Atribua pontos a cada opção e calcule o score final do respondente. Ideal para quizzes, testes e diagnósticos.",
  },
  {
    icon: BarChart2,
    color: "bg-purple-50 text-purple-600",
    title: "Dashboard de resultados",
    description: "Visualize todas as respostas com métricas detalhadas. Exporte os dados e acompanhe o desempenho em tempo real.",
  },
  {
    icon: Share2,
    color: "bg-orange-50 text-orange-600",
    title: "Compartilhamento e embed",
    description: "Publique via link direto ou incorpore como iframe em qualquer site com redimensionamento automático.",
  },
  {
    icon: Clock,
    color: "bg-amber-50 text-amber-600",
    title: "Tempo limite e prêmios",
    description: "Defina um tempo máximo e um prêmio para incentivar respostas rápidas e aumentar a taxa de conclusão.",
  },
  {
    icon: Shield,
    color: "bg-red-50 text-red-600",
    title: "Coleta de dados do respondente",
    description: "Capture nome, e-mail e aceite de termos diretamente no nó de apresentação, sem precisar de formulários externos.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Arraste os nós", description: "Escolha entre Apresentação, Escolha Simples, Múltipla Escolha, Avaliação ou Tela Final." },
  { step: "02", title: "Conecte as perguntas", description: "Ligue as respostas às próximas perguntas criando fluxos condicionais inteligentes." },
  { step: "03", title: "Publique e compartilhe", description: "Copie o link ou embed e comece a receber respostas em segundos." },
];

const PLAN_FEATURES: { label: string; soon?: boolean }[] = [
  { label: "Pesquisas ilimitadas" },
  { label: "Respostas ilimitadas" },
  { label: "Editor visual node-based" },
  { label: "Fluxo condicional por resposta" },
  { label: "Sistema de pontuação" },
  { label: "Dashboard de resultados" },
  { label: "Exportação de dados" },
  { label: "Embed em qualquer site" },
  { label: "Coleta de nome e e-mail" },
  { label: "Suporte prioritário" },
  { label: "Temas personalizados", soon: true },
  { label: "Criação de pesquisas com IA", soon: true },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="19" width="18" height="10" rx="3" fill="white"/>
                <rect x="28" y="8" width="17" height="10" rx="3" fill="white"/>
                <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55"/>
                <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7"/>
                <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
                <circle cx="21" cy="24" r="3" fill="white"/>
                <circle cx="28" cy="13" r="2.5" fill="white"/>
                <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55"/>
              </svg>
            </div>
            <span className="text-sm font-bold">SurveyFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="#pricing" className="text-sm text-gray-500 hover:text-gray-900 transition-colors hidden sm:block">
              Preços
            </Link>
            <button
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
            >
              Entrar <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-500 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
          7 dias grátis · Sem cartão de crédito
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight mb-4">
          Crie pesquisas com{" "}
          <span className="text-gray-400">fluxo inteligente</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 max-w-lg mx-auto mb-7 px-2">
          Editor visual node-based onde cada resposta guia o usuário por um caminho diferente.
          Sem código. Publique em segundos.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Começar grátis com Google
          </button>
          <Link href="#pricing" className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors">
            Ver preços
          </Link>
        </div>
      </section>

      {/* Flow mockup */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Editor header mockup */}
          <div className="h-11 bg-white border-b border-gray-100 flex items-center justify-between px-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gray-100 flex-shrink-0" />
              <div className="h-3 w-20 sm:w-28 bg-gray-100 rounded" />
              <div className="h-5 w-14 sm:w-16 bg-gray-100 rounded-full hidden xs:block" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-14 sm:w-16 bg-gray-100 rounded-md hidden sm:block" />
              <div className="h-6 w-14 sm:w-16 bg-orange-500 rounded-md" />
            </div>
          </div>
          <div className="flex">
            {/* Sidebar mockup — só aparece em sm+ */}
            <div className="w-44 border-r border-gray-100 p-3 space-y-1.5 hidden sm:block flex-shrink-0">
              <p className="text-[10px] font-semibold text-gray-400 px-1 mb-2">Perguntas</p>
              {[
                { label: "Apresentação", color: "bg-orange-100 text-orange-500" },
                { label: "Escolha Simples", color: "bg-blue-100 text-blue-500" },
                { label: "Múltipla Escolha", color: "bg-green-100 text-green-500" },
                { label: "Avaliação", color: "bg-purple-100 text-purple-500" },
                { label: "Tela Final", color: "bg-red-100 text-red-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <div className="w-2 h-2 rounded-sm bg-current opacity-60" />
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            {/* Canvas — scrollável no mobile */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
              <div className="min-w-[700px]">
                <FlowMockup />
              </div>
            </div>
          </div>
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-2 sm:hidden">← Deslize para ver o fluxo completo</p>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Como funciona</h2>
          <p className="text-sm text-gray-500">Da criação à publicação em menos de 5 minutos</p>
        </div>
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-0 sm:gap-6">
          {HOW_IT_WORKS.map((item, i) => (
            <div key={item.step} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 sm:text-center">
              <div className="flex flex-col items-center sm:mb-3">
                <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="w-px h-8 bg-gray-200 sm:hidden mt-1" />
                )}
              </div>
              <div className="pb-6 sm:pb-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Recursos que fazem a diferença</h2>
            <p className="text-sm text-gray-500">Tudo que uma pesquisa moderna precisa</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex sm:block gap-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 sm:mb-3 ${f.color}`}>
                  <f.icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-2">Para quem é o SurveyFlow?</h2>
          <p className="text-sm text-gray-500">Qualquer negócio que precisa coletar dados com inteligência</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { icon: Users, title: "Pesquisa de satisfação", description: "Entenda a experiência dos seus clientes com fluxos personalizados por segmento ou produto." },
            { icon: Zap, title: "Quiz e diagnóstico", description: "Calcule pontuações, classifique perfis e entregue resultados personalizados ao final." },
            { icon: TrendingUp, title: "Qualificação de leads", description: "Direcione cada lead para o caminho certo com base nas respostas e capture os dados de contato." },
            { icon: GitBranch, title: "Formulários complexos", description: "Substitua formulários lineares por fluxos condicionais que mostram só o que é relevante para cada usuário." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white border border-gray-200 rounded-xl">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Preço único e transparente</h2>
            <p className="text-sm text-gray-500">Sem planos confusos. Acesso completo desde o primeiro dia.</p>
          </div>
          <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-5 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-lg font-bold text-gray-900">Plano Pro</span>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[11px] text-green-600 font-medium bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      7 dias grátis
                    </span>
                    <span className="text-[11px] text-gray-400">sem cartão</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <span className="text-3xl font-bold text-gray-900">R$&nbsp;499</span>
                  <span className="text-xs text-gray-400 block">/mês</span>
                </div>
              </div>
            </div>
            <div className="px-5 sm:px-6 py-5">
              <ul className="space-y-2.5 mb-6">
                {PLAN_FEATURES.map((feat) => (
                  <li key={feat.label} className="flex items-center gap-2.5 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${feat.soon ? "text-gray-300" : "text-green-500"}`} />
                    <span className={feat.soon ? "text-gray-400" : "text-gray-600"}>{feat.label}</span>
                    {feat.soon && (
                      <span className="ml-auto text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                        Em breve
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
              >
                Começar 7 dias grátis
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">
                Cancele a qualquer momento. Sem fidelidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">Pronto para começar?</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          Crie sua primeira pesquisa em minutos. 7 dias grátis, sem precisar de cartão.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Entrar com Google
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center gap-2 sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded-md flex items-center justify-center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="19" width="18" height="10" rx="3" fill="white"/>
                <rect x="28" y="8" width="17" height="10" rx="3" fill="white"/>
                <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55"/>
                <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7"/>
                <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4"/>
                <circle cx="21" cy="24" r="3" fill="white"/>
                <circle cx="28" cy="13" r="2.5" fill="white"/>
                <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55"/>
              </svg>
            </div>
            <span className="text-xs font-semibold text-gray-900">SurveyFlow</span>
          </div>
          <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} SurveyFlow. Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
