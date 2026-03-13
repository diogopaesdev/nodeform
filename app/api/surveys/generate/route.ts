import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSurvey, updateSurvey } from "@/lib/services/surveys";
import { consumeCredit, getCredits } from "@/lib/credits";
import OpenAI from "openai";
import { SurveyNode, SurveyEdge, NodeData } from "@/types/survey";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em criação de pesquisas e formulários interativos.
Gere uma pesquisa completa em JSON com base na descrição do usuário.

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com este formato exato:

{
  "title": "Título da Pesquisa",
  "description": "Descrição breve (opcional)",
  "enableScoring": false,
  "nodes": [
    {
      "type": "presentation",
      "title": "Título de boas-vindas",
      "description": "Texto explicativo",
      "buttonText": "Começar",
      "collectName": true,
      "collectEmail": false
    },
    {
      "type": "singleChoice",
      "title": "Pergunta de escolha única?",
      "description": "Subtítulo opcional",
      "options": [
        { "label": "Opção A", "score": 1 },
        { "label": "Opção B", "score": 2 }
      ]
    },
    {
      "type": "multipleChoice",
      "title": "Pergunta de múltipla escolha?",
      "options": [
        { "label": "Item 1" },
        { "label": "Item 2" },
        { "label": "Item 3" }
      ]
    },
    {
      "type": "rating",
      "title": "Como você avalia X?",
      "minValue": 1,
      "maxValue": 5,
      "minLabel": "Muito ruim",
      "maxLabel": "Excelente"
    },
    {
      "type": "endScreen",
      "title": "Obrigado pela participação!",
      "description": "Mensagem de encerramento",
      "showScore": false
    }
  ]
}

Regras obrigatórias:
- O primeiro nó DEVE ser do tipo "presentation"
- O último nó DEVE ser do tipo "endScreen"
- Use entre 3 e 8 nós no total (incluindo presentation e endScreen)
- singleChoice e multipleChoice devem ter pelo menos 2 opções e no máximo 6
- Se enableScoring=true, inclua "score" em todas as opções de singleChoice
- Adapte o idioma da pesquisa ao idioma da solicitação do usuário
- Retorne APENAS o JSON, sem nenhum texto adicional`;

// ─── Node builder ─────────────────────────────────────────────────────────────

interface AiOption {
  label: string;
  score?: number;
}

interface AiNode {
  type: string;
  title?: string;
  description?: string;
  buttonText?: string;
  collectName?: boolean;
  collectEmail?: boolean;
  options?: AiOption[];
  minValue?: number;
  maxValue?: number;
  minLabel?: string;
  maxLabel?: string;
  showScore?: boolean;
}

interface AiSurvey {
  title: string;
  description?: string;
  enableScoring?: boolean;
  nodes: AiNode[];
}

function buildNodesAndEdges(aiSurvey: AiSurvey): { nodes: SurveyNode[]; edges: SurveyEdge[] } {
  const nodes: SurveyNode[] = [];
  const edges: SurveyEdge[] = [];

  const NODE_WIDTH = 320;
  const NODE_HEIGHT_GAP = 220;
  const CENTER_X = 400;

  aiSurvey.nodes.forEach((aiNode, index) => {
    const nodeId = `node_${Date.now()}_${index}`;
    const position = { x: CENTER_X, y: index * NODE_HEIGHT_GAP };

    let data: NodeData;

    if (aiNode.type === "presentation") {
      data = {
        type: "presentation",
        title: aiNode.title || "Bem-vindo!",
        description: aiNode.description || "",
        buttonText: aiNode.buttonText || "Começar",
        collectName: aiNode.collectName ?? false,
        collectEmail: aiNode.collectEmail ?? false,
      };
    } else if (aiNode.type === "singleChoice") {
      data = {
        type: "singleChoice",
        title: aiNode.title || "Pergunta",
        description: aiNode.description || "",
        options: (aiNode.options || []).map((opt, i) => ({
          id: `opt_${Date.now()}_${index}_${i}`,
          label: opt.label,
          ...(opt.score !== undefined ? { score: opt.score } : {}),
        })),
      };
    } else if (aiNode.type === "multipleChoice") {
      data = {
        type: "multipleChoice",
        title: aiNode.title || "Pergunta",
        description: aiNode.description || "",
        options: (aiNode.options || []).map((opt, i) => ({
          id: `opt_${Date.now()}_${index}_${i}`,
          label: opt.label,
          ...(opt.score !== undefined ? { score: opt.score } : {}),
        })),
      };
    } else if (aiNode.type === "rating") {
      data = {
        type: "rating",
        title: aiNode.title || "Avaliação",
        description: aiNode.description || "",
        minValue: aiNode.minValue ?? 1,
        maxValue: aiNode.maxValue ?? 5,
        minLabel: aiNode.minLabel || "",
        maxLabel: aiNode.maxLabel || "",
      };
    } else {
      // endScreen
      data = {
        type: "endScreen",
        title: aiNode.title || "Obrigado!",
        description: aiNode.description || "",
        showScore: aiNode.showScore ?? false,
      };
    }

    nodes.push({
      id: nodeId,
      type: aiNode.type,
      position,
      data,
      width: NODE_WIDTH,
    } as SurveyNode);
  });

  // Build edges: connect each node to the next sequentially
  for (let i = 0; i < nodes.length - 1; i++) {
    const source = nodes[i];
    const target = nodes[i + 1];
    const sourceData = source.data;

    if (sourceData.type === "singleChoice") {
      // One edge per option — all route to the same next node
      sourceData.options.forEach((opt) => {
        edges.push({
          id: `edge_${source.id}_${target.id}_${opt.id}_${Date.now()}`,
          source: source.id,
          target: target.id,
          sourceHandle: opt.id,
          targetHandle: "target",
          data: { optionId: opt.id },
        } as SurveyEdge);
      });
    } else {
      edges.push({
        id: `edge_${source.id}_${target.id}_${Date.now()}`,
        source: source.id,
        target: target.id,
        sourceHandle: "source",
        targetHandle: "target",
        data: {},
      } as SurveyEdge);
    }
  }

  return { nodes, edges };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { prompt } = await req.json();
    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "API de IA não configurada" }, { status: 503 });
    }

    // Check and consume credit
    const { credits } = await getCredits(session.user.id);
    if (credits <= 0) {
      return NextResponse.json(
        { error: "Créditos insuficientes", code: "NO_CREDITS" },
        { status: 402 }
      );
    }

    const consumed = await consumeCredit(session.user.id);
    if (!consumed) {
      return NextResponse.json(
        { error: "Créditos insuficientes", code: "NO_CREDITS" },
        { status: 402 }
      );
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const rawJson = completion.choices[0]?.message?.content;
    if (!rawJson) {
      return NextResponse.json({ error: "Resposta inválida da IA" }, { status: 500 });
    }

    const aiSurvey: AiSurvey = JSON.parse(rawJson);

    if (!aiSurvey.title || !Array.isArray(aiSurvey.nodes) || aiSurvey.nodes.length === 0) {
      return NextResponse.json({ error: "Estrutura da pesquisa inválida" }, { status: 500 });
    }

    // Create empty survey then populate nodes/edges
    const survey = await createSurvey(session.user.id, aiSurvey.title);
    const { nodes, edges } = buildNodesAndEdges(aiSurvey);

    await updateSurvey(survey.id, {
      description: aiSurvey.description || "",
      enableScoring: aiSurvey.enableScoring ?? false,
      nodes,
      edges,
    });

    return NextResponse.json({ surveyId: survey.id });
  } catch (error) {
    console.error("Error generating survey:", error);
    return NextResponse.json({ error: "Erro ao gerar pesquisa" }, { status: 500 });
  }
}
