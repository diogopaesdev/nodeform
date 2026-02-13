"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ArrowLeft, Loader2 } from "lucide-react";
import { QuestionRenderer } from "@/components/survey/question-renderer";
import { useRuntimeStore } from "@/lib/stores/runtime-store";
import { useEmbedResize } from "@/lib/hooks/use-embed-resize";
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

  useEmbedResize(isEmbedMode);

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
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Finalizando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3 p-6 bg-white rounded-xl border border-gray-200 max-w-sm">
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.close()}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  if (!survey || !currentNodeId) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen bg-gray-50"}`}>
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">Erro ao carregar pesquisa</p>
          <button
            onClick={() => window.close()}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
          >
            Fechar
          </button>
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
    <div className={isEmbedMode ? "" : "min-h-screen bg-gray-50"}>
      {/* Exit Button - hide in embed mode */}
      {!isEmbedMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleExitSurvey}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md shadow-sm transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      )}

      <div className={`px-4 ${isEmbedMode ? "py-6" : "py-12"}`}>
        <div className={`mx-auto space-y-6 ${isEmbedMode ? "max-w-full" : "max-w-4xl space-y-8"}`}>
          {/* Header - compact in embed mode */}
          <div className="text-center space-y-1.5">
            <h1 className={`font-semibold text-gray-900 ${isEmbedMode ? "text-lg" : "text-xl"}`}>{survey.title}</h1>
            {survey.description && (
              <p className={`text-gray-500 ${isEmbedMode ? "text-xs" : "text-sm"}`}>{survey.description}</p>
            )}
          </div>

          {/* Question */}
          <QuestionRenderer node={currentNode} onAnswer={handleAnswer} totalScore={totalScore} />

          {/* Back Button */}
          {canGoBack() && (
            <div className="flex justify-center">
              <button
                onClick={goBack}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Voltar à Pergunta Anterior
              </button>
            </div>
          )}

          {/* Progress */}
          {survey?.enableScoring && !isEmbedMode && (
            <div className="text-center text-xs text-gray-400">
              <p>Pontuação atual: {totalScore} pontos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
