import type { Metadata } from "next";
import { HealthcarePage } from "@/components/landing/healthcare-page";

export const metadata: Metadata = {
  title: "SurveyFlow para Healthcare — Coleta de Dados Clínicos com Rigor Metodológico",
  description:
    "Formulários com fluxo condicional para pesquisas clínicas, satisfação de pacientes e estudos em saúde. Elegibilidade automática, LGPD integrada e exportação pronta para análise. Teste 7 dias grátis.",
  alternates: {
    canonical: "/healthcare",
  },
  openGraph: {
    title: "SurveyFlow para Healthcare — Coleta de Dados Clínicos com Rigor Metodológico",
    description:
      "Fluxo condicional para pesquisas clínicas e satisfação de pacientes. Elegibilidade automática, LGPD integrada, exportação para análise. Teste 7 dias grátis.",
    url: "/healthcare",
  },
};

export default function Page() {
  return <HealthcarePage />;
}
