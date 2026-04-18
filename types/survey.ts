import { Node, Edge } from "@xyflow/react";
import { EligibilityRule } from "./addon";

/**
 * Tipos de nós suportados no editor
 */
export type NodeType = "presentation" | "singleChoice" | "multipleChoice" | "rating" | "endScreen";

/**
 * Dados específicos para nó de apresentação (intro)
 */
export interface PresentationData {
  type: "presentation";
  title: string;
  description?: string;
  buttonText: string;
  collectName?: boolean;
  collectEmail?: boolean;
  nameLabel?: string;
  emailLabel?: string;
  nameRequired?: boolean;
  emailRequired?: boolean;
  collectTerms?: boolean;
  termsText?: string;
  termsUrl?: string;
  termsRequired?: boolean;
  [key: string]: unknown;
}

/**
 * Opção de resposta para perguntas de escolha
 */
export interface ChoiceOption {
  id: string;
  label: string;
  score?: number; // Pontuação opcional para esta opção
}

/**
 * Dados específicos para nó de escolha simples (apenas uma opção)
 */
export interface SingleChoiceData {
  type: "singleChoice";
  title: string;
  description?: string;
  options: ChoiceOption[];
  eligibilityRules?: EligibilityRule[]; // node only shown to matching respondents
  [key: string]: unknown;
}

/**
 * Dados específicos para nó de múltipla escolha (várias opções)
 * Conecta à próxima pergunta independente das respostas
 */
export interface MultipleChoiceData {
  type: "multipleChoice";
  title: string;
  description?: string;
  options: ChoiceOption[];
  eligibilityRules?: EligibilityRule[];
  [key: string]: unknown;
}

/**
 * Dados específicos para nó de avaliação (rating)
 */
export interface RatingData {
  type: "rating";
  title: string;
  description?: string;
  minValue: number;
  maxValue: number;
  minLabel?: string;
  maxLabel?: string;
  eligibilityRules?: EligibilityRule[];
  [key: string]: unknown;
}

/**
 * Dados específicos para nó de tela final
 */
export interface EndScreenData {
  type: "endScreen";
  title: string;
  description?: string;
  showScore?: boolean;
  [key: string]: unknown;
}

/**
 * União de todos os tipos de dados de nó
 */
export type NodeData = PresentationData | SingleChoiceData | MultipleChoiceData | RatingData | EndScreenData;

/**
 * Nó de pesquisa (extends Node do React Flow)
 */
export type SurveyNode = Node<NodeData>;

/**
 * Dados adicionais da edge (conexão)
 */
export interface EdgeData {
  // ID da opção que ativa esta conexão (para multiple choice)
  optionId?: string;
  // Valor da avaliação que ativa esta conexão (para rating)
  ratingValue?: number;
  // Label visual da edge
  label?: string;
  [key: string]: unknown;
}

/**
 * Edge de pesquisa (extends Edge do React Flow)
 */
export type SurveyEdge = Edge<EdgeData>;

/**
 * Pesquisa completa (salva no Firebase)
 */
export interface Survey {
  id: string;
  userId: string;
  title: string;
  description?: string;
  nodes: SurveyNode[];
  edges: SurveyEdge[];
  createdAt: string;
  updatedAt: string;
  enableScoring?: boolean;
  status: "draft" | "published" | "finished" | "archived";
  responseCount: number;
  timeLimit?: number;
  prize?: string;
  requiresRespondentLogin?: boolean;
  maxResponses?: number;
  eligibilityRules?: EligibilityRule[]; // survey-level: block ineligible respondents
}

/**
 * Estatísticas do dashboard
 */
export interface DashboardStats {
  totalSurveys: number;
  totalResponses: number;
  activeSurveys: number;
}

/**
 * Resposta do usuário para um nó específico
 */
export interface NodeAnswer {
  nodeId: string;
  // Para single choice
  selectedOptionId?: string;
  // Para multiple choice (pode ter múltiplas seleções)
  selectedOptionIds?: string[];
  // Para rating
  ratingValue?: number;
  // Para presentation (captura de dados)
  respondentName?: string;
  respondentEmail?: string;
  // Timestamp da resposta
  answeredAt: Date;
}

/**
 * Resultado final da pesquisa
 */
export interface SurveyResult {
  surveyId: string;
  answers: NodeAnswer[];
  totalScore: number;
  completedAt: Date;
  // Caminho percorrido (IDs dos nós visitados)
  path: string[];
}

/**
 * Estado do runtime (quando está respondendo)
 */
export interface RuntimeState {
  currentNodeId: string | null;
  answers: NodeAnswer[];
  totalScore: number;
  visitedNodeIds: string[];
  isCompleted: boolean;
}

/**
 * Resposta completa de uma pesquisa (salva no Firebase)
 */
export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: NodeAnswer[];
  totalScore: number;
  path: string[];
  respondentName?: string;
  respondentEmail?: string;
  respondentId?: string;
  completedAt: string;
  createdAt: string;
}
