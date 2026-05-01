import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "SurveyFlow — Formulários Inteligentes e Automação de Leads",
  description:
    "Crie formulários inteligentes, qualifique leads e automatize ações com WhatsApp — sem código. Pesquisa de mercado, qualificação de leads e coleta de dados com fluxo condicional.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SurveyFlow — Formulários Inteligentes e Automação de Leads",
    description:
      "Crie formulários inteligentes, qualifique leads e automatize ações com WhatsApp — sem código.",
    url: "/",
  },
};

export default function Page() {
  return <LandingPage />;
}
