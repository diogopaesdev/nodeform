import type { Metadata } from "next";
import { PesquisaDeMercadoPage } from "@/components/landing/pesquisa-de-mercado-page";

export const metadata: Metadata = {
  title: "SurveyFlow para Pesquisa de Mercado — Dados Confiáveis com Fluxo Condicional",
  description:
    "Conduza pesquisas de mercado com rigor metodológico. Fluxo condicional por perfil, dashboard em tempo real e exportação CSV — sem Google Forms, sem planilha manual. Teste 7 dias grátis.",
  alternates: {
    canonical: "/pesquisa-de-mercado",
  },
  openGraph: {
    title: "SurveyFlow para Pesquisa de Mercado — Dados Confiáveis com Fluxo Condicional",
    description:
      "Pesquisas com fluxo condicional real, exportação organizada e dashboard em tempo real. Sem código, sem planilha manual. Teste 7 dias grátis.",
    url: "/pesquisa-de-mercado",
  },
};

export default function Page() {
  return <PesquisaDeMercadoPage />;
}
