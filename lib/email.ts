import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@surveyflow.app";

export async function sendLoginCode(email: string, name: string, code: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} é seu código de acesso – SurveyFlow`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
        <div style="margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #111827; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="color: white; font-size: 22px; font-weight: bold;">S</span>
          </div>
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Código de acesso</h1>
          <p style="color: #6b7280; margin: 0;">Olá, ${name}! Use o código abaixo para entrar no SurveyFlow.</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Este código expira em 10 minutos. Se você não tentou entrar, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

export async function sendRespondentLoginCode(
  email: string,
  name: string,
  code: string,
  surveyTitle: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} é seu código de acesso para a pesquisa`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Código de acesso</h1>
          <p style="color: #6b7280; margin: 0;">Olá, ${name}! Use o código abaixo para acessar a pesquisa <strong>${surveyTitle}</strong>.</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #111827;">${code}</span>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Este código expira em 10 minutos. Se você não solicitou o acesso, ignore este e-mail.
        </p>
      </div>
    `,
  });
}

export async function sendCollaboratorInvite(
  email: string,
  inviterName: string,
  surveyTitle: string,
  role: "editor" | "viewer",
  inviteUrl: string
) {
  const roleLabel = role === "editor" ? "Editor" : "Visualizador";
  const roleDesc =
    role === "editor"
      ? "Você poderá editar o fluxo e as configurações da pesquisa."
      : "Você poderá visualizar os resultados e respostas da pesquisa.";

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `${inviterName} convidou você para colaborar em uma pesquisa – SurveyFlow`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
        <div style="margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #111827; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="color: white; font-size: 22px; font-weight: bold;">S</span>
          </div>
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Convite para colaborar</h1>
          <p style="color: #6b7280; margin: 0;">
            <strong style="color: #111827;">${inviterName}</strong> convidou você para colaborar na pesquisa
            <strong style="color: #111827;">${surveyTitle}</strong> como <strong style="color: #111827;">${roleLabel}</strong>.
          </p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #6b7280;">${roleDesc}</p>
        </div>
        <a href="${inviteUrl}"
           style="display: inline-block; padding: 12px 24px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
          Aceitar convite
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Este convite expira em 72 horas. Se você não esperava este e-mail, pode ignorá-lo com segurança.
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
  callbackUrl?: string
) {
  const base = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  const verifyUrl = callbackUrl
    ? `${base}&callbackUrl=${encodeURIComponent(callbackUrl)}`
    : base;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Confirme seu e-mail – SurveyFlow",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111827;">
        <div style="margin-bottom: 32px;">
          <div style="width: 48px; height: 48px; background: #111827; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="color: white; font-size: 22px; font-weight: bold;">S</span>
          </div>
          <h1 style="font-size: 22px; font-weight: 700; margin: 0 0 8px;">Confirme seu e-mail</h1>
          <p style="color: #6b7280; margin: 0;">Olá, ${name}! Clique no botão abaixo para ativar sua conta no SurveyFlow.</p>
        </div>
        <a href="${verifyUrl}"
           style="display: inline-block; padding: 12px 24px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
          Confirmar e-mail
        </a>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          Este link expira em 24 horas. Se você não criou uma conta, ignore este e-mail.
        </p>
      </div>
    `,
  });
}
