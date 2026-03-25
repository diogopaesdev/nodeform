import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "SurveyFlow — Crie Pesquisas Interativas com Editor Visual Node-Based",
  description:
    "Crie pesquisas e formulários com editor visual de fluxo. Fluxos condicionais, pontuação automática e análise de respostas em tempo real. Comece grátis.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SurveyFlow — Crie Pesquisas Interativas com Editor Visual Node-Based",
    description:
      "Crie pesquisas e formulários com editor visual de fluxo. Fluxos condicionais, pontuação automática e análise de respostas em tempo real.",
    url: "/",
  },
};

export default function Page() {
  return <LandingPage />;
}
