import type { Metadata } from "next";
import { EventosPage } from "@/components/landing/eventos-page";

export const metadata: Metadata = {
  title: "SurveyFlow para Eventos — Inscrições que Qualificam Participantes",
  description:
    "Formulários de inscrição com fluxo condicional para eventos. Segmente palestrantes, patrocinadores e convidados, colete dados por perfil e exporte a lista organizada — sem planilha manual. Teste 7 dias grátis.",
  alternates: {
    canonical: "/eventos",
  },
  openGraph: {
    title: "SurveyFlow para Eventos — Inscrições que Qualificam Participantes",
    description:
      "Inscrições com fluxo condicional por perfil de participante, dashboard em tempo real e exportação pronta para credenciamento. Sem código, sem retrabalho. Teste 7 dias grátis.",
    url: "/eventos",
  },
};

export default function Page() {
  return <EventosPage />;
}
