"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { QuestionRenderer } from "@/components/survey/question-renderer";
import { useRuntimeStore } from "@/lib/stores/runtime-store";
import { Button } from "@/components/ui/button";
import { Survey } from "@/types/survey";

export default function SurveyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbedMode = searchParams.get("embed") === "true";
  const {
    survey,
    currentNodeId,
    isCompleted,
    totalScore,
    startSurvey,
    answerNode,
    getCurrentNode,
    resetSurvey,
    goBack,
    canGoBack,
  } = useRuntimeStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAndStartSurvey();
  }, [id]);

  const fetchAndStartSurvey = async () => {
    try {
      // Usar API pública (não requer autenticação)
      const res = await fetch(`/api/public/surveys/${id}`);

      if (!res.ok) {
        setError("Pesquisa não encontrada");
        return;
      }

      const data = await res.json();
      const surveyData = data.survey as Survey;

      if (!surveyData || surveyData.nodes.length === 0) {
        setError("Esta pesquisa ainda não tem perguntas");
        return;
      }

      startSurvey(surveyData);
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError("Erro ao carregar pesquisa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitSurvey = () => {
    if (confirm("Deseja sair da pesquisa? O progresso será perdido.")) {
      resetSurvey();
      window.close();
      // Se window.close() não funcionar (não foi aberto como popup)
      router.push(`/dashboard/survey/${id}`);
    }
  };

  // Redirecionar para resultados quando completar
  useEffect(() => {
    if (isCompleted) {
      router.push(`/survey/${id}/result${isEmbedMode ? "?embed=true" : ""}`);
    }
  }, [isCompleted, router, id, isEmbedMode]);

  // Mostrar loading enquanto redireciona para resultado
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-600">Finalizando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
          <p className="text-gray-600">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg max-w-md">
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.close()} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  if (!survey || !currentNodeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Erro ao carregar pesquisa</p>
          <Button onClick={() => window.close()} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  const currentNode = getCurrentNode();

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Pergunta não encontrada</p>
      </div>
    );
  }

  const handleAnswer = (answer: {
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    ratingValue?: number;
    respondentName?: string;
    respondentEmail?: string;
  }) => {
    answerNode({
      nodeId: currentNodeId,
      ...answer,
      answeredAt: new Date(),
    });
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 ${isEmbedMode ? "overflow-hidden" : ""}`}>
      {/* Exit Button - hide in embed mode */}
      {!isEmbedMode && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            onClick={handleExitSurvey}
            variant="outline"
            size="sm"
            className="bg-white shadow-md hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      )}

      <div className={`px-4 ${isEmbedMode ? "py-6" : "py-12"}`}>
        <div className={`mx-auto space-y-6 ${isEmbedMode ? "max-w-full" : "max-w-4xl space-y-8"}`}>
          {/* Header - compact in embed mode */}
          <div className="text-center space-y-2">
            <h1 className={`font-bold text-gray-900 ${isEmbedMode ? "text-xl" : "text-2xl"}`}>{survey.title}</h1>
            {survey.description && (
              <p className={`text-gray-600 ${isEmbedMode ? "text-sm" : ""}`}>{survey.description}</p>
            )}
          </div>

          {/* Question */}
          <QuestionRenderer node={currentNode} onAnswer={handleAnswer} />

          {/* Back Button */}
          {canGoBack() && (
            <div className="flex justify-center">
              <Button
                onClick={goBack}
                variant="outline"
                size="sm"
                className="bg-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar à Pergunta Anterior
              </Button>
            </div>
          )}

          {/* Progress */}
          {survey?.enableScoring && !isEmbedMode && (
            <div className="text-center text-sm text-gray-500">
              <p>Pontuação atual: {totalScore} pontos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
