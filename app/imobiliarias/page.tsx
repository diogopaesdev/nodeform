import type { Metadata } from "next";
import { ImobiliariasPage } from "@/components/landing/imobiliarias-page";

export const metadata: Metadata = {
  title: "SurveyFlow para Imobiliárias — Qualificação de Leads Automática com Fluxo Condicional",
  description:
    "Pare de perder tempo com lead sem perfil. Formulário inteligente que qualifica compradores por tipo de imóvel, faixa de preço e prazo — antes de chegar no WhatsApp. Teste 7 dias grátis.",
  alternates: {
    canonical: "/imobiliarias",
  },
  openGraph: {
    title: "SurveyFlow para Imobiliárias — Qualificação de Leads Automática com Fluxo Condicional",
    description:
      "Formulário com fluxo condicional que triagem compradores por perfil antes do primeiro contato. Sem código, sem digitação manual. Teste 7 dias grátis.",
    url: "/imobiliarias",
  },
};

export default function Page() {
  return <ImobiliariasPage />;
}
