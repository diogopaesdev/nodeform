"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Loader2, ArrowLeft as Back } from "lucide-react";
import { QuestionRenderer } from "@/components/survey/question-renderer";
import { useEditorStore } from "@/lib/stores/editor-store";
import { useRuntimeStore } from "@/lib/stores/runtime-store";

export default function SurveyPage() {
  const router = useRouter();
  const { getSurvey } = useEditorStore();
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

  const handleExitSurvey = () => {
    if (confirm("Deseja sair do teste? O progresso será perdido.")) {
      resetSurvey();
      router.push("/editor");
    }
  };

  useEffect(() => {
    // Carregar pesquisa do editor
    const editorSurvey = getSurvey();

    if (!editorSurvey || editorSurvey.nodes.length === 0) {
      alert("Nenhuma pesquisa encontrada! Crie uma pesquisa primeiro.");
      router.push("/editor");
      return;
    }

    // Garantir que enableScoring está definido
    if (editorSurvey.enableScoring === undefined) {
      editorSurvey.enableScoring = true;
    }

    startSurvey(editorSurvey);
    setIsLoading(false);
  }, []);

  // Redirecionar para resultados quando completar
  useEffect(() => {
    if (isCompleted) {
      router.push("/survey/result");
    }
  }, [isCompleted, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Carregando pesquisa...</p>
        </div>
      </div>
    );
  }

  if (!survey || !currentNodeId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-sm text-gray-500">Erro ao carregar pesquisa</p>
          <button
            onClick={() => router.push("/editor")}
            className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            Voltar ao Editor
          </button>
        </div>
      </div>
    );
  }

  const currentNode = getCurrentNode();

  if (!currentNode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Nó não encontrado</p>
      </div>
    );
  }

  const handleAnswer = (answer: { selectedOptionId?: string; selectedOptionIds?: string[]; ratingValue?: number }) => {
    answerNode({
      nodeId: currentNodeId,
      ...answer,
      answeredAt: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exit Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleExitSurvey}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-md shadow-sm transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Sair do Teste
        </button>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-semibold text-gray-900">{survey.title}</h1>
            {survey.description && (
              <p className="text-sm text-gray-500">{survey.description}</p>
            )}
          </div>

          {/* Question */}
          <QuestionRenderer node={currentNode} onAnswer={handleAnswer} />

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
          {survey?.enableScoring && (
            <div className="text-center text-xs text-gray-400">
              <p>Pontuação atual: {totalScore} pontos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
