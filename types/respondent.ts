export interface Respondent {
  id: string;
  workspaceId: string; // = survey.userId (dono do workspace)
  name: string;
  email: string;
  loginCode?: string;
  loginCodeExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  // Campos de perfil sincronizados via respostas da pesquisa
  sector?: string;
  specialty?: string;
  crm?: string;
  [key: string]: unknown;
}

export interface RespondentSession {
  id: string;
  respondentId: string;
  workspaceId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface SurveyParticipation {
  id: string;
  respondentId: string;
  surveyId: string;
  workspaceId: string;
  status: "in_progress" | "completed";
  responseId?: string;
  createdAt: string;
  completedAt?: string;
}
