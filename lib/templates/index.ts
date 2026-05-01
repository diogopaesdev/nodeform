import type { SurveyNode, SurveyEdge } from "@/types/survey";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SurveyTemplate {
  id: string;
  segment: string;
  title: string;
  description: string;
  complexity: "basic" | "intermediate" | "advanced";
  languages?: string[];
  nodes: SurveyNode[];
  edges: SurveyEdge[];
}

export const SEGMENT_LABELS: Record<string, string> = {
  "clinicas-esteticas": "Clínicas Estéticas",
  "imobiliarias": "Imobiliárias",
  "pesquisa-de-mercado": "Pesquisa de Mercado",
  "infoprodutores": "Infoprodutores",
  "healthcare": "Healthcare",
  "eventos": "Eventos",
  "recrutamento": "Recrutamento",
  "marketing": "Marketing",
  "empresas": "Empresas",
};

export const COMPLEXITY_LABELS: Record<SurveyTemplate["complexity"], string> = {
  basic: "Básico",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  pt: "PT",
  en: "EN",
  es: "ES",
};

// ─── Clone helper ─────────────────────────────────────────────────────────────

export function cloneTemplate(template: SurveyTemplate): {
  nodes: SurveyNode[];
  edges: SurveyEdge[];
  title: string;
} {
  const ts = Date.now();
  const idMap = new Map<string, string>();

  const nodes = template.nodes.map((n, i) => {
    const newId = `node_${ts}_${i}`;
    idMap.set(n.id, newId);
    return { ...n, id: newId };
  });

  const edges = template.edges.map((e, i) => ({
    ...e,
    id: `edge_${ts}_${i}`,
    source: idMap.get(e.source)!,
    target: idMap.get(e.target)!,
  }));

  return { nodes, edges, title: template.title };
}

// ─── Edge helpers ─────────────────────────────────────────────────────────────

function sc(src: string, tgt: string, optionIds: string[]): SurveyEdge[] {
  return optionIds.map((optId, i) =>
    ({
      id: `tpl_e_${src}_${tgt}_${i}`,
      source: src,
      target: tgt,
      sourceHandle: optId,
      targetHandle: "target",
      data: { optionId: optId },
    } as SurveyEdge)
  );
}

function seq(src: string, tgt: string): SurveyEdge {
  return {
    id: `tpl_e_${src}_${tgt}`,
    source: src,
    target: tgt,
    sourceHandle: "source",
    targetHandle: "target",
    data: {},
  } as SurveyEdge;
}

// ══════════════════════════════════════════════════════════════════════════════
// BÁSICOS (6)
// ══════════════════════════════════════════════════════════════════════════════

const clinicasEsteticasTriagem: SurveyTemplate = {
  id: "clinicas-esteticas-triagem",
  segment: "clinicas-esteticas",
  title: "Triagem de Pacientes",
  description: "Qualifica leads antes do primeiro contato — procedimento, histórico e disponibilidade.",
  complexity: "basic",
  nodes: [
    { id: "ce_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Bem-vindo à nossa triagem", description: "Preencha em 1 minuto e nossa equipe entra em contato com as melhores opções para você.", buttonText: "Começar", collectName: true, collectEmail: true, nameRequired: true } },
    { id: "ce_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual procedimento você tem interesse?", options: [
        { id: "ce_n2_o1", label: "Harmonização facial" },
        { id: "ce_n2_o2", label: "Limpeza de pele" },
        { id: "ce_n2_o3", label: "Laser / fototerapia" },
        { id: "ce_n2_o4", label: "Outro procedimento" },
      ] } },
    { id: "ce_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Você já realizou algum procedimento estético antes?", options: [
        { id: "ce_n3_o1", label: "Sim, tenho experiência" },
        { id: "ce_n3_o2", label: "Não, seria minha primeira vez" },
      ] } },
    { id: "ce_n4", type: "singleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "singleChoice", title: "Qual a sua disponibilidade preferida?", options: [
        { id: "ce_n4_o1", label: "Manhã" },
        { id: "ce_n4_o2", label: "Tarde" },
        { id: "ce_n4_o3", label: "Noite" },
        { id: "ce_n4_o4", label: "Qualquer horário" },
      ] } },
    { id: "ce_n5", type: "textInput", position: { x: 400, y: 880 }, width: 320,
      data: { type: "textInput", title: "Informe seu telefone ou WhatsApp", placeholder: "(11) 9 0000-0000", required: true } },
    { id: "ce_n6", type: "endScreen", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "endScreen", title: "Recebemos sua solicitação!", description: "Nossa equipe entrará em contato em até 24h para confirmar seu horário." } },
  ] as SurveyNode[],
  edges: [
    seq("ce_n1", "ce_n2"),
    ...sc("ce_n2", "ce_n3", ["ce_n2_o1", "ce_n2_o2", "ce_n2_o3", "ce_n2_o4"]),
    ...sc("ce_n3", "ce_n4", ["ce_n3_o1", "ce_n3_o2"]),
    ...sc("ce_n4", "ce_n5", ["ce_n4_o1", "ce_n4_o2", "ce_n4_o3", "ce_n4_o4"]),
    seq("ce_n5", "ce_n6"),
  ],
};

const imobiliariasQualificacao: SurveyTemplate = {
  id: "imobiliarias-qualificacao",
  segment: "imobiliarias",
  title: "Qualificação de Lead",
  description: "Segmenta leads por intenção, perfil de imóvel e urgência para priorizar o corretor.",
  complexity: "basic",
  nodes: [
    { id: "im_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Encontre o imóvel ideal", description: "Responda algumas perguntas rápidas e um corretor especializado entrará em contato.", buttonText: "Quero ver opções", collectName: true, collectEmail: true, nameRequired: true } },
    { id: "im_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Você busca comprar ou alugar?", options: [
        { id: "im_n2_o1", label: "Comprar" }, { id: "im_n2_o2", label: "Alugar" },
      ] } },
    { id: "im_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Qual tipo de imóvel?", options: [
        { id: "im_n3_o1", label: "Apartamento" }, { id: "im_n3_o2", label: "Casa" },
        { id: "im_n3_o3", label: "Comercial" }, { id: "im_n3_o4", label: "Terreno" },
      ] } },
    { id: "im_n4", type: "singleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "singleChoice", title: "Qual a sua faixa de valor?", options: [
        { id: "im_n4_o1", label: "Até R$ 300 mil" }, { id: "im_n4_o2", label: "R$ 300 mil – R$ 600 mil" },
        { id: "im_n4_o3", label: "R$ 600 mil – R$ 1 mi" }, { id: "im_n4_o4", label: "Acima de R$ 1 mi" },
      ] } },
    { id: "im_n5", type: "singleChoice", position: { x: 400, y: 880 }, width: 320,
      data: { type: "singleChoice", title: "Qual a sua urgência?", options: [
        { id: "im_n5_o1", label: "Imediata (até 30 dias)" }, { id: "im_n5_o2", label: "Curto prazo (até 3 meses)" },
        { id: "im_n5_o3", label: "Sem pressa (6 meses+)" },
      ] } },
    { id: "im_n6", type: "textInput", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "textInput", title: "Qual bairro ou região você prefere?", placeholder: "Ex: Pinheiros, Barra da Tijuca..." } },
    { id: "im_n7", type: "endScreen", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "endScreen", title: "Perfeito! Um corretor vai entrar em contato", description: "Selecionaremos os melhores imóveis para o seu perfil." } },
  ] as SurveyNode[],
  edges: [
    seq("im_n1", "im_n2"), ...sc("im_n2", "im_n3", ["im_n2_o1", "im_n2_o2"]),
    ...sc("im_n3", "im_n4", ["im_n3_o1", "im_n3_o2", "im_n3_o3", "im_n3_o4"]),
    ...sc("im_n4", "im_n5", ["im_n4_o1", "im_n4_o2", "im_n4_o3", "im_n4_o4"]),
    ...sc("im_n5", "im_n6", ["im_n5_o1", "im_n5_o2", "im_n5_o3"]), seq("im_n6", "im_n7"),
  ],
};

const pesquisaMercadoHabitos: SurveyTemplate = {
  id: "pesquisa-mercado-habitos",
  segment: "pesquisa-de-mercado",
  title: "Hábitos do Consumidor",
  description: "Coleta dados quantitativos e qualitativos sobre comportamento de compra.",
  complexity: "basic",
  nodes: [
    { id: "pm_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Pesquisa rápida — 2 minutos", description: "Sua opinião nos ajuda a entender melhor o mercado.", buttonText: "Participar", collectName: false, collectEmail: true, emailRequired: false } },
    { id: "pm_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual a sua faixa etária?", options: [
        { id: "pm_n2_o1", label: "18–24 anos" }, { id: "pm_n2_o2", label: "25–34 anos" },
        { id: "pm_n2_o3", label: "35–44 anos" }, { id: "pm_n2_o4", label: "45–54 anos" }, { id: "pm_n2_o5", label: "55+ anos" },
      ] } },
    { id: "pm_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Com que frequência você compra nessa categoria?", options: [
        { id: "pm_n3_o1", label: "Semanalmente" }, { id: "pm_n3_o2", label: "Mensalmente" },
        { id: "pm_n3_o3", label: "A cada 3 meses" }, { id: "pm_n3_o4", label: "Raramente" },
      ] } },
    { id: "pm_n4", type: "multipleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "multipleChoice", title: "O que mais influencia sua decisão de compra?", options: [
        { id: "pm_n4_o1", label: "Preço" }, { id: "pm_n4_o2", label: "Qualidade" },
        { id: "pm_n4_o3", label: "Indicação" }, { id: "pm_n4_o4", label: "Marca" }, { id: "pm_n4_o5", label: "Conveniência" },
      ] } },
    { id: "pm_n5", type: "rating", position: { x: 400, y: 880 }, width: 320,
      data: { type: "rating", title: "Qual seu nível de satisfação com o produto que usa hoje?", minValue: 1, maxValue: 5, minLabel: "Insatisfeito", maxLabel: "Muito satisfeito" } },
    { id: "pm_n6", type: "textInput", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "textInput", title: "Tem alguma sugestão ou comentário?", isLong: true, required: false, placeholder: "Escreva à vontade..." } },
    { id: "pm_n7", type: "endScreen", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "endScreen", title: "Obrigado pela sua participação!", description: "Suas respostas são muito importantes para nós." } },
  ] as SurveyNode[],
  edges: [
    seq("pm_n1", "pm_n2"),
    ...sc("pm_n2", "pm_n3", ["pm_n2_o1", "pm_n2_o2", "pm_n2_o3", "pm_n2_o4", "pm_n2_o5"]),
    ...sc("pm_n3", "pm_n4", ["pm_n3_o1", "pm_n3_o2", "pm_n3_o3", "pm_n3_o4"]),
    seq("pm_n4", "pm_n5"), seq("pm_n5", "pm_n6"), seq("pm_n6", "pm_n7"),
  ],
};

const infoprodutoresDiagnostico: SurveyTemplate = {
  id: "infoprodutores-diagnostico",
  segment: "infoprodutores",
  title: "Diagnóstico do Público",
  description: "Entende nível, dores e objetivos da audiência para segmentar e personalizar comunicação.",
  complexity: "basic",
  nodes: [
    { id: "ip_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Diagnóstico gratuito", description: "Responda 5 perguntas e receba conteúdo personalizado para o seu momento.", buttonText: "Fazer meu diagnóstico", collectName: true, collectEmail: true, nameRequired: true, emailRequired: true } },
    { id: "ip_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual o seu maior desafio hoje?", options: [
        { id: "ip_n2_o1", label: "Gerar audiência" }, { id: "ip_n2_o2", label: "Converter vendas" },
        { id: "ip_n2_o3", label: "Criar conteúdo consistente" }, { id: "ip_n2_o4", label: "Escalar minha receita" },
      ] } },
    { id: "ip_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Em qual nível você se encontra?", options: [
        { id: "ip_n3_o1", label: "Iniciante (começando do zero)" },
        { id: "ip_n3_o2", label: "Intermediário (já tenho resultados)" },
        { id: "ip_n3_o3", label: "Avançado (quero escalar)" },
      ] } },
    { id: "ip_n4", type: "multipleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "multipleChoice", title: "Quais ferramentas você já usa?", options: [
        { id: "ip_n4_o1", label: "Instagram / TikTok" }, { id: "ip_n4_o2", label: "YouTube" },
        { id: "ip_n4_o3", label: "E-mail marketing" }, { id: "ip_n4_o4", label: "Tráfego pago" },
        { id: "ip_n4_o5", label: "Nenhuma ainda" },
      ] } },
    { id: "ip_n5", type: "singleChoice", position: { x: 400, y: 880 }, width: 320,
      data: { type: "singleChoice", title: "Qual o seu objetivo nos próximos 3 meses?", options: [
        { id: "ip_n5_o1", label: "Lançar meu primeiro produto" }, { id: "ip_n5_o2", label: "Dobrar minha receita" },
        { id: "ip_n5_o3", label: "Construir minha audiência" }, { id: "ip_n5_o4", label: "Automatizar meu negócio" },
      ] } },
    { id: "ip_n6", type: "textInput", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "textInput", title: "O que te impede de alcançar esse objetivo?", isLong: true, placeholder: "Seja específico — isso personaliza sua jornada" } },
    { id: "ip_n7", type: "endScreen", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "endScreen", title: "Diagnóstico recebido!", description: "Analisaremos suas respostas e enviaremos conteúdo personalizado para você." } },
  ] as SurveyNode[],
  edges: [
    seq("ip_n1", "ip_n2"), ...sc("ip_n2", "ip_n3", ["ip_n2_o1", "ip_n2_o2", "ip_n2_o3", "ip_n2_o4"]),
    ...sc("ip_n3", "ip_n4", ["ip_n3_o1", "ip_n3_o2", "ip_n3_o3"]),
    seq("ip_n4", "ip_n5"),
    ...sc("ip_n5", "ip_n6", ["ip_n5_o1", "ip_n5_o2", "ip_n5_o3", "ip_n5_o4"]),
    seq("ip_n6", "ip_n7"),
  ],
};

const healthcareTriagem: SurveyTemplate = {
  id: "healthcare-triagem-clinica",
  segment: "healthcare",
  title: "Triagem Clínica",
  description: "Coleta dados do paciente antes da consulta para direcionar ao especialista correto.",
  complexity: "basic",
  nodes: [
    { id: "hc_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Triagem clínica", description: "Preencha antes da consulta para agilizar seu atendimento.", buttonText: "Iniciar triagem", collectName: true, collectEmail: true, nameRequired: true, collectTerms: true, termsRequired: true, termsText: "Aceito o uso dos meus dados conforme a LGPD" } },
    { id: "hc_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual o principal motivo da consulta?", options: [
        { id: "hc_n2_o1", label: "Acompanhamento de rotina" }, { id: "hc_n2_o2", label: "Sintoma novo" },
        { id: "hc_n2_o3", label: "Retorno" }, { id: "hc_n2_o4", label: "Segunda opinião" },
      ] } },
    { id: "hc_n3", type: "multipleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "multipleChoice", title: "Você apresenta algum destes sintomas?", options: [
        { id: "hc_n3_o1", label: "Dor persistente" }, { id: "hc_n3_o2", label: "Fadiga / cansaço" },
        { id: "hc_n3_o3", label: "Alterações de humor" }, { id: "hc_n3_o4", label: "Insônia" },
        { id: "hc_n3_o5", label: "Nenhum dos acima" },
      ] } },
    { id: "hc_n4", type: "singleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "singleChoice", title: "Já realizou tratamento para este problema antes?", options: [
        { id: "hc_n4_o1", label: "Sim, com boa resposta" }, { id: "hc_n4_o2", label: "Sim, sem melhora significativa" },
        { id: "hc_n4_o3", label: "Não, é a primeira vez" },
      ] } },
    { id: "hc_n5", type: "rating", position: { x: 400, y: 880 }, width: 320,
      data: { type: "rating", title: "Como você avalia seu estado de saúde geral?", minValue: 1, maxValue: 10, minLabel: "Muito ruim", maxLabel: "Excelente" } },
    { id: "hc_n6", type: "textInput", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "textInput", title: "Descreva brevemente seu histórico médico relevante", isLong: true, placeholder: "Cirurgias, alergias, medicamentos em uso..." } },
    { id: "hc_n7", type: "endScreen", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "endScreen", title: "Triagem concluída", description: "Suas informações foram registradas. O profissional revisará antes da consulta." } },
  ] as SurveyNode[],
  edges: [
    seq("hc_n1", "hc_n2"),
    ...sc("hc_n2", "hc_n3", ["hc_n2_o1", "hc_n2_o2", "hc_n2_o3", "hc_n2_o4"]),
    seq("hc_n3", "hc_n4"),
    ...sc("hc_n4", "hc_n5", ["hc_n4_o1", "hc_n4_o2", "hc_n4_o3"]),
    seq("hc_n5", "hc_n6"), seq("hc_n6", "hc_n7"),
  ],
};

const eventosInscricao: SurveyTemplate = {
  id: "eventos-inscricao",
  segment: "eventos",
  title: "Inscrição no Evento",
  description: "Captura inscrições com dados de segmentação para personalizar comunicação pré-evento.",
  complexity: "basic",
  nodes: [
    { id: "ev_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Inscrição no evento", description: "Garanta sua vaga e nos conte um pouco sobre você.", buttonText: "Garantir minha vaga", collectName: true, collectEmail: true, nameRequired: true, emailRequired: true } },
    { id: "ev_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual o seu perfil profissional?", options: [
        { id: "ev_n2_o1", label: "Empresário / Empreendedor" }, { id: "ev_n2_o2", label: "Profissional CLT" },
        { id: "ev_n2_o3", label: "Freelancer / Autônomo" }, { id: "ev_n2_o4", label: "Estudante" },
      ] } },
    { id: "ev_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Qual o principal motivo para participar?", options: [
        { id: "ev_n3_o1", label: "Networking" }, { id: "ev_n3_o2", label: "Aprendizado e capacitação" },
        { id: "ev_n3_o3", label: "Fechar negócios" }, { id: "ev_n3_o4", label: "Conhecer os palestrantes" },
      ] } },
    { id: "ev_n4", type: "multipleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "multipleChoice", title: "Quais temas mais te interessam?", options: [
        { id: "ev_n4_o1", label: "Marketing" }, { id: "ev_n4_o2", label: "Tecnologia" },
        { id: "ev_n4_o3", label: "Finanças" }, { id: "ev_n4_o4", label: "Liderança" }, { id: "ev_n4_o5", label: "Vendas" },
      ] } },
    { id: "ev_n5", type: "singleChoice", position: { x: 400, y: 880 }, width: 320,
      data: { type: "singleChoice", title: "Como ficou sabendo do evento?", options: [
        { id: "ev_n5_o1", label: "Instagram" }, { id: "ev_n5_o2", label: "Indicação de amigo" },
        { id: "ev_n5_o3", label: "E-mail" }, { id: "ev_n5_o4", label: "LinkedIn" },
      ] } },
    { id: "ev_n6", type: "textInput", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "textInput", title: "Alguma necessidade especial ou observação?", required: false, placeholder: "Acessibilidade, restrição alimentar, etc." } },
    { id: "ev_n7", type: "endScreen", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "endScreen", title: "Inscrição confirmada!", description: "Você receberá um e-mail com todos os detalhes. Até lá!" } },
  ] as SurveyNode[],
  edges: [
    seq("ev_n1", "ev_n2"), ...sc("ev_n2", "ev_n3", ["ev_n2_o1", "ev_n2_o2", "ev_n2_o3", "ev_n2_o4"]),
    ...sc("ev_n3", "ev_n4", ["ev_n3_o1", "ev_n3_o2", "ev_n3_o3", "ev_n3_o4"]),
    seq("ev_n4", "ev_n5"),
    ...sc("ev_n5", "ev_n6", ["ev_n5_o1", "ev_n5_o2", "ev_n5_o3", "ev_n5_o4"]),
    seq("ev_n6", "ev_n7"),
  ],
};

// ══════════════════════════════════════════════════════════════════════════════
// INTERMEDIÁRIOS & AVANÇADOS (6)
// ══════════════════════════════════════════════════════════════════════════════

// ─── 7. Ficha de Anamnese Completa ────────────────────────────────────────────
// Branch: tem doença crônica? Sim → n4 → n5; Não → n5 direto
// Branch: usa medicamentos?   Sim → n7 → n8; Não → n8 direto

const anamneseCompleta: SurveyTemplate = {
  id: "healthcare-anamnese-completa",
  segment: "healthcare",
  title: "Ficha de Anamnese Completa",
  description: "Anamnese detalhada com branching real: doenças crônicas e medicamentos abrem perguntas específicas.",
  complexity: "advanced",
  nodes: [
    { id: "an_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Ficha de anamnese", description: "Preencha com atenção — essas informações orientam seu atendimento.", buttonText: "Começar", collectName: true, collectEmail: true, nameRequired: true, collectTerms: true, termsRequired: true, termsText: "Autorizo o uso dos meus dados de saúde conforme a LGPD" } },
    { id: "an_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual o motivo principal desta consulta?", options: [
        { id: "an_n2_o1", label: "Consulta de rotina / check-up" },
        { id: "an_n2_o2", label: "Sintoma ou queixa específica" },
        { id: "an_n2_o3", label: "Retorno / acompanhamento" },
        { id: "an_n2_o4", label: "Exame ou procedimento solicitado" },
      ] } },
    // Branch 1: doença crônica
    { id: "an_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Você possui alguma doença crônica diagnosticada?", options: [
        { id: "an_n3_o1", label: "Sim" },
        { id: "an_n3_o2", label: "Não" },
      ] } },
    { id: "an_n4", type: "multipleChoice", position: { x: 0, y: 660 }, width: 320,
      data: { type: "multipleChoice", title: "Quais condições você possui? (marque todas que se aplicam)", options: [
        { id: "an_n4_o1", label: "Diabetes" }, { id: "an_n4_o2", label: "Hipertensão" },
        { id: "an_n4_o3", label: "Cardiopatia" }, { id: "an_n4_o4", label: "Doença respiratória (asma, DPOC)" },
        { id: "an_n4_o5", label: "Doença autoimune" }, { id: "an_n4_o6", label: "Outra" },
      ] } },
    { id: "an_n5", type: "multipleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "multipleChoice", title: "Você possui alguma alergia conhecida?", options: [
        { id: "an_n5_o1", label: "Medicamentos (ex: penicilina, AAS)" },
        { id: "an_n5_o2", label: "Alimentos" }, { id: "an_n5_o3", label: "Látex" },
        { id: "an_n5_o4", label: "Contraste / anestésico" }, { id: "an_n5_o5", label: "Nenhuma conhecida" },
      ] } },
    // Branch 2: medicamentos
    { id: "an_n6", type: "singleChoice", position: { x: 400, y: 880 }, width: 320,
      data: { type: "singleChoice", title: "Você faz uso de algum medicamento regularmente?", options: [
        { id: "an_n6_o1", label: "Sim" },
        { id: "an_n6_o2", label: "Não" },
      ] } },
    { id: "an_n7", type: "textInput", position: { x: 0, y: 1100 }, width: 320,
      data: { type: "textInput", title: "Informe os medicamentos em uso", description: "Nome, dosagem e frequência, se possível.", isLong: true, placeholder: "Ex: Metformina 850mg 2x/dia, Losartana 50mg 1x/dia..." } },
    { id: "an_n8", type: "rating", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "rating", title: "Como você avalia seu estado de saúde geral neste momento?", minValue: 1, maxValue: 10, minLabel: "Muito ruim", maxLabel: "Excelente" } },
    { id: "an_n9", type: "textInput", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "textInput", title: "Descreva sua queixa principal", description: "Seja o mais específico possível — localização, intensidade, quando começou.", isLong: true, placeholder: "Ex: Dor lombar há 2 semanas, piora ao levantar..." } },
    { id: "an_n10", type: "endScreen", position: { x: 400, y: 1540 }, width: 320,
      data: { type: "endScreen", title: "Anamnese concluída", description: "O profissional revisará suas informações antes do atendimento. Obrigado!" } },
  ] as SurveyNode[],
  edges: [
    seq("an_n1", "an_n2"),
    ...sc("an_n2", "an_n3", ["an_n2_o1", "an_n2_o2", "an_n2_o3", "an_n2_o4"]),
    // Branch doença crônica: Sim → an_n4 → an_n5; Não → an_n5
    ...sc("an_n3", "an_n4", ["an_n3_o1"]),
    ...sc("an_n3", "an_n5", ["an_n3_o2"]),
    seq("an_n4", "an_n5"),
    // Branch medicamentos: Sim → an_n7 → an_n8; Não → an_n8
    seq("an_n5", "an_n6"),
    ...sc("an_n6", "an_n7", ["an_n6_o1"]),
    ...sc("an_n6", "an_n8", ["an_n6_o2"]),
    seq("an_n7", "an_n8"),
    seq("an_n8", "an_n9"),
    seq("an_n9", "an_n10"),
  ],
};

// ─── 8. Evento Multilíngue (PT / EN / ES) ─────────────────────────────────────
// Node 1: presentation (neutral)
// Node 2: language selector → 3 branches
// Branches PT/EN/ES: origem + área profissional
// Convergem no endScreen

const eventoMultilingue: SurveyTemplate = {
  id: "eventos-multilingue",
  segment: "eventos",
  title: "Evento Multilíngue",
  description: "O participante escolhe o idioma e responde em PT, EN ou ES. Perfeito para eventos internacionais.",
  complexity: "advanced",
  languages: ["pt", "en", "es"],
  nodes: [
    { id: "ml_n1", type: "presentation", position: { x: 600, y: 0 }, width: 320,
      data: { type: "presentation", title: "Bem-vindo · Welcome · Bienvenido", description: "Selecione seu idioma para continuar.\nPlease select your language to continue.\nSeleccione su idioma para continuar.", buttonText: "Continuar →", collectName: true, collectEmail: true, nameRequired: true, emailRequired: true } },
    { id: "ml_n2", type: "singleChoice", position: { x: 600, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Selecione seu idioma · Select your language · Seleccione su idioma", options: [
        { id: "ml_n2_o1", label: "🇧🇷 Português" },
        { id: "ml_n2_o2", label: "🇺🇸 English" },
        { id: "ml_n2_o3", label: "🇪🇸 Español" },
      ] } },
    // Branch PT
    { id: "ml_n3_pt", type: "singleChoice", position: { x: 0, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Qual é o seu país de origem?", options: [
        { id: "ml_pt_o1", label: "Brasil" }, { id: "ml_pt_o2", label: "Argentina" },
        { id: "ml_pt_o3", label: "Portugal" }, { id: "ml_pt_o4", label: "Outro país" },
      ] } },
    { id: "ml_n4_pt", type: "textInput", position: { x: 0, y: 660 }, width: 320,
      data: { type: "textInput", title: "Qual cidade e estado você representa?", placeholder: "Ex: São Paulo, SP" } },
    // Branch EN
    { id: "ml_n3_en", type: "singleChoice", position: { x: 600, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "What is your country of origin?", options: [
        { id: "ml_en_o1", label: "United States" }, { id: "ml_en_o2", label: "United Kingdom" },
        { id: "ml_en_o3", label: "Canada" }, { id: "ml_en_o4", label: "Other country" },
      ] } },
    { id: "ml_n4_en", type: "textInput", position: { x: 600, y: 660 }, width: 320,
      data: { type: "textInput", title: "Which city and state/region are you from?", placeholder: "Ex: New York, NY" } },
    // Branch ES
    { id: "ml_n3_es", type: "singleChoice", position: { x: 1200, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "¿Cuál es tu país de origen?", options: [
        { id: "ml_es_o1", label: "México" }, { id: "ml_es_o2", label: "Colombia" },
        { id: "ml_es_o3", label: "Argentina" }, { id: "ml_es_o4", label: "Otro país" },
      ] } },
    { id: "ml_n4_es", type: "textInput", position: { x: 1200, y: 660 }, width: 320,
      data: { type: "textInput", title: "¿De qué ciudad y estado/región eres?", placeholder: "Ej: Ciudad de México, CDMX" } },
    // Convergência
    { id: "ml_end", type: "endScreen", position: { x: 600, y: 880 }, width: 320,
      data: { type: "endScreen", title: "Obrigado! · Thank you! · ¡Gracias!", description: "Sua inscrição foi confirmada. Você receberá mais detalhes em breve.\nYour registration is confirmed. You will receive details shortly.\nTu inscripción está confirmada. Recibirás más detalles pronto." } },
  ] as SurveyNode[],
  edges: [
    seq("ml_n1", "ml_n2"),
    // Language branching
    ...sc("ml_n2", "ml_n3_pt", ["ml_n2_o1"]),
    ...sc("ml_n2", "ml_n3_en", ["ml_n2_o2"]),
    ...sc("ml_n2", "ml_n3_es", ["ml_n2_o3"]),
    // PT flow
    ...sc("ml_n3_pt", "ml_n4_pt", ["ml_pt_o1", "ml_pt_o2", "ml_pt_o3", "ml_pt_o4"]),
    seq("ml_n4_pt", "ml_end"),
    // EN flow
    ...sc("ml_n3_en", "ml_n4_en", ["ml_en_o1", "ml_en_o2", "ml_en_o3", "ml_en_o4"]),
    seq("ml_n4_en", "ml_end"),
    // ES flow
    ...sc("ml_n3_es", "ml_n4_es", ["ml_es_o1", "ml_es_o2", "ml_es_o3", "ml_es_o4"]),
    seq("ml_n4_es", "ml_end"),
  ],
};

// ─── 9. NPS com Follow-up Condicional ────────────────────────────────────────
// Detratores (0-6) → "O que podemos melhorar?"
// Neutros (7-8)    → "O que mais gostou?"
// Promotores (9-10)→ "Como nos indicaria?"

const npsCondicional: SurveyTemplate = {
  id: "nps-condicional",
  segment: "pesquisa-de-mercado",
  title: "NPS com Follow-up Condicional",
  description: "Nota 0–6 abre pergunta de resgate; 7–8 busca o que gostou; 9–10 pergunta como indicaria.",
  complexity: "intermediate",
  nodes: [
    { id: "nps_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Sua opinião vale muito", description: "Responda 2 perguntas rápidas — leva menos de 1 minuto.", buttonText: "Responder", collectName: false, collectEmail: true, emailRequired: false } },
    { id: "nps_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Em uma escala de 0 a 10, o quanto você nos recomendaria?", description: "0 = jamais recomendaria · 10 = com certeza recomendaria", options: [
        { id: "nps_o_det", label: "0 a 6 — Não estou satisfeito" },
        { id: "nps_o_pas", label: "7 ou 8 — Estou satisfeito, mas poderia melhorar" },
        { id: "nps_o_pro", label: "9 ou 10 — Estou muito satisfeito!" },
      ] } },
    // Branches
    { id: "nps_n3_det", type: "textInput", position: { x: 0, y: 440 }, width: 320,
      data: { type: "textInput", title: "Lamentamos. O que podemos melhorar para você?", isLong: true, placeholder: "Seja específico — sua resposta vai direto para nosso time." } },
    { id: "nps_n3_pas", type: "textInput", position: { x: 400, y: 440 }, width: 320,
      data: { type: "textInput", title: "Boa! O que mais gostou e o que poderia ter sido melhor?", isLong: true, placeholder: "Qualquer detalhe ajuda..." } },
    { id: "nps_n3_pro", type: "textInput", position: { x: 800, y: 440 }, width: 320,
      data: { type: "textInput", title: "Incrível! Como você nos descreveria para um amigo?", isLong: true, placeholder: "Pode usar suas palavras..." } },
    { id: "nps_end", type: "endScreen", position: { x: 400, y: 660 }, width: 320,
      data: { type: "endScreen", title: "Obrigado pelo feedback!", description: "Sua resposta foi registrada e será revisada pelo nosso time." } },
  ] as SurveyNode[],
  edges: [
    seq("nps_n1", "nps_n2"),
    ...sc("nps_n2", "nps_n3_det", ["nps_o_det"]),
    ...sc("nps_n2", "nps_n3_pas", ["nps_o_pas"]),
    ...sc("nps_n2", "nps_n3_pro", ["nps_o_pro"]),
    seq("nps_n3_det", "nps_end"),
    seq("nps_n3_pas", "nps_end"),
    seq("nps_n3_pro", "nps_end"),
  ],
};

// ─── 10. Pré-seleção de Candidatos ───────────────────────────────────────────

const selecaoCandidatos: SurveyTemplate = {
  id: "recrutamento-selecao-candidatos",
  segment: "recrutamento",
  title: "Pré-seleção de Candidatos",
  description: "Filtra candidatos antes da entrevista — cargo, nível, disponibilidade e habilidades-chave.",
  complexity: "intermediate",
  nodes: [
    { id: "rc_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Formulário de candidatura", description: "Preencha com atenção — usaremos suas respostas para agendar a entrevista.", buttonText: "Começar candidatura", collectName: true, collectEmail: true, nameRequired: true, emailRequired: true } },
    { id: "rc_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Para qual área você está se candidatando?", options: [
        { id: "rc_n2_o1", label: "Tecnologia / Desenvolvimento" }, { id: "rc_n2_o2", label: "Design / UX" },
        { id: "rc_n2_o3", label: "Marketing / Conteúdo" }, { id: "rc_n2_o4", label: "Comercial / Vendas" },
        { id: "rc_n2_o5", label: "Operações / Financeiro" },
      ] } },
    { id: "rc_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Qual o seu nível de senioridade?", options: [
        { id: "rc_n3_o1", label: "Júnior (até 2 anos de experiência)" },
        { id: "rc_n3_o2", label: "Pleno (2–5 anos)" },
        { id: "rc_n3_o3", label: "Sênior (5+ anos)" },
        { id: "rc_n3_o4", label: "Especialista / Líder" },
      ] } },
    { id: "rc_n4", type: "singleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "singleChoice", title: "Você tem disponibilidade para início imediato?", options: [
        { id: "rc_n4_o1", label: "Sim, posso começar imediatamente" },
        { id: "rc_n4_o2", label: "Precisaria de até 30 dias (aviso prévio)" },
        { id: "rc_n4_o3", label: "Precisaria de mais de 30 dias" },
      ] } },
    { id: "rc_n5", type: "multipleChoice", position: { x: 400, y: 880 }, width: 320,
      data: { type: "multipleChoice", title: "Qual o seu modelo de trabalho preferido?", options: [
        { id: "rc_n5_o1", label: "Presencial" }, { id: "rc_n5_o2", label: "Híbrido" },
        { id: "rc_n5_o3", label: "100% remoto" },
      ] } },
    { id: "rc_n6", type: "rating", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "rating", title: "Como você avalia seu nível de inglês?", minValue: 1, maxValue: 5, minLabel: "Básico", maxLabel: "Fluente / Nativo" } },
    { id: "rc_n7", type: "textInput", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "textInput", title: "Descreva o maior desafio profissional que você já resolveu", description: "Em 2–4 frases. Foque no problema, na sua ação e no resultado.", isLong: true, placeholder: "Ex: Liderei a migração de 300k registros com zero downtime..." } },
    { id: "rc_n8", type: "endScreen", position: { x: 400, y: 1540 }, width: 320,
      data: { type: "endScreen", title: "Candidatura recebida!", description: "Analisaremos suas respostas e entraremos em contato em até 5 dias úteis." } },
  ] as SurveyNode[],
  edges: [
    seq("rc_n1", "rc_n2"),
    ...sc("rc_n2", "rc_n3", ["rc_n2_o1", "rc_n2_o2", "rc_n2_o3", "rc_n2_o4", "rc_n2_o5"]),
    ...sc("rc_n3", "rc_n4", ["rc_n3_o1", "rc_n3_o2", "rc_n3_o3", "rc_n3_o4"]),
    ...sc("rc_n4", "rc_n5", ["rc_n4_o1", "rc_n4_o2", "rc_n4_o3"]),
    seq("rc_n5", "rc_n6"), seq("rc_n6", "rc_n7"), seq("rc_n7", "rc_n8"),
  ],
};

// ─── 11. Quiz de Lead Scoring ────────────────────────────────────────────────

const quizLeadScoring: SurveyTemplate = {
  id: "marketing-quiz-lead-scoring",
  segment: "marketing",
  title: "Quiz de Lead Scoring",
  description: "Cada resposta tem score — o endScreen classifica o lead automaticamente (frio/morno/quente).",
  complexity: "intermediate",
  nodes: [
    { id: "ls_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Descubra o seu perfil", description: "Responda 5 perguntas e veja qual solução se encaixa melhor para você.", buttonText: "Fazer o quiz", collectName: true, collectEmail: true, nameRequired: true, emailRequired: true } },
    { id: "ls_n2", type: "singleChoice", position: { x: 400, y: 220 }, width: 320,
      data: { type: "singleChoice", title: "Qual o porte da sua empresa?", options: [
        { id: "ls_n2_o1", label: "MEI / Autônomo", score: 1 },
        { id: "ls_n2_o2", label: "Pequena (2–49 funcionários)", score: 2 },
        { id: "ls_n2_o3", label: "Média (50–499 funcionários)", score: 3 },
        { id: "ls_n2_o4", label: "Grande (500+ funcionários)", score: 4 },
      ] } },
    { id: "ls_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "Qual é o seu cargo?", options: [
        { id: "ls_n3_o1", label: "Analista / Assistente", score: 1 },
        { id: "ls_n3_o2", label: "Gerente / Coordenador", score: 2 },
        { id: "ls_n3_o3", label: "Diretor / VP", score: 3 },
        { id: "ls_n3_o4", label: "CEO / Sócio-fundador", score: 4 },
      ] } },
    { id: "ls_n4", type: "singleChoice", position: { x: 400, y: 660 }, width: 320,
      data: { type: "singleChoice", title: "Você tem orçamento definido para este projeto?", options: [
        { id: "ls_n4_o1", label: "Ainda não definimos", score: 1 },
        { id: "ls_n4_o2", label: "Sim, até R$ 5 mil", score: 2 },
        { id: "ls_n4_o3", label: "Sim, entre R$ 5 mil e R$ 20 mil", score: 3 },
        { id: "ls_n4_o4", label: "Sim, acima de R$ 20 mil", score: 4 },
      ] } },
    { id: "ls_n5", type: "singleChoice", position: { x: 400, y: 880 }, width: 320,
      data: { type: "singleChoice", title: "Qual a sua urgência para implementar a solução?", options: [
        { id: "ls_n5_o1", label: "Sem urgência definida", score: 1 },
        { id: "ls_n5_o2", label: "Nos próximos 6 meses", score: 2 },
        { id: "ls_n5_o3", label: "Nos próximos 90 dias", score: 3 },
        { id: "ls_n5_o4", label: "Imediata — precisamos resolver já", score: 4 },
      ] } },
    { id: "ls_n6", type: "textInput", position: { x: 400, y: 1100 }, width: 320,
      data: { type: "textInput", title: "Descreva brevemente sua necessidade ou desafio atual", isLong: true, placeholder: "Quanto mais específico, melhor conseguimos te ajudar..." } },
    { id: "ls_n7", type: "endScreen", position: { x: 400, y: 1320 }, width: 320,
      data: { type: "endScreen", title: "Resultado do seu perfil", description: "Com base nas suas respostas, identificamos o melhor caminho para você. Nosso time entrará em contato em breve!", showScore: true } },
  ] as SurveyNode[],
  edges: [
    seq("ls_n1", "ls_n2"),
    ...sc("ls_n2", "ls_n3", ["ls_n2_o1", "ls_n2_o2", "ls_n2_o3", "ls_n2_o4"]),
    ...sc("ls_n3", "ls_n4", ["ls_n3_o1", "ls_n3_o2", "ls_n3_o3", "ls_n3_o4"]),
    ...sc("ls_n4", "ls_n5", ["ls_n4_o1", "ls_n4_o2", "ls_n4_o3", "ls_n4_o4"]),
    ...sc("ls_n5", "ls_n6", ["ls_n5_o1", "ls_n5_o2", "ls_n5_o3", "ls_n5_o4"]),
    seq("ls_n6", "ls_n7"),
  ],
};

// ─── 12. Satisfação Pós-Compra ────────────────────────────────────────────────
// Branch: atendeu expectativas?
//   Superou / Atendeu → pergunta de indicação → endScreen
//   Ficou abaixo      → campo de melhoria → endScreen

const satisfacaoPosCompra: SurveyTemplate = {
  id: "empresas-satisfacao-pos-compra",
  segment: "empresas",
  title: "Satisfação Pós-Compra",
  description: "Avaliação de experiência com branching: expectativas abaixo do esperado abrem campo de resgate.",
  complexity: "intermediate",
  nodes: [
    { id: "sp_n1", type: "presentation", position: { x: 400, y: 0 }, width: 320,
      data: { type: "presentation", title: "Como foi sua experiência?", description: "Sua avaliação nos ajuda a melhorar. Leva menos de 2 minutos.", buttonText: "Avaliar agora", collectName: false, collectEmail: true, emailRequired: false } },
    { id: "sp_n2", type: "rating", position: { x: 400, y: 220 }, width: 320,
      data: { type: "rating", title: "Como você avalia sua experiência geral?", minValue: 1, maxValue: 5, minLabel: "Muito ruim", maxLabel: "Excelente" } },
    { id: "sp_n3", type: "singleChoice", position: { x: 400, y: 440 }, width: 320,
      data: { type: "singleChoice", title: "O produto/serviço atendeu às suas expectativas?", options: [
        { id: "sp_n3_o1", label: "Superou o que eu esperava" },
        { id: "sp_n3_o2", label: "Atendeu exatamente o que esperava" },
        { id: "sp_n3_o3", label: "Ficou abaixo do que eu esperava" },
      ] } },
    // Branch positivo
    { id: "sp_n4_ok", type: "singleChoice", position: { x: 0, y: 660 }, width: 320,
      data: { type: "singleChoice", title: "Você nos recomendaria a um amigo ou colega?", options: [
        { id: "sp_ok_o1", label: "Sim, com certeza" },
        { id: "sp_ok_o2", label: "Talvez" },
        { id: "sp_ok_o3", label: "Provavelmente não" },
      ] } },
    // Branch negativo
    { id: "sp_n4_nok", type: "textInput", position: { x: 800, y: 660 }, width: 320,
      data: { type: "textInput", title: "Lamentamos. O que não atendeu às suas expectativas?", description: "Sua resposta vai diretamente para nosso time de qualidade.", isLong: true, placeholder: "Descreva o que aconteceu..." } },
    { id: "sp_end", type: "endScreen", position: { x: 400, y: 880 }, width: 320,
      data: { type: "endScreen", title: "Obrigado pela avaliação!", description: "Seu feedback é essencial para continuarmos melhorando." } },
  ] as SurveyNode[],
  edges: [
    seq("sp_n1", "sp_n2"),
    seq("sp_n2", "sp_n3"),
    ...sc("sp_n3", "sp_n4_ok", ["sp_n3_o1", "sp_n3_o2"]),
    ...sc("sp_n3", "sp_n4_nok", ["sp_n3_o3"]),
    ...sc("sp_n4_ok", "sp_end", ["sp_ok_o1", "sp_ok_o2", "sp_ok_o3"]),
    seq("sp_n4_nok", "sp_end"),
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  // Básicos
  clinicasEsteticasTriagem,
  imobiliariasQualificacao,
  pesquisaMercadoHabitos,
  infoprodutoresDiagnostico,
  healthcareTriagem,
  eventosInscricao,
  // Intermediários & Avançados
  npsCondicional,
  selecaoCandidatos,
  quizLeadScoring,
  satisfacaoPosCompra,
  anamneseCompleta,
  eventoMultilingue,
];
