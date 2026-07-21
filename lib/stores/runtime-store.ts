import { create } from "zustand";
import type { Survey, RuntimeState, NodeAnswer, SurveyResult } from "@/types";
import type { Respondent } from "@/types/respondent";
import { isNodeVisibleToRespondent } from "@/lib/utils/eligibility";

export type SaveOutcome = "saved" | "session_expired" | "error";

interface RuntimeStoreState extends RuntimeState {
  survey: Survey | null;
  respondent: Respondent | null;
  responseSaved: boolean;

  // Actions
  setRespondent: (respondent: Respondent | null) => void;
  startSurvey: (survey: Survey) => void;
  restoreSurvey: (survey: Survey, state: { currentNodeId: string; answers: NodeAnswer[]; totalScore: number; visitedNodeIds: string[] }) => void;
  answerNode: (answer: NodeAnswer) => void;
  goToNode: (nodeId: string) => void;
  goBack: () => void;
  completeSurvey: () => void;
  // Persiste a resposta no backend. Idempotente: chamada por reaching-endScreen
  // (survey page) e pela tela de resultado — só faz um POST de verdade.
  submitResponse: (surveyId: string) => Promise<SaveOutcome>;
  resetSurvey: () => void;

  // Helpers
  getCurrentNode: () => ReturnType<Survey["nodes"]["find"]> | undefined;
  getNextNodeId: (currentNodeId: string, answer: NodeAnswer) => string | null;
  getResult: () => SurveyResult | null;
  canGoBack: () => boolean;
}

// Promessa do POST em andamento, compartilhada entre as duas telas que podem
// disparar o save (survey page ao alcançar a tela final, e a tela de resultado).
// Fora do estado para não recriar a cada render e garantir dedupe real.
let saveInFlight: Promise<SaveOutcome> | null = null;

export const useRuntimeStore = create<RuntimeStoreState>((set, get) => ({
  survey: null,
  respondent: null,
  currentNodeId: null,
  answers: [],
  totalScore: 0,
  visitedNodeIds: [],
  isCompleted: false,
  responseSaved: false,

  setRespondent: (respondent) => set({ respondent }),

  // Restaurar progresso salvo
  restoreSurvey: (survey, state) => {
    saveInFlight = null;
    set({
      survey,
      currentNodeId: state.currentNodeId,
      answers: state.answers,
      totalScore: state.totalScore,
      visitedNodeIds: state.visitedNodeIds,
      isCompleted: false,
      responseSaved: false,
    });
  },

  // Iniciar pesquisa
  startSurvey: (survey) => {
    // Encontrar o primeiro nó (nó que não tem nenhuma edge apontando para ele)
    const targetNodeIds = new Set(survey.edges.map((edge) => edge.target));
    const firstNode = survey.nodes.find((node) => !targetNodeIds.has(node.id)) || survey.nodes[0];

    saveInFlight = null;
    set({
      survey,
      currentNodeId: firstNode?.id || null,
      answers: [],
      totalScore: 0,
      visitedNodeIds: firstNode ? [firstNode.id] : [],
      isCompleted: false,
      responseSaved: false,
    });
  },

  // Responder nó atual
  answerNode: (answer) => {
    const state = get();
    const newAnswers = [...state.answers, answer];

    // Calcular score apenas se enableScoring estiver ativo
    let scoreToAdd = 0;
    if (state.survey?.enableScoring) {
      // Para singleChoice
      if (answer.selectedOptionId && state.survey) {
        const node = state.survey.nodes.find((n) => n.id === answer.nodeId);
        if (node && (node.data.type === "singleChoice" || node.data.type === "multipleChoice")) {
          const option = node.data.options.find((o) => o.id === answer.selectedOptionId);
          scoreToAdd = option?.score || 0;
        }
      }

      // Para multiple choice (múltiplas seleções)
      if (answer.selectedOptionIds && state.survey) {
        const node = state.survey.nodes.find((n) => n.id === answer.nodeId);
        if (node && node.data.type === "multipleChoice") {
          const multipleChoiceNode = node as { data: { type: "multipleChoice"; options: Array<{ id: string; score?: number }> } };
          answer.selectedOptionIds.forEach((optId) => {
            const option = multipleChoiceNode.data.options.find((o) => o.id === optId);
            if (option?.score) {
              scoreToAdd += option.score;
            }
          });
        }
      }

      // Para rating
      if (answer.ratingValue !== undefined && state.survey?.enableScoring) {
        scoreToAdd = answer.ratingValue;
      }
    }

    set({
      answers: newAnswers,
      totalScore: state.totalScore + scoreToAdd,
    });

    // Determinar próximo nó
    const nextNodeId = get().getNextNodeId(answer.nodeId, answer);

    if (nextNodeId) {
      get().goToNode(nextNodeId);
    } else {
      get().completeSurvey();
    }
  },

  // Navegar para um nó específico
  goToNode: (nodeId) => {
    set((state) => ({
      currentNodeId: nodeId,
      visitedNodeIds: [...state.visitedNodeIds, nodeId],
    }));
  },

  // Voltar para o nó anterior
  goBack: () => {
    const state = get();

    // Não pode voltar se estiver no primeiro nó ou se não houver histórico
    if (state.visitedNodeIds.length <= 1 || state.answers.length === 0) {
      return;
    }

    // Obter última resposta para recalcular score
    const lastAnswer = state.answers[state.answers.length - 1];
    let scoreToRemove = 0;

    if (state.survey?.enableScoring) {
      // Calcular score da última resposta para remover
      if (lastAnswer.selectedOptionId && state.survey) {
        const node = state.survey.nodes.find((n) => n.id === lastAnswer.nodeId);
        if (node && (node.data.type === "singleChoice" || node.data.type === "multipleChoice")) {
          const option = node.data.options?.find((o: { id: string }) => o.id === lastAnswer.selectedOptionId);
          scoreToRemove = (option as { score?: number })?.score || 0;
        }
      }

      if (lastAnswer.selectedOptionIds && state.survey) {
        const node = state.survey.nodes.find((n) => n.id === lastAnswer.nodeId);
        if (node && node.data.type === "multipleChoice") {
          const multipleChoiceNode = node as { data: { type: "multipleChoice"; options: Array<{ id: string; score?: number }> } };
          lastAnswer.selectedOptionIds.forEach((optId) => {
            const option = multipleChoiceNode.data.options.find((o) => o.id === optId);
            if (option?.score) {
              scoreToRemove += option.score;
            }
          });
        }
      }

      if (lastAnswer.ratingValue !== undefined) {
        scoreToRemove = lastAnswer.ratingValue;
      }
    }

    // Remover último nó do histórico e última resposta
    const newVisitedNodeIds = state.visitedNodeIds.slice(0, -1);
    const previousNodeId = newVisitedNodeIds[newVisitedNodeIds.length - 1];
    const newAnswers = state.answers.slice(0, -1);

    set({
      currentNodeId: previousNodeId,
      visitedNodeIds: newVisitedNodeIds,
      answers: newAnswers,
      totalScore: state.totalScore - scoreToRemove,
    });
  },

  // Completar pesquisa
  completeSurvey: () => {
    set({ isCompleted: true, currentNodeId: null });
  },

  // Persistir resposta (idempotente)
  submitResponse: async (surveyId) => {
    // Já salvo nesta sessão: nada a fazer.
    if (get().responseSaved) return "saved";
    // POST já em andamento: reaproveita a mesma promessa (evita duplicidade).
    if (saveInFlight) return saveInFlight;

    const run = (async (): Promise<SaveOutcome> => {
      const state = get();
      const presentationAnswer = state.answers.find(
        (a) => a.respondentName || a.respondentEmail
      );
      try {
        const res = await fetch(`/api/public/surveys/${surveyId}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: state.answers,
            totalScore: state.totalScore,
            path: state.visitedNodeIds,
            respondentName: presentationAnswer?.respondentName,
            respondentEmail: presentationAnswer?.respondentEmail,
          }),
        });
        if (res.status === 401) return "session_expired";
        if (!res.ok) return "error";
        set({ responseSaved: true });
        return "saved";
      } catch {
        return "error";
      } finally {
        saveInFlight = null;
      }
    })();

    saveInFlight = run;
    return run;
  },

  // Resetar pesquisa
  resetSurvey: () => {
    saveInFlight = null;
    set({
      survey: null,
      respondent: null,
      currentNodeId: null,
      answers: [],
      totalScore: 0,
      visitedNodeIds: [],
      isCompleted: false,
      responseSaved: false,
    });
  },

  // Obter nó atual
  getCurrentNode: () => {
    const state = get();
    if (!state.survey || !state.currentNodeId) return undefined;
    return state.survey.nodes.find((node) => node.id === state.currentNodeId);
  },

  // Determinar próximo nó baseado na resposta
  getNextNodeId: (currentNodeId, answer) => {
    const state = get();
    if (!state.survey) return null;

    const availableEdges = state.survey.edges.filter(e => e.source === currentNodeId);

    if (availableEdges.length === 0) {
      return null;
    }

    // "source" é o id do handle genérico — tratar como ausência de optionId
    // para compatibilidade com edges salvas antes da correção do onConnect
    const isGenericEdge = (edge: { data?: { optionId?: string; ratingValue?: number } }) => {
      const optId = edge.data?.optionId;
      return !optId || optId === "source";
    };

    // Encontrar edge que corresponde à resposta
    let matchingEdge = availableEdges.find((edge) => {
      // Para presentation: usar primeira edge genérica disponível
      const isEmptyAnswer = !answer.selectedOptionId && !answer.selectedOptionIds && answer.ratingValue === undefined;
      if (isEmptyAnswer) {
        return isGenericEdge(edge);
      }

      // Para singleChoice: verificar se o optionId bate
      if (answer.selectedOptionId) {
        if (edge.data?.optionId && edge.data.optionId !== "source") {
          return edge.data.optionId === answer.selectedOptionId;
        }
        return false;
      }

      // Para multipleChoice: buscar edge genérica (sem optionId de opção real)
      if (answer.selectedOptionIds && isGenericEdge(edge) && !edge.data?.ratingValue) {
        return true;
      }

      // Para rating: verificar se o valor bate ou buscar edge genérica
      if (answer.ratingValue !== undefined) {
        if (edge.data?.ratingValue !== undefined) {
          return edge.data.ratingValue === answer.ratingValue;
        }
        if (isGenericEdge(edge) && !edge.data?.ratingValue) {
          return true;
        }
      }

      return false;
    });

    if (!matchingEdge) return null;

    // If the target node has eligibility rules that exclude this respondent, skip it
    const targetNode = state.survey.nodes.find((n) => n.id === matchingEdge!.target);
    if (targetNode) {
      const rules = (targetNode.data as { eligibilityRules?: import("@/types/addon").EligibilityRule[] }).eligibilityRules;
      if (rules && rules.length > 0 && !isNodeVisibleToRespondent(rules, state.respondent)) {
        // Auto-skip: find the next node after this one using an empty answer
        const skipEdges = state.survey.edges.filter((e) => e.source === matchingEdge!.target);
        const fallback = skipEdges.find((e) => {
          const optId = e.data?.optionId;
          return !optId || optId === "source";
        });
        return fallback?.target ?? null;
      }
    }

    return matchingEdge.target;
  },

  // Obter resultado final
  getResult: () => {
    const state = get();
    if (!state.survey || !state.isCompleted) return null;

    return {
      surveyId: state.survey.id,
      answers: state.answers,
      totalScore: state.totalScore,
      completedAt: new Date(),
      path: state.visitedNodeIds,
    };
  },

  // Verificar se pode voltar
  canGoBack: () => {
    const state = get();
    return state.visitedNodeIds.length > 1 && state.answers.length > 0;
  },
}));
