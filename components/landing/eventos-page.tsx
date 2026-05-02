"use client";

import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Check, ArrowLeft,
  MessageCircle, Quote, Zap, Shield, TrendingUp,
  BarChart2, Clock, Download, GitBranch, Sparkles,
  ChevronRight, Users, CalendarDays, Bell, CheckSquare,
  UserCheck, Layers,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5541995311160?text=Ol%C3%A1%2C%20vim%20pela%20p%C3%A1gina%20de%20Eventos%20do%20SurveyFlow%20e%20gostaria%20de%20saber%20mais!";

// ─── Utils ────────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 22 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="3" y="19" width="18" height="10" rx="3" fill="white" />
      <rect x="28" y="8" width="17" height="10" rx="3" fill="white" />
      <rect x="28" y="30" width="17" height="10" rx="3" fill="white" fillOpacity="0.55" />
      <path d="M21 24 C24.5 24 24.5 13 28 13" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M21 24 C24.5 24 24.5 35 28 35" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
      <circle cx="21" cy="24" r="3" fill="white" />
      <circle cx="28" cy="13" r="2.5" fill="white" />
      <circle cx="28" cy="35" r="2.5" fill="white" fillOpacity="0.55" />
    </svg>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROBLEMS = [
  "Inscrições no Google Forms chegam como planilha suja — sem segmentação por perfil, sem como saber quem é VIP, palestrante ou convidado corporativo",
  "Confirmações de presença são feitas manualmente por e-mail ou WhatsApp, tomando horas da equipe e gerando no-show por falta de engajamento",
  "Você não sabe quantos inscritos comparecem de verdade até o dia do evento — sem controle de lista, sem dados em tempo real",
  "Formulários genéricos coletam os mesmos dados de todo mundo, desperdiçando a chance de qualificar e segmentar participantes antes do evento",
];

const STEPS = [
  {
    n: "01",
    title: "Monte o fluxo de inscrição por perfil",
    desc: "Arraste blocos no editor visual. Configure perguntas diferentes para cada tipo de participante — palestrante, patrocinador, convidado, público geral — tudo com lógica condicional, sem código.",
  },
  {
    n: "02",
    title: "Colete inscrições e qualifique participantes",
    desc: "Cada inscrito percorre apenas as perguntas relevantes ao seu perfil. Você já sabe quem é quem antes do evento — lista organizada, dados prontos para ação.",
  },
  {
    n: "03",
    title: "Confirme presença e exporte a lista",
    desc: "Dashboard em tempo real com total de inscritos por categoria. Exporte CSV organizado para crachás, controle de acesso ou integração com sua ferramenta de eventos.",
  },
];

const BENEFITS = [
  {
    icon: GitBranch,
    color: "text-orange-500",
    bg: "bg-orange-50",
    title: "Inscrição segmentada por perfil",
    desc: "Palestrante, patrocinador, convidado corporativo ou público geral — cada perfil responde perguntas diferentes. Dados limpos desde a coleta.",
  },
  {
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Lista de presença qualificada",
    desc: "Saiba exatamente quem vai comparecer, o que esperam e qual nível de engajamento têm — antes de qualquer planilha manual.",
  },
  {
    icon: BarChart2,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Inscritos em tempo real",
    desc: "Acompanhe o número de inscrições por categoria à medida que chegam, sem precisar esperar exportação ou cruzamento manual.",
  },
  {
    icon: Bell,
    color: "text-purple-500",
    bg: "bg-purple-50",
    title: "Confirmação automática via WhatsApp",
    desc: "Integre com WhatsApp para confirmar inscrição e enviar lembretes automáticos — menos no-show, mais engajamento antes do evento.",
  },
  {
    icon: Download,
    color: "text-rose-500",
    bg: "bg-rose-50",
    title: "Exportação pronta para crachás e acesso",
    desc: "CSV organizado por categoria de participante, pronto para importar no sistema de credenciamento ou imprimir crachás sem retrabalho.",
  },
  {
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-50",
    title: "IA monta o formulário de inscrição",
    desc: "Descreva seu evento e a IA cria o fluxo completo com perguntas por perfil, campos obrigatórios e lógica condicional — em segundos.",
  },
];

const OBJECTIONS = [
  {
    q: "Preciso de desenvolvedor para configurar?",
    a: "Não. O editor visual funciona por arrastar e soltar — qualquer pessoa da equipe cria e publica o formulário de inscrição em menos de 30 minutos, sem código.",
  },
  {
    q: "Já uso Google Forms ou Sympla. O que muda?",
    a: "Google Forms não segmenta perguntas por perfil de participante — todo mundo responde o mesmo formulário. O SurveyFlow exibe perguntas diferentes com base nas respostas anteriores, então você coleta dados muito mais úteis para segmentação e logística.",
  },
  {
    q: "Funciona para eventos pequenos também?",
    a: "Sim. Tanto para um workshop de 30 pessoas quanto para um congresso de 2.000 participantes. O fluxo condicional e o dashboard funcionam do mesmo jeito — você escolhe o nível de complexidade da inscrição.",
  },
  {
    q: "Como funciona a exportação da lista de inscritos?",
    a: "Você exporta um CSV com uma coluna por pergunta, organizado por inscrito. Compatível com Excel, sistemas de credenciamento e qualquer ferramenta de gestão de eventos.",
  },
  {
    q: "Posso ter inscrições para diferentes modalidades no mesmo formulário?",
    a: "Sim. Configure o fluxo para coletar dados diferentes de quem vai presencialmente, online, como palestrante ou como patrocinador — no mesmo link de inscrição.",
  },
];

const PLAN_FEATURES = [
  "Formulários de inscrição ilimitados",
  "Fluxo condicional por perfil de participante",
  "Dashboard e contagem de inscritos em tempo real",
  "Exportação de lista (CSV)",
  "Segmentação por categoria de participante",
  "Embed em site ou link direto",
  "Integração com WhatsApp",
  "10 créditos IA por mês",
  "Suporte prioritário",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen text-gray-900 antialiased">

      {/* ─ Navbar ─────────────────────────────────────────────────────────── */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center h-11 px-1.5 bg-white/90 backdrop-blur-md border border-gray-200/80 rounded-full shadow-sm"
          style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.04)" }}
        >
          <Link href="/" className="flex items-center gap-2 pl-2.5 pr-3.5 hover:opacity-80 transition-opacity">
            <div className="w-6 h-6 bg-gray-900 rounded-[7px] flex items-center justify-center flex-shrink-0">
              <Logo size={15} />
            </div>
            <span className="text-[14px] font-bold tracking-tight">SurveyFlow</span>
          </Link>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <nav className="hidden md:flex items-center gap-0.5 px-1">
            {[
              { href: "#problema", label: "Problema" },
              { href: "#solucao", label: "Solução" },
              { href: "#beneficios", label: "Benefícios" },
              { href: "#prova", label: "Caso real" },
              { href: "#objections", label: "Dúvidas" },
              { href: "#preco", label: "Preço" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="w-px h-5 bg-gray-200 mx-1 hidden md:block" />

          <div className="flex items-center gap-1 pl-1 pr-1">
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:block px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              Entrar
            </button>
            <button
              onClick={() => router.push("/login")}
              className="h-8 px-3.5 bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-medium rounded-full transition-colors flex items-center gap-1.5"
            >
              Começar grátis <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─ Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-[96px] pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-orange-200 bg-orange-50 text-[12px] text-orange-600 font-medium mb-8"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Solução para Eventos
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-[42px] sm:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.06] text-gray-950 mb-6"
          >
            Inscrições de evento que{" "}
            <span className="relative inline-block">
              <span className="relative z-10">qualificam antes de confirmar</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1.5 inset-x-0 h-[10px] bg-orange-100 origin-left -z-0 rounded"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
            className="text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Formulários com fluxo condicional que segmentam cada participante pelo perfil — palestrante, patrocinador ou convidado — e entregam a lista organizada antes do evento começar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.42 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-12 px-8 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              Criar minha inscrição grátis <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto h-12 px-8 text-[15px] font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-[12px] transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              Falar com especialista
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-[13px] text-gray-400 mt-4"
          >
            7 dias grátis · Sem cartão de crédito · Cancele quando quiser
          </motion.p>
        </div>
      </section>

      {/* ─ Problema ───────────────────────────────────────────────────────── */}
      <section id="problema" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[12px] font-semibold text-red-500 uppercase tracking-widest mb-3">O problema</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              Por que inscrições com formulários genéricos travam a logística?
            </h2>
            <p className="text-[16px] text-gray-500 mt-3 max-w-xl mx-auto">
              Google Forms e Typeform foram feitos para coletar respostas simples — não para gerenciar múltiplos perfis de participantes com dados diferentes.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-4">
            {PROBLEMS.map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-200">
                  <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-red-400 font-bold text-[13px]">{i + 1}</span>
                  </div>
                  <p className="text-[14px] text-gray-700 leading-relaxed">{item}</p>
                </div>
              </FadeUp>
            ))}
          </div>

          <FadeUp delay={0.32} className="mt-10 text-center">
            <p className="text-[15px] font-semibold text-gray-900">
              O SurveyFlow foi feito para eventos que precisam de mais do que um link de formulário único.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─ Solução ────────────────────────────────────────────────────────── */}
      <section id="solucao" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              Da inscrição à lista organizada em 3 passos
            </h2>
            <p className="text-[16px] text-gray-500 mt-3">Sem código, sem planilha manual, sem retrabalho no dia do evento.</p>
          </FadeUp>

          <div className="grid sm:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={i * 0.1}>
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:block absolute top-5 left-[calc(50%+28px)] right-[-50%] h-px bg-gray-200" />
                  )}
                  <div className="flex sm:flex-col sm:items-center sm:text-center gap-4 sm:gap-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 text-white text-[13px] font-bold flex items-center justify-center flex-shrink-0 sm:mb-5">
                      {s.n}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{s.title}</h3>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Benefícios ─────────────────────────────────────────────────────── */}
      <section id="beneficios" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">Benefícios</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              O que você ganha de verdade
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                    <f.icon className={`w-5 h-5 ${f.color}`} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Prova Social ───────────────────────────────────────────────────── */}
      <section id="prova" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-10">Caso real</p>
            <div className="flex justify-center mb-6">
              <Quote className="w-8 h-8 text-gray-200" />
            </div>
            <blockquote className="text-[18px] sm:text-[22px] font-medium text-gray-800 leading-relaxed mb-4">
              "Usamos o SurveyFlow para conduzir pesquisas de mercado em oncologia. A lógica condicional permitiu coletar dados com rigor metodológico real, gerando insights clínicos e estratégicos que orientam decisões na área da saúde."
            </blockquote>
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[14px] font-bold text-gray-600">M</span>
              </div>
              <div className="text-left">
                <p className="text-[14px] font-semibold text-gray-900">MOC Brasil</p>
                <p className="text-[12px] text-gray-500">Pesquisa clínica e de mercado em oncologia</p>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-12">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-orange-900 mb-2">
                    Se funciona para pesquisa clínica com rigor metodológico, funciona para qualquer evento
                  </p>
                  <p className="text-[13px] text-orange-700 leading-relaxed">
                    O mesmo fluxo condicional que garante qualidade de dados em estudos de oncologia — com critérios de elegibilidade, ramificações por perfil e exportação organizada — é o que torna inscrições de evento mais inteligentes e a logística mais simples.
                  </p>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─ Demo CTA ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-950">
        <FadeUp>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest mb-4">Veja na prática</p>
            <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight mb-4">
              Monte o formulário de inscrição do seu evento em menos de 30 minutos
            </h2>
            <p className="text-[15px] text-gray-400 mb-8 max-w-lg mx-auto">
              Arraste blocos, configure perfis de participante e publique o link — sem desenvolvedor, sem retrabalho na lista.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-gray-100 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Criar minha inscrição grátis <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto h-12 px-8 bg-white/10 hover:bg-white/20 text-white text-[15px] font-medium rounded-xl transition-colors border border-white/20 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com especialista
              </a>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ─ Objeções ───────────────────────────────────────────────────────── */}
      <section id="objections" className="py-24 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center mb-12">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">Tire suas dúvidas</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              Respostas para quem ainda está em dúvida
            </h2>
          </FadeUp>

          <div className="space-y-3">
            {OBJECTIONS.map((item, i) => (
              <FadeUp key={i} delay={i * 0.06}>
                <details className="group bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none text-[15px] font-semibold text-gray-800 hover:text-gray-900 transition-colors">
                    {item.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform duration-200 flex-shrink-0 text-lg leading-none">+</span>
                  </summary>
                  <p className="px-6 pb-5 text-[14px] text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                  </p>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Preço ──────────────────────────────────────────────────────────── */}
      <section id="preco" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">Plano único · Sem surpresas</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              Simples e transparente
            </h2>
            <p className="text-[16px] text-gray-500 mt-3 max-w-md mx-auto">
              Um plano com acesso completo. Sem tier de features escondidas, sem taxa de implantação.
            </p>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <FadeUp className="space-y-5">
              {[
                { icon: Zap, color: "bg-orange-50 text-orange-500", title: "Comece em segundos", desc: "Login com Google, crie o formulário de inscrição e publique — tudo em menos de 30 minutos." },
                { icon: Shield, color: "bg-green-50 text-green-600", title: "7 dias grátis, sem cartão", desc: "Teste tudo sem precisar cadastrar forma de pagamento." },
                { icon: TrendingUp, color: "bg-blue-50 text-blue-500", title: "Cancele quando quiser", desc: "Sem fidelidade, sem taxa de cancelamento. Você controla." },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-[13px] text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </FadeUp>

            <FadeUp delay={0.12}>
              <div className="rounded-2xl overflow-hidden border-2 border-gray-900 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="px-7 pt-7 pb-6 bg-gray-950">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[16px] font-bold text-white">Plano Pro</span>
                    <span className="h-6 px-2.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-semibold rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      7 dias grátis
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-[52px] font-extrabold text-white leading-none tracking-tight">R$&nbsp;499</span>
                    <span className="text-[14px] text-gray-500 mb-2">/mês</span>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-2">Sem cartão para começar o teste.</p>
                </div>

                <div className="px-7 pt-6 pb-2 bg-white">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">O que está incluso</p>
                  <ul className="space-y-2.5">
                    {PLAN_FEATURES.map((feat) => (
                      <li key={feat} className="flex items-center gap-3 text-[14px]">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-7 pt-5 pb-7 bg-white">
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Começar 7 dias grátis <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[12px] text-gray-400 mt-3">
                    Cancele a qualquer momento. Sem fidelidade.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ─ CTA Final ──────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <FadeUp>
          <div className="max-w-5xl mx-auto bg-gray-950 rounded-3xl px-8 py-16 text-center">
            <h2 className="text-[30px] sm:text-[42px] font-extrabold tracking-[-0.02em] leading-tight text-white mb-4">
              Pronto para ter a lista do seu evento organizada antes do dia?
            </h2>
            <p className="text-[16px] text-gray-400 mb-10 max-w-sm mx-auto">
              7 dias grátis, sem cartão. Comece agora e veja o resultado.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 bg-white hover:bg-gray-100 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors"
              >
                Criar minha inscrição agora
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 bg-white/10 hover:bg-white/20 text-white text-[15px] font-medium rounded-xl transition-colors border border-white/20"
              >
                <MessageCircle className="w-4 h-4" />
                Falar no WhatsApp
              </a>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 bg-transparent hover:bg-white/5 text-white/60 hover:text-white text-[15px] font-medium rounded-xl transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para a home
              </Link>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ─ Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-[26px] h-[26px] bg-gray-900 rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Logo size={16} />
            </div>
            <span className="text-[14px] font-bold">SurveyFlow</span>
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-[13px] text-gray-400">
            <span>© {new Date().getFullYear()} SurveyFlow</span>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">Termos</Link>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacidade</Link>
            <Link href="/" className="hover:text-gray-700 transition-colors flex items-center gap-1">
              <ChevronRight className="w-3 h-3" />
              Ver todas as soluções
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
