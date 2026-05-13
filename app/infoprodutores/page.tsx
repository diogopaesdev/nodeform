import type { Metadata } from "next";
import { InfoprodutoresPage } from "@/components/landing/infoprodutores-page";

export const metadata: Metadata = {
  title: "SurveyFlow para Infoprodutores — Quizzes que Qualificam e Convertem",
  description:
    "Crie quizzes de diagnóstico que identificam o perfil do lead, recomendam o produto certo e acionam o WhatsApp automaticamente. Converta mais no seu lançamento. Teste 7 dias grátis.",
  alternates: {
    canonical: "/infoprodutores",
  },
  openGraph: {
    title: "SurveyFlow para Infoprodutores — Quizzes que Qualificam e Convertem",
    description:
      "Quizzes inteligentes que qualificam leads e recomendam o produto certo para cada perfil. Sem código, com integração WhatsApp. Teste 7 dias grátis.",
    url: "/infoprodutores",
  },
};

export default function Page() {
  return <InfoprodutoresPage />;
}
