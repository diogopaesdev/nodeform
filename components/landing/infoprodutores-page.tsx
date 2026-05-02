"use client";

import { motion, useInView } from "framer-motion";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Check, ArrowLeft,
  MessageCircle, Quote, Zap, Shield, TrendingUp,
  BookOpen, Clock, BarChart2, Target, Layers, Sparkles,
  ChevronRight, Users, Star,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5541995311160?text=Ol%C3%A1%2C%20vim%20pela%20p%C3%A1gina%20de%20Infoprodutores%20do%20SurveyFlow%20e%20gostaria%20de%20saber%20mais!";

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
  "Você lança para toda a lista sem saber quem está pronto para comprar — e queima a audiência sem resultado",
  "Leads chegam pelo Instagram ou YouTube, mas ninguém sabe qual produto recomendar para cada perfil",
  "As páginas de vendas convertem pouco porque falam para todo mundo ao mesmo tempo e não falam para ninguém",
  "Sem qualificação prévia, a equipe de suporte responde as mesmas dúvidas de iniciantes e avançados sem distinguir",
];

const STEPS = [
  {
    n: "01",
    title: "Crie o quiz de diagnóstico",
    desc: "Monte perguntas que identificam o nível, o objetivo e a dor do lead. O fluxo condicional adapta o caminho por resposta — sem código, em minutos.",
  },
  {
    n: "02",
    title: "Qualifique e segmente automaticamente",
    desc: "Cada lead termina o quiz com um perfil claro: iniciante, avançado, produto A ou produto B. Seus dados ficam organizados e prontos para a oferta certa.",
  },
  {
    n: "03",
    title: "Direcione para a oferta ideal e acione WhatsApp",
    desc: "Redirecione cada perfil para a página de vendas correta e dispare mensagem no WhatsApp automaticamente — sem intervir manualmente em cada lead.",
  },
];

const BENEFITS = [
  {
    icon: Target,
    color: "text-violet-500",
    bg: "bg-violet-50",
    title: "Oferta certa para cada perfil",
    desc: "Pare de oferecer o mesmo produto para todo mundo. O quiz identifica o nível e a necessidade e entrega a recomendação ideal para cada lead.",
  },
  {
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-50",
    title: "Mais conversão nos lançamentos",
    desc: "Leads que chegam qualificados compram mais. Você faz mais vendas com a mesma audiência porque a oferta já encaixa no perfil.",
  },
  {
    icon: BarChart2,
    color: "text-purple-500",
    bg: "bg-purple-50",
    title: "Dados reais do seu público",
    desc: "Veja quais perfis dominam sua lista, quais objeções aparecem mais e onde cada segmento abandona o funil — dados para decidir o próximo lançamento.",
  },
  {
    icon: Clock,
    color: "text-orange-500",
    bg: "bg-orange-50",
    title: "Automação do primeiro contato",
    desc: "Cada lead qualificado aciona mensagem personalizada no WhatsApp ou e-mail automaticamente. Sua equipe só entra em contato com quem vale o tempo.",
  },
  {
    icon: Layers,
    color: "text-green-600",
    bg: "bg-green-50",
    title: "Funciona para qualquer produto digital",
    desc: "Cursos, mentorias, ebooks, comunidades ou SaaS — o fluxo se adapta ao seu portfólio sem precisar criar uma ferramenta diferente para cada oferta.",
  },
  {
    icon: Sparkles,
    color: "text-amber-500",
    bg: "bg-amber-50",
    title: "IA monta seu quiz em segundos",
    desc: "Descreva seu produto e seu público e a IA cria o fluxo completo com perguntas, caminhos e tela de resultado — você ajusta e publica.",
  },
];

const OBJECTIONS = [
  {
    q: "Minha audiência vai preencher um formulário antes de comprar?",
    a: "Quiz de diagnóstico tem taxa de conclusão alta justamente porque entrega valor imediato: o lead descobre o próprio perfil e recebe uma recomendação personalizada. Não é um form burocrático — é uma experiência.",
  },
  {
    q: "Já tenho página de vendas. Por que adicionar um quiz antes?",
    a: "A página de vendas convence quem já está pronto. O quiz qualifica quem ainda está na dúvida e direciona para a oferta certa — aumentando a conversão no topo do funil, antes mesmo de chegar na página.",
  },
  {
    q: "É difícil configurar o fluxo condicional?",
    a: "Você arrasta blocos no editor visual e define qual pergunta aparece dependendo da resposta anterior. Em menos de 30 minutos você cria e publica o primeiro quiz. Nenhum código necessário.",
  },
  {
    q: "Consigo integrar com meu CRM ou e-mail marketing?",
    a: "O SurveyFlow exporta os dados por CSV e envia notificações via WhatsApp. Integrações via webhook e API para plataformas como ActiveCampaign e RD Station estão no roadmap.",
  },
  {
    q: "Funciona para lançamentos e para evergreen ao mesmo tempo?",
    a: "Sim. O mesmo quiz pode capturar leads para o lançamento e depois ficar no ar como qualificação evergreen — a lógica não muda, só a oferta no final do fluxo.",
  },
];

const PLAN_FEATURES = [
  "Pesquisas e quizzes ilimitados",
  "Fluxo condicional por resposta",
  "Dashboard e analytics em tempo real",
  "Exportação de dados (CSV)",
  "Embed em site ou link direto",
  "Coleta de nome, e-mail e telefone",
  "Identidade visual da sua marca",
  "10 créditos IA por mês",
  "Suporte prioritário",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export function InfoprodutoresPage() {
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
            className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-violet-200 bg-violet-50 text-[12px] text-violet-600 font-medium mb-8"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Solução para Infoprodutores
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-[42px] sm:text-[56px] font-extrabold tracking-[-0.03em] leading-[1.06] text-gray-950 mb-6"
          >
            Mais vendas com leads que{" "}
            <span className="relative inline-block">
              <span className="relative z-10">já chegam qualificados</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1.5 inset-x-0 h-[10px] bg-violet-100 origin-left -z-0 rounded"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32, ease: "easeOut" }}
            className="text-[17px] text-gray-500 leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Quizzes de diagnóstico que identificam o perfil do lead, recomendam o produto certo e acionam o WhatsApp automaticamente — sem código, sem planilha, sem esforço manual.
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
              Criar meu quiz grátis <ArrowRight className="w-4 h-4" />
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

      {/* ─ Prova rápida (números) ──────────────────────────────────────────── */}
      <section className="pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { value: "+40%", label: "de conversão em média com quiz vs. página fria", icon: TrendingUp },
                { value: "< 30min", label: "para criar e publicar o primeiro quiz qualificador", icon: Clock },
                { value: "100%", label: "sem código — editor visual com arrastar e soltar", icon: Zap },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-2xl border border-gray-200"
                >
                  <stat.icon className="w-5 h-5 text-violet-500 mb-3" />
                  <span className="text-[32px] font-extrabold text-gray-950 tracking-tight leading-none mb-2">{stat.value}</span>
                  <span className="text-[13px] text-gray-500 leading-relaxed">{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─ Problema ───────────────────────────────────────────────────────── */}
      <section id="problema" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[12px] font-semibold text-red-500 uppercase tracking-widest mb-3">O problema</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              Por que seus lançamentos não convertem o que deveriam?
            </h2>
            <p className="text-[16px] text-gray-500 mt-3 max-w-xl mx-auto">
              A maioria dos infoprodutores perde vendas por falar com todo mundo do mesmo jeito — e a oferta nunca encaixa direito em ninguém.
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
              O SurveyFlow resolve isso antes do lead chegar na sua página de vendas.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─ Solução ────────────────────────────────────────────────────────── */}
      <section id="solucao" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-semibold text-violet-500 uppercase tracking-widest mb-3">Como funciona</p>
            <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              Da audiência fria à venda em 3 passos
            </h2>
            <p className="text-[16px] text-gray-500 mt-3">Simples para você configurar, poderoso para quem responde.</p>
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
            <p className="text-[12px] font-semibold text-violet-500 uppercase tracking-widest mb-3">Benefícios</p>
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
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp className="text-center">
            <p className="text-[12px] font-semibold text-violet-500 uppercase tracking-widest mb-10">Case real</p>
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
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 text-center">
              <p className="text-[14px] font-semibold text-violet-800 mb-1">
                Se funciona para pesquisa clínica de alta exigência...
              </p>
              <p className="text-[13px] text-violet-600 leading-relaxed">
                Funciona para qualificar leads do seu produto digital com muito mais facilidade. A lógica condicional que orienta pesquisas em oncologia é a mesma que separa iniciantes de avançados no seu quiz.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─ Demo — quiz mockup ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-gray-950">
        <FadeUp>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest mb-4">Veja na prática</p>
              <h2 className="text-[28px] sm:text-[36px] font-extrabold text-white tracking-tight leading-tight mb-4">
                Como um quiz de diagnóstico se parece para o seu lead
              </h2>
              <p className="text-[15px] text-gray-400 max-w-lg mx-auto">
                Cada resposta adapta o próximo passo. O lead sente que o quiz foi feito para ele — porque o fluxo foi.
              </p>
            </div>

            {/* Quiz mockup */}
            <div className="max-w-lg mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl mb-10">
              <div className="h-1.5 bg-gray-100">
                <div className="h-full w-2/3 bg-violet-500 rounded-full transition-all" />
              </div>
              <div className="p-7">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 bg-violet-100 rounded-md flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <span className="text-[11px] font-semibold text-violet-500 uppercase tracking-wide">Pergunta 2 de 3</span>
                </div>
                <p className="text-[17px] font-semibold text-gray-900 mb-5 leading-snug">
                  Qual é o seu maior desafio hoje para vender infoprodutos?
                </p>
                <div className="space-y-2.5">
                  {[
                    "Não sei criar conteúdo que converte",
                    "Tenho audiência mas não sei como monetizar",
                    "Já vendo mas quero escalar o ticket",
                    "Nunca comecei e não sei por onde ir",
                  ].map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-[14px] cursor-pointer transition-colors ${
                        i === 1
                          ? "border-violet-400 bg-violet-50 text-violet-800 font-medium"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        i === 1 ? "border-violet-500 bg-violet-500" : "border-gray-300"
                      }`}>
                        {i === 1 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      {opt}
                    </div>
                  ))}
                </div>
                <button className="mt-5 w-full h-10 bg-gray-900 text-white text-[14px] font-semibold rounded-xl flex items-center justify-center gap-2">
                  Próximo <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-gray-100 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                Criar meu quiz grátis <ArrowRight className="w-4 h-4" />
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
            <p className="text-[12px] font-semibold text-violet-500 uppercase tracking-widest mb-3">Tire suas dúvidas</p>
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
            <p className="text-[12px] font-semibold text-violet-500 uppercase tracking-widest mb-3">Plano único · Sem surpresas</p>
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
                { icon: Zap, color: "bg-violet-50 text-violet-500", title: "Comece em segundos", desc: "Login com Google, crie seu quiz e publique o link — tudo em menos de 30 minutos." },
                { icon: Shield, color: "bg-green-50 text-green-600", title: "7 dias grátis, sem cartão", desc: "Teste tudo sem precisar cadastrar forma de pagamento." },
                { icon: Users, color: "bg-blue-50 text-blue-500", title: "Cancele quando quiser", desc: "Sem fidelidade, sem taxa de cancelamento. Você controla." },
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
              Pronto para converter mais com menos esforço no lançamento?
            </h2>
            <p className="text-[16px] text-gray-400 mb-10 max-w-sm mx-auto">
              7 dias grátis, sem cartão. Crie seu primeiro quiz e veja na prática.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 bg-white hover:bg-gray-100 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors"
              >
                Criar meu quiz agora
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
