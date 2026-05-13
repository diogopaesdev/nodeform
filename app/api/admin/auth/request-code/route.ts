import { NextResponse } from "next/server";
import { getFirebaseAdmin } from "@/lib/firebase-admin";
import { requireAdmin } from "@/lib/services/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "noreply@surveyflow.app";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { db } = getFirebaseAdmin();

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const adminEmail = admin.email!;
  await db.collection("adminOtps").doc(adminEmail).set({ code, expiresAt, usedAt: null });

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `${code} — Código de acesso Admin · SurveyFlow`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111827;">
        <div style="margin-bottom:32px;">
          <div style="width:48px;height:48px;background:#111827;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
            <span style="color:white;font-size:22px;font-weight:bold;">S</span>
          </div>
          <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;">Acesso ao painel admin</h1>
          <p style="color:#6b7280;margin:0;">Use o código abaixo para acessar o painel de administração.</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#111827;">${code}</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:16px;">
          Expira em 10 minutos. Se você não solicitou este código, ignore este e-mail.
        </p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
