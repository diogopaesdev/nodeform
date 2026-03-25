import type { Metadata } from "next";
import { SessionProvider } from "@/components/providers/session-provider";
import { I18nProvider } from "@/lib/i18n";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import "./globals.css";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://surveyflow.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SurveyFlow — Crie Pesquisas Interativas com Editor Visual",
    template: "%s | SurveyFlow",
  },
  description:
    "Crie pesquisas e formulários com editor visual node-based. Fluxos condicionais, pontuação automática e análise de respostas em tempo real.",
  keywords: [
    "pesquisa online",
    "criador de formulários",
    "survey builder",
    "formulário interativo",
    "fluxo condicional",
    "editor visual",
    "node-based",
    "quiz",
    "coleta de dados",
  ],
  authors: [{ name: "SurveyFlow" }],
  creator: "SurveyFlow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "SurveyFlow",
    title: "SurveyFlow — Crie Pesquisas Interativas com Editor Visual",
    description:
      "Crie pesquisas e formulários com editor visual node-based. Fluxos condicionais, pontuação automática e análise de respostas em tempo real.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "SurveyFlow — Editor Visual de Pesquisas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SurveyFlow — Crie Pesquisas Interativas com Editor Visual",
    description:
      "Crie pesquisas e formulários com editor visual node-based. Fluxos condicionais, pontuação automática e análise de respostas em tempo real.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <SessionProvider>
          <I18nProvider>{children}</I18nProvider>
        </SessionProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
