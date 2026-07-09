import { Node, Edge } from "@xyflow/react";
import { EligibilityRule } from "./addon";
export type { EligibilityRule };

/**
 * Tipos de nós suportados no editor
 */
export type NodeType = "presentation" | "singleChoice" | "multipleChoice" | "rating" | "endScreen" | "textInput";

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
 * Dados específicos para nó de texto livre (curto ou longo)
 */
export interface TextInputData {
  type: "textInput";
  title: string;
  description?: string;
  isLong?: boolean;
  placeholder?: string;
  required?: boolean;
  mask?: string;
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
  redirectUrl?: string;
  redirectDelay?: number;
  redirectSkipResult?: boolean; // quando redireciona: pula a tela de conclusão (apenas salva e redireciona)
  [key: string]: unknown;
}

/**
 * União de todos os tipos de dados de nó
 */
export type NodeData = PresentationData | SingleChoiceData | MultipleChoiceData | RatingData | EndScreenData | TextInputData;

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

export interface BonusCoupon {
  code: string;
  participationId?: string;
  assignedAt?: string;
}

export type BonusConfig =
  | { type: "value"; value: number; description?: string; bonusEligibilityRules?: EligibilityRule[] }
  | { type: "coupons"; coupons: BonusCoupon[]; description?: string; bonusEligibilityRules?: EligibilityRule[] }
  | { type: "shared_coupon"; code: string; maxQty: number; usedQty?: number; description?: string; bonusEligibilityRules?: EligibilityRule[] };

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
  shareToken?: string;
  bonusConfig?: BonusConfig;
  // Collaboration metadata (populated at API response time, not stored in Firestore)
  isCollaborator?: boolean;
  collaboratorRole?: "editor" | "viewer";
  inviterName?: string;
  invitedBy?: string;
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
  // Para textInput
  textValue?: string;
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
export interface NodeSnapshot {
  type: string;
  title: string;
  options?: { id: string; label: string }[];
  minValue?: number;
  maxValue?: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  answers: NodeAnswer[];
  totalScore: number;
  path: string[];
  respondentName?: string;
  respondentEmail?: string;
  respondentId?: string;
  profile?: Record<string, unknown>;
  nodeSnapshot?: Record<string, NodeSnapshot>;
  completedAt: string;
  createdAt: string;
}
