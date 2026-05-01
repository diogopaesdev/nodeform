import type { Metadata } from "next";
import { ClinicasEsteticasPage } from "@/components/landing/clinicas-esteticas-page";

export const metadata: Metadata = {
  title: "SurveyFlow para Clínicas Estéticas — Triagem de Pacientes Automática",
  description:
    "Qualifique pacientes antes da consulta com formulários inteligentes. Elimine ligações desnecessárias, aumente conversão e integre com WhatsApp — sem código. Teste 7 dias grátis.",
  alternates: {
    canonical: "/clinicas-esteticas",
  },
  openGraph: {
    title: "SurveyFlow para Clínicas Estéticas — Triagem de Pacientes Automática",
    description:
      "Qualifique pacientes antes da consulta com formulários inteligentes. Sem código, com integração WhatsApp. Teste 7 dias grátis.",
    url: "/clinicas-esteticas",
  },
};

export default function Page() {
  return <ClinicasEsteticasPage />;
}
