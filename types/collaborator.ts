export type CollaboratorRole = "editor" | "viewer";
export type CollaboratorStatus = "pending" | "accepted";

export interface SurveyCollaborator {
  id: string;
  surveyId: string;
  surveyTitle: string;
  invitedEmail: string;
  invitedBy: string;
  inviterName: string;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  userId?: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}
