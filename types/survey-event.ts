// Eventos de atividade de uma pesquisa. Complementam `responses` (conclusões) e
// `surveyProgress` (em andamento) capturando o que antes não deixava rastro:
// aberturas e bloqueios por inelegibilidade.
export type SurveyEventType =
  | "opened" // página da pesquisa carregada (anônimo ou logado)
  | "blocked_ineligible"; // respondente logado bloqueado pela regra de elegibilidade da pesquisa

export interface SurveyEvent {
  id: string;
  surveyId: string;
  workspaceId: string; // = survey.userId
  type: SurveyEventType;
  respondentId?: string;
  respondentName?: string;
  respondentEmail?: string;
  reason?: string; // rótulo da regra que falhou (blocked_ineligible)
  createdAt: string;
  // Marcado quando a resposta do respondente foi apagada: o evento é mantido
  // para o funil, mas o vínculo pessoal (id/nome/e-mail) é removido.
  anonymized?: boolean;
}

// Tipos que a rota pública aceita gravar (sem sessão de admin).
export const PUBLIC_SURVEY_EVENT_TYPES: SurveyEventType[] = ["opened"];
