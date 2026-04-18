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

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;

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
