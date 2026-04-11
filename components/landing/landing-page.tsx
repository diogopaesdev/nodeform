"use client";

import { motion, useInView } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight, Check, GitBranch, BarChart2,
  Share2, Clock, Zap, Shield, Users, TrendingUp,
  Play, CircleDot, CheckSquare, Star, FlagTriangleRight,
  GripVertical, Settings, Save, ArrowLeft, Trash2,
  Sparkles, Brain, FileSearch, Languages, FileBarChart2, MessageSquare,
} from "lucide-react";
import { LanguageToggle } from "@/components/language-toggle";
import { useI18n } from "@/lib/i18n";

// ─── Utils ────────────────────────────────────────────────────────────────────

function bezier(a: { x: number; y: number }, b: { x: number; y: number }) {
  const cx = (a.x + b.x) / 2;
  return `M ${a.x} ${a.y} C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
}

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

// ─── Logo ─────────────────────────────────────────────────────────────────────

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

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ─── Animated Edge ────────────────────────────────────────────────────────────

// ─── Edge animada ─────────────────────────────────────────────────────────────

function AnimatedEdge({
  from, to, delay = 0,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay?: number;
}) {
  const d = bezier(from, to);
  return (
    <motion.path d={d} fill="none" stroke="#d1d5db" strokeWidth="1.5"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: "easeInOut" }}
    />
  );
}

// handle SVG (replica exata do React Flow Handle)
function SvgHandle({
  cx, cy, fill, delay = 0,
}: { cx: number; cy: number; fill: string; delay?: number }) {
  return (
    <motion.circle cx={cx} cy={cy} r={6} fill={fill} stroke="white" strokeWidth="2"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 18, delay }}
    />
  );
}

// ─── Mock Nodes (pixel-perfect dos componentes reais) ─────────────────────────

function ni(delay: number) {
  return {
    initial: { opacity: 0, scale: 0.88, y: 6 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { type: "spring" as const, stiffness: 260, damping: 22, delay },
  };
}

// Apresentação — replica PresentationNode
function NodePresentation({ x, y }: { x: number; y: number }) {
  const { t } = useI18n();
  return (
    <motion.div {...ni(0)}
      className="absolute bg-white rounded-xl shadow-sm border border-gray-200 w-[260px]"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-gray-100">
        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Play className="w-3.5 h-3.5 text-orange-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-orange-600 uppercase tracking-wide">{t.landing.mockNodes.presentationType}</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{t.landing.mockNodes.presentationTitle}</div>
        </div>
      </div>
      <div className="p-4 space-y-2.5">
        <p className="text-xs text-gray-500 line-clamp-2">{t.landing.mockNodes.presentationDesc}</p>
        <div className="flex justify-center pt-1">
          <div className="px-4 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-md">
            {t.landing.mockNodes.presentationCta}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Escolha Simples — replica SingleChoiceNode (selecionado)
function NodeSingleChoice({ x, y }: { x: number; y: number }) {
  const { t } = useI18n();
  const opts = [t.landing.mockNodes.singleChoiceOpt1, t.landing.mockNodes.singleChoiceOpt2, t.landing.mockNodes.singleChoiceOpt3];
  return (
    <motion.div {...ni(0.14)}
      className="absolute bg-white rounded-xl shadow-md shadow-blue-100 border border-blue-400 w-[260px]"
      style={{ left: x, top: y }}
    >
      <motion.div
        className="absolute -inset-[3px] rounded-[14px] border border-blue-400/40 pointer-events-none"
        animate={{ opacity: [0.3, 0.65, 0.3] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      />
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-gray-100">
        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <CircleDot className="w-3.5 h-3.5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-blue-600 uppercase tracking-wide">{t.landing.mockNodes.singleChoiceType}</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{t.landing.mockNodes.singleChoiceTitle}</div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {opts.map((opt, i) => (
          <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-md pr-5">
            <div className="w-3 h-3 rounded-full border-2 border-blue-400 flex-shrink-0" />
            <span className="text-xs text-gray-700 flex-1 truncate">{opt}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Avaliação — replica RatingNode (usa ícones Star como o real)
function NodeRating({ x, y }: { x: number; y: number }) {
  const { t } = useI18n();
  return (
    <motion.div {...ni(0.28)}
      className="absolute bg-white rounded-xl shadow-sm border border-gray-200 w-[260px]"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-gray-100">
        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Star className="w-3.5 h-3.5 text-purple-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-purple-600 uppercase tracking-wide">{t.landing.mockNodes.ratingType}</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{t.landing.mockNodes.ratingTitle}</div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-0.5 py-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <Star key={n} className="w-5 h-5 text-amber-400 fill-amber-400" strokeWidth={1.5} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>1</span>
            <span>5</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Tela Final — replica EndScreenNode (usa FlagTriangleRight como o real)
function NodeEndScreen({ x, y }: { x: number; y: number }) {
  const { t } = useI18n();
  return (
    <motion.div {...ni(0.42)}
      className="absolute bg-white rounded-xl shadow-sm border border-gray-200 w-[260px]"
      style={{ left: x, top: y }}
    >
      <div className="flex items-center gap-2.5 px-3 py-3 border-b border-gray-100">
        <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <FlagTriangleRight className="w-3.5 h-3.5 text-rose-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-medium text-rose-600 uppercase tracking-wide">{t.landing.mockNodes.endScreenType}</div>
          <div className="font-semibold text-gray-900 text-sm truncate">{t.landing.mockNodes.endScreenTitle}</div>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-500 line-clamp-2">{t.landing.mockNodes.endScreenDesc}</p>
      </div>
    </motion.div>
  );
}

// ─── Flow Canvas ──────────────────────────────────────────────────────────────

function FlowCanvas() {
  // Posições dos nós (left, top) — largura fixa 240px
  // N1 Pres:   left=16,  top=108  → source x=256,  y=179   (108 + 143/2)
  // N2 Choice: left=286, top=92   → target x=286,  y=175   (92  + 167/2)
  //   header=49px, p-3(12)+opt(26)+gap(8) per row:
  //   opt0 center: 49+12+13=74  → y=92+74=166
  //   opt1 center: 49+12+26+8+13=108 → y=92+108=200
  //   opt2 center: 49+12+26+8+26+8+13=142 → y=92+142=234
  // N4 End:    left=560, top=40   → target x=560,  y=92    (40  + 105/2)
  // N3 Rating: left=560, top=252  → target x=560,  y=314   (252 + 124/2)
  // Largura dos nós: 260px
  // N1 Pres:    left=16,  right=276
  // N2 Choice:  left=320, right=580  (gap=44px)
  // N3/N4:      left=624             (gap=44px)
  const h = {
    n1src:  { x: 276, y: 179 },
    n2tgt:  { x: 320, y: 185 },
    n2o1:   { x: 580, y: 196 },
    n2o2:   { x: 580, y: 228 },
    n2o3:   { x: 580, y: 260 },
    n3tgt:  { x: 624, y: 322 },
    n4tgt:  { x: 624, y: 90  },
  };

  return (
    // Fundo idêntico ao React Flow (BackgroundVariant.Dots)
    <div
      className="relative w-full h-[420px] overflow-hidden"
      style={{
        backgroundColor: "#fff",
        backgroundImage: "radial-gradient(circle, #dde3ea 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        backgroundPosition: "8px 8px",
      }}
    >
      {/* Edges SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 2 }}>
        <AnimatedEdge from={h.n1src} to={h.n2tgt} delay={0.5}  />
        <AnimatedEdge from={h.n2o1}  to={h.n4tgt} delay={0.82} />
        <AnimatedEdge from={h.n2o2}  to={h.n3tgt} delay={1.02} />
        <AnimatedEdge from={h.n2o3}  to={h.n3tgt} delay={1.22} />

        {/* Handles */}
        <SvgHandle cx={h.n1src.x} cy={h.n1src.y} fill="#f97316" delay={0.45} />
        <SvgHandle cx={h.n2tgt.x} cy={h.n2tgt.y} fill="#9ca3af"  delay={0.45} />
        <SvgHandle cx={h.n2o1.x}  cy={h.n2o1.y}  fill="#3b82f6"  delay={0.5}  />
        <SvgHandle cx={h.n2o2.x}  cy={h.n2o2.y}  fill="#3b82f6"  delay={0.5}  />
        <SvgHandle cx={h.n2o3.x}  cy={h.n2o3.y}  fill="#3b82f6"  delay={0.5}  />
        <SvgHandle cx={h.n3tgt.x} cy={h.n3tgt.y} fill="#9ca3af"  delay={0.6}  />
        <SvgHandle cx={h.n4tgt.x} cy={h.n4tgt.y} fill="#9ca3af"  delay={0.6}  />
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0" style={{ zIndex: 3 }}>
        <NodePresentation  x={16}  y={108} />
        <NodeSingleChoice  x={320} y={88}  />
        <NodeRating        x={624} y={240} />
        <NodeEndScreen     x={624} y={36}  />
      </div>

      {/* Fade lateral (para o canvas "desaparecer" na borda direita) */}
      <div className="absolute inset-0 pointer-events-none z-10"
        style={{ boxShadow: "inset -60px 0 40px -20px white, inset 0 -30px 30px -15px white, inset 0 8px 20px -12px white" }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useI18n();

  // ─── Data (inside component to use translations) ───────────────────────────

  const FEATURES = [
    { icon: GitBranch,  color: "text-blue-500",   bg: "bg-blue-50",   title: t.landing.featuresItems[0].title, desc: t.landing.featuresItems[0].desc },
    { icon: TrendingUp, color: "text-green-500",   bg: "bg-green-50",  title: t.landing.featuresItems[1].title, desc: t.landing.featuresItems[1].desc },
    { icon: BarChart2,  color: "text-purple-500",  bg: "bg-purple-50", title: t.landing.featuresItems[2].title, desc: t.landing.featuresItems[2].desc },
    { icon: Share2,     color: "text-orange-500",  bg: "bg-orange-50", title: t.landing.featuresItems[3].title, desc: t.landing.featuresItems[3].desc },
    { icon: Clock,      color: "text-amber-500",   bg: "bg-amber-50",  title: t.landing.featuresItems[4].title, desc: t.landing.featuresItems[4].desc },
    { icon: Shield,     color: "text-red-500",     bg: "bg-red-50",    title: t.landing.featuresItems[5].title, desc: t.landing.featuresItems[5].desc },
  ];

  const STEPS = [
    { n: t.landing.stepsItems[0].n, title: t.landing.stepsItems[0].title, desc: t.landing.stepsItems[0].desc },
    { n: t.landing.stepsItems[1].n, title: t.landing.stepsItems[1].title, desc: t.landing.stepsItems[1].desc },
    { n: t.landing.stepsItems[2].n, title: t.landing.stepsItems[2].title, desc: t.landing.stepsItems[2].desc },
  ];

  const PLAN_FEATURES: { label: string; soon?: boolean }[] = [
    { label: t.landing.planFeatures[0].label },
    { label: t.landing.planFeatures[1].label },
    { label: t.landing.planFeatures[2].label },
    { label: t.landing.planFeatures[3].label },
    { label: t.landing.planFeatures[4].label },
    { label: t.landing.planFeatures[5].label },
    { label: t.landing.planFeatures[6].label },
    { label: t.landing.planFeatures[7].label },
    { label: t.landing.planFeatures[8].label },
    { label: t.landing.planFeatures[9].label },
    { label: t.landing.planFeatures[10].label },
    { label: t.landing.planFeatures[11].label },
    { label: t.landing.planFeatures[12].label, soon: true },
    { label: t.landing.planFeatures[13].label, soon: true },
    { label: t.landing.planFeatures[14].label, soon: true },
    { label: t.landing.planFeatures[15].label, soon: true },
    { label: t.landing.planFeatures[16].label, soon: true },
  ];

  const AI_FEATURES: { icon: React.ElementType; title: string; desc: string; available: boolean }[] = [
    { icon: Sparkles,      title: t.landing.aiFeatures[0].title, desc: t.landing.aiFeatures[0].desc, available: true },
    { icon: FileSearch,    title: t.landing.aiFeatures[1].title, desc: t.landing.aiFeatures[1].desc, available: false },
    { icon: Brain,         title: t.landing.aiFeatures[2].title, desc: t.landing.aiFeatures[2].desc, available: false },
    { icon: FileBarChart2, title: t.landing.aiFeatures[3].title, desc: t.landing.aiFeatures[3].desc, available: false },
    { icon: MessageSquare, title: t.landing.aiFeatures[4].title, desc: t.landing.aiFeatures[4].desc, available: false },
    { icon: Languages,     title: t.landing.aiFeatures[5].title, desc: t.landing.aiFeatures[5].desc, available: false },
  ];

  const USE_CASES = [
    { icon: Users,      title: t.landing.useCases.items[0].title, desc: t.landing.useCases.items[0].desc },
    { icon: Zap,        title: t.landing.useCases.items[1].title, desc: t.landing.useCases.items[1].desc },
    { icon: TrendingUp, title: t.landing.useCases.items[2].title, desc: t.landing.useCases.items[2].desc },
    { icon: GitBranch,  title: t.landing.useCases.items[3].title, desc: t.landing.useCases.items[3].desc },
  ];

  const PRICING_HIGHLIGHTS = [
    { icon: Zap,        color: "bg-orange-50 text-orange-500", title: t.landing.pricing.highlights[0].title, desc: t.landing.pricing.highlights[0].desc },
    { icon: Shield,     color: "bg-green-50 text-green-600",   title: t.landing.pricing.highlights[1].title, desc: t.landing.pricing.highlights[1].desc },
    { icon: TrendingUp, color: "bg-blue-50 text-blue-500",     title: t.landing.pricing.highlights[2].title, desc: t.landing.pricing.highlights[2].desc },
  ];

  const FAQ = [
    { q: t.landing.pricing.faq[0].q, a: t.landing.pricing.faq[0].a },
    { q: t.landing.pricing.faq[1].q, a: t.landing.pricing.faq[1].a },
    { q: t.landing.pricing.faq[2].q, a: t.landing.pricing.faq[2].a },
    { q: t.landing.pricing.faq[3].q, a: t.landing.pricing.faq[3].a },
    { q: t.landing.pricing.faq[4].q, a: t.landing.pricing.faq[4].a },
  ];

  const AI_MOCK_NODES = [
    t.landing.aiMock.node1,
    t.landing.aiMock.node2,
    t.landing.aiMock.node3,
    t.landing.aiMock.node4,
    t.landing.aiMock.node5,
  ];

  const SIDEBAR_NODES = [
    { id: "presentation",   title: t.landing.editorMock.nodePresentation,   Icon: Play,              color: "text-orange-600", bg: "bg-orange-100" },
    { id: "singleChoice",   title: t.landing.editorMock.nodeSingleChoice,   Icon: CircleDot,         color: "text-blue-600",   bg: "bg-blue-100"   },
    { id: "multipleChoice", title: t.landing.editorMock.nodeMultipleChoice,  Icon: CheckSquare,       color: "text-green-600",  bg: "bg-green-100"  },
    { id: "rating",         title: t.landing.editorMock.nodeRating,          Icon: Star,              color: "text-purple-600", bg: "bg-purple-100" },
    { id: "endScreen",      title: t.landing.editorMock.nodeEndScreen,       Icon: FlagTriangleRight, color: "text-rose-600",   bg: "bg-rose-100"   },
  ];

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

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
          {/* Logo */}
          <div className="flex items-center gap-2 pl-2.5 pr-3.5">
            <div className="w-6 h-6 bg-gray-900 rounded-[7px] flex items-center justify-center flex-shrink-0">
              <Logo size={15} />
            </div>
            <span className="text-[14px] font-bold tracking-tight">SurveyFlow</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-0.5 px-1">
            {[
              { href: "#features", label: t.landing.nav.features },
              { href: "#ai",       label: t.landing.nav.ai },
              { href: "#how",      label: t.landing.nav.how },
              { href: "#pricing",  label: t.landing.nav.pricing },
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

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 mx-1 hidden md:block" />

          {/* Language toggle */}
          <div className="hidden md:block">
            <LanguageToggle variant="navbar" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pl-1 pr-1">
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:block px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              {t.landing.nav.signIn}
            </button>
            <button
              onClick={() => router.push("/login")}
              className="h-8 px-3.5 bg-gray-900 hover:bg-gray-700 text-white text-[13px] font-medium rounded-full transition-colors flex items-center gap-1.5"
            >
              {t.landing.nav.getStarted} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ─ Hero ───────────────────────────────────────────────────────────── */}
      <section className="pt-[96px] pb-12 px-6">
        <div className="max-w-3xl mx-auto text-center">

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-gray-200 bg-gray-50 text-[12px] text-gray-500 font-medium mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t.landing.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="text-[44px] sm:text-[64px] font-extrabold tracking-[-0.03em] leading-[1.06] text-gray-950 mb-6"
          >
            {t.landing.hero.title1}{" "}
            <span className="relative inline-block">
              <span className="relative z-10">{t.landing.hero.title2}</span>
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
            className="text-[17px] text-gray-500 leading-relaxed max-w-xl mx-auto mb-10"
          >
            {t.landing.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.42 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button
              onClick={() => router.push("/login")}
              className="w-full sm:w-auto h-11 px-6 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium rounded-[12px] transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {t.landing.hero.cta}
            </button>
            <Link
              href="#how"
              className="w-full sm:w-auto h-11 px-6 text-[15px] font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-[12px] transition-colors flex items-center justify-center gap-1.5"
            >
              {t.landing.hero.ctaHow} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─ Editor Mockup ──────────────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.52, ease: [0.22, 1, 0.36, 1] }}
        className="px-4 sm:px-6 pb-24"
      >
        <div className="max-w-5xl mx-auto">
          {/* Editor frame — replica exata do editor real */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-[0_8px_48px_rgba(0,0,0,0.08)]">

            {/* Header — replica do <header className="h-14 border-b border-gray-200 bg-white ..."> */}
            <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 select-none">
              {/* Esquerda */}
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md text-gray-400">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">{t.landing.editorMock.surveyTitle}</span>
                  <div className="p-1 rounded text-gray-400">
                    <Settings className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                  {t.landing.editorMock.status}
                </span>
              </div>

              {/* Direita */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-50 mr-1">
                  <span className="text-xs text-gray-500">{t.landing.editorMock.score}</span>
                  <div className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-300">
                    <span className="inline-block h-3.5 w-3.5 translate-x-1 transform rounded-full bg-white shadow-sm" />
                  </div>
                </div>
                <div className="h-5 w-px bg-gray-200" />
                <div className="p-1.5 rounded-md text-gray-400">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-700">
                  <Save className="w-3.5 h-3.5" />
                  {t.landing.editorMock.save}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white">
                  <Play className="w-3.5 h-3.5" />
                  {t.landing.editorMock.test}
                </div>
              </div>
            </header>

            {/* Body: sidebar + canvas */}
            <div className="flex" style={{ height: 354 }}>

              {/* Sidebar — replica do EditorSidebar (w-56 bg-white border-r border-gray-200) */}
              <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 hidden sm:flex">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-sm">{t.landing.editorMock.sidebarTitle}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{t.landing.editorMock.sidebarDrag}</p>
                </div>
                <div className="flex-1 p-2 space-y-1.5">
                  {SIDEBAR_NODES.map((node, i) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.07, duration: 0.28 }}
                      className="flex items-center gap-2.5 px-2.5 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-grab transition-colors group"
                    >
                      <div className={`w-7 h-7 ${node.bg} rounded-md flex items-center justify-center flex-shrink-0`}>
                        <node.Icon className={`w-3.5 h-3.5 ${node.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 flex-1">{node.title}</span>
                      <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Canvas — escalonado para caber sem scrollbar */}
              <div className="flex-1 overflow-hidden relative">
                <div style={{ transform: "scale(0.844)", transformOrigin: "top left", width: "118.5%", height: 420 }}>
                  <FlowCanvas />
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.section>

      {/* ─ How it works ───────────────────────────────────────────────────── */}
      <section id="how" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">{t.landing.how.sectionLabel}</p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              {t.landing.howTitle}
            </h2>
            <p className="text-[16px] text-gray-500 mt-3">{t.landing.howSubtitle}</p>
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

      {/* ─ Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">{t.landing.features.sectionLabel}</p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              {t.landing.features.title}
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <FadeUp key={f.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-gray-300 transition-colors cursor-default"
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

      {/* ─ AI Section ─────────────────────────────────────────────────────── */}
      <section id="ai" className="py-24 px-6 bg-gray-950 overflow-hidden">
        <div className="max-w-5xl mx-auto">

          <FadeUp className="mb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[12px] font-semibold text-white/50 uppercase tracking-widest">{t.landing.ai.badge}</p>
            </div>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-tight text-white mb-4">
              {t.landing.ai.title}
            </h2>
            <p className="text-[16px] text-gray-400 max-w-xl leading-relaxed">
              {t.landing.ai.credits} <strong className="text-white">{t.landing.ai.creditsHighlight}</strong> {t.landing.ai.creditsEnd}
            </p>
          </FadeUp>

          {/* Prompt mockup */}
          <FadeUp delay={0.08} className="mb-14">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 max-w-2xl">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-3.5 h-3.5 text-white/60" />
                </div>
                <div className="flex-1 bg-white/8 rounded-xl px-4 py-3 text-[14px] text-white/80 leading-relaxed border border-white/10">
                  {t.landing.aiMock.prompt}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-gray-900" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="text-[12px] font-medium text-white/40">{t.landing.aiMock.generated}</span>
                    <span className="text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">{t.landing.aiMock.creditUsed}</span>
                  </div>
                  <div className="space-y-2">
                    {AI_MOCK_NODES.map((node, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
                        className="flex items-center gap-2.5 bg-white/8 border border-white/10 rounded-lg px-3 py-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                        <span className="text-[12px] text-white/70">{node}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeUp>

          {/* AI Features grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AI_FEATURES.map((feat, i) => (
              <FadeUp key={feat.title} delay={i * 0.06}>
                <div className={`relative p-5 rounded-2xl border transition-colors h-full ${
                  feat.available
                    ? "bg-white/8 border-white/20 hover:border-white/30"
                    : "bg-white/3 border-white/8"
                }`}>
                  {feat.available ? (
                    <span className="absolute top-4 right-4 text-[10px] font-semibold bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                      {t.landing.featureBadgeAvailable}
                    </span>
                  ) : (
                    <span className="absolute top-4 right-4 text-[10px] font-semibold bg-white/10 text-white/40 px-2 py-0.5 rounded-full">
                      {t.landing.featureBadgeSoon}
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${feat.available ? "bg-white/15" : "bg-white/6"}`}>
                    <feat.icon className={`w-4.5 h-4.5 ${feat.available ? "text-white" : "text-white/35"}`} />
                  </div>
                  <h3 className={`text-[14px] font-semibold mb-1.5 ${feat.available ? "text-white" : "text-white/40"}`}>
                    {feat.title}
                  </h3>
                  <p className={`text-[13px] leading-relaxed ${feat.available ? "text-white/60" : "text-white/30"}`}>
                    {feat.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>

        </div>
      </section>

      {/* ─ Use Cases ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp className="text-center mb-16">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">{t.landing.useCases.sectionLabel}</p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              {t.landing.useCases.title}
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 gap-4">
            {USE_CASES.map((item, i) => (
              <FadeUp key={item.title} delay={i * 0.08}>
                <div className="flex gap-4 p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Pricing ────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">

          <FadeUp className="mb-14">
            <p className="text-[12px] font-semibold text-orange-500 uppercase tracking-widest mb-3">{t.landing.pricing.badge}</p>
            <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-[-0.02em] leading-tight text-gray-950">
              {t.landing.pricing.title}
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

            {/* ── Coluna esquerda ── */}
            <FadeUp className="space-y-8">
              <p className="text-[17px] text-gray-500 leading-relaxed">
                {t.landing.pricing.planDesc}
              </p>

              {/* Destaques */}
              <div className="space-y-4">
                {PRICING_HIGHLIGHTS.map((item) => (
                  <div key={item.title} className="flex gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{item.title}</p>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ */}
              <div className="space-y-3">
                <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">{t.landing.pricing.faqTitle}</p>
                {FAQ.map((faq) => (
                  <details key={faq.q} className="group bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none text-[14px] font-medium text-gray-800 hover:text-gray-900 transition-colors">
                      {faq.q}
                      <span className="text-gray-400 group-open:rotate-45 transition-transform duration-200 flex-shrink-0 text-lg leading-none">+</span>
                    </summary>
                    <p className="px-4 pb-4 text-[13px] text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
            </FadeUp>

            {/* ── Coluna direita: card ── */}
            <FadeUp delay={0.12}>
              <div className="rounded-2xl overflow-hidden border-2 border-gray-900 shadow-[0_8px_40px_rgba(0,0,0,0.12)]">

                {/* Header dark */}
                <div className="px-7 pt-7 pb-6 bg-gray-950">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[16px] font-bold text-white">{t.landing.pricing.planName}</span>
                    <span className="h-6 px-2.5 bg-green-500/20 border border-green-500/30 text-green-400 text-[11px] font-semibold rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      {t.landing.pricing.planTrial}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-[52px] font-extrabold text-white leading-none tracking-tight">{t.landing.pricing.planPrice}</span>
                    <span className="text-[14px] text-gray-500 mb-2">{t.landing.pricing.planPriceUnit}</span>
                  </div>
                  <p className="text-[13px] text-gray-500 mt-2">{t.landing.pricing.planNoCard}</p>
                </div>

                {/* Features */}
                <div className="px-7 pt-6 pb-2 bg-white">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">{t.landing.pricing.planIncluded}</p>
                  <ul className="space-y-2.5">
                    {PLAN_FEATURES.filter(f => !f.soon).map((feat) => (
                      <li key={feat.label} className="flex items-center gap-3 text-[14px]">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feat.label}</span>
                      </li>
                    ))}
                  </ul>

                  {PLAN_FEATURES.some(f => f.soon) && (
                    <>
                      <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider mt-5 mb-3">{t.landing.pricing.planSoon}</p>
                      <ul className="space-y-2.5">
                        {PLAN_FEATURES.filter(f => f.soon).map((feat) => (
                          <li key={feat.label} className="flex items-center gap-3 text-[14px]">
                            <Sparkles className="w-4 h-4 text-gray-300 flex-shrink-0" />
                            <span className="text-gray-400">{feat.label}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>

                {/* CTA */}
                <div className="px-7 pt-5 pb-7 bg-white">
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {t.landing.pricing.trialCta} <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-center text-[12px] text-gray-400 mt-3">
                    {t.landing.pricing.cancelNote}
                  </p>
                </div>
              </div>
            </FadeUp>

          </div>
        </div>
      </section>

      {/* ─ CTA ────────────────────────────────────────────────────────────── */}
      <section className="px-6 pb-24">
        <FadeUp>
          <div className="max-w-5xl mx-auto bg-gray-950 rounded-3xl px-8 py-16 text-center">
            <h2 className="text-[32px] sm:text-[44px] font-extrabold tracking-[-0.02em] leading-tight text-white mb-4">
              {t.landing.ctaSection.title}
            </h2>
            <p className="text-[16px] text-gray-400 mb-10 max-w-sm mx-auto">
              {t.landing.ctaSection.subtitle}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 h-12 px-8 bg-white hover:bg-gray-100 text-gray-900 text-[15px] font-semibold rounded-xl transition-colors"
            >
              {t.landing.ctaSection.button}
            </button>
          </div>
        </FadeUp>
      </section>

      {/* ─ Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-[26px] h-[26px] bg-gray-900 rounded-[8px] flex items-center justify-center flex-shrink-0">
              <Logo size={16} />
            </div>
            <span className="text-[14px] font-bold">SurveyFlow</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-5 text-[13px] text-gray-400">
            <span>© {new Date().getFullYear()} SurveyFlow</span>
            <Link href="/terms" className="hover:text-gray-700 transition-colors">{t.landing.footer.terms}</Link>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">{t.landing.footer.privacy}</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
