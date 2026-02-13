"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy, Star, RotateCcw, X, Loader2 } from "lucide-react";
import { useRuntimeStore } from "@/lib/stores/runtime-store";
import { useEmbedResize } from "@/lib/hooks/use-embed-resize";

export default function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbedMode = searchParams.get("embed") === "true";
  const { survey, totalScore, answers, isCompleted, resetSurvey, getResult, visitedNodeIds } =
    useRuntimeStore();

  const [showConfetti, setShowConfetti] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasSaved = useRef(false);

  useEmbedResize(isEmbedMode);

  // Salvar resposta no Firebase
  useEffect(() => {
    const saveResponseToFirebase = async () => {
      if (!isCompleted || !survey || hasSaved.current) return;

      hasSaved.current = true;
      setIsSaving(true);
      setSaveError(null);

      try {
        // Extrair nome e email das respostas (da tela de apresentação)
        const presentationAnswer = answers.find(
          (a) => a.respondentName || a.respondentEmail
        );

        const response = await fetch(`/api/public/surveys/${id}/responses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            totalScore,
            path: visitedNodeIds,
            respondentName: presentationAnswer?.respondentName,
            respondentEmail: presentationAnswer?.respondentEmail,
          }),
        });

        if (!response.ok) {
          throw new Error("Falha ao salvar resposta");
        }
      } catch (error) {
        console.error("Error saving response:", error);
        setSaveError("Não foi possível salvar sua resposta");
      } finally {
        setIsSaving(false);
      }
    };

    saveResponseToFirebase();
  }, [isCompleted, survey, answers, totalScore, visitedNodeIds, id]);

  useEffect(() => {
    if (!isCompleted) {
      router.push(`/survey/${id}${isEmbedMode ? "?embed=true" : ""}`);
      return;
    }

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [isCompleted, router, id, isEmbedMode]);

  if (!survey || !isCompleted) {
    return (
      <div className={`flex items-center justify-center ${isEmbedMode ? "py-12" : "min-h-screen"}`}>
        <div className="text-center space-y-4">
          <p className="text-gray-600">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  const result = getResult();

  const getResultMessage = (score: number, enableScoring?: boolean) => {
    if (!enableScoring) {
      return {
        title: "Concluído!",
        message: "Obrigado por completar a pesquisa.",
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      };
    }

    if (score >= 100) {
      return {
        title: "Excelente!",
        message: "Você teve uma pontuação incrível!",
        icon: Trophy,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      };
    } else if (score >= 50) {
      return {
        title: "Muito Bom!",
        message: "Você teve um bom desempenho.",
        icon: Star,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      };
    } else {
      return {
        title: "Obrigado!",
        message: "Obrigado por completar a pesquisa.",
        icon: Star,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
      };
    }
  };

  const resultData = getResultMessage(totalScore, survey?.enableScoring ?? true);
  const ResultIcon = resultData.icon;

  const handleRestart = () => {
    resetSurvey();
    router.push(`/survey/${id}${isEmbedMode ? "?embed=true" : ""}`);
  };

  const handleClose = () => {
    resetSurvey();
    window.close();
  };

  return (
    <div className={`${isEmbedMode ? "py-4" : "min-h-screen bg-gray-50 py-12"} px-4 relative overflow-hidden`}>
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gray-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className={`mx-auto ${isEmbedMode ? "space-y-4" : "max-w-md space-y-6"} relative z-10`}>
        {/* Result Card */}
        <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${isEmbedMode ? "p-6 space-y-4" : "p-8 space-y-6"}`}>
          {/* Icon */}
          <div
            className={`${isEmbedMode ? "w-12 h-12" : "w-16 h-16"} ${resultData.bgColor} rounded-2xl flex items-center justify-center mx-auto`}
          >
            <ResultIcon className={`${isEmbedMode ? "w-6 h-6" : "w-8 h-8"} ${resultData.color}`} />
          </div>

          {/* Title */}
          <div className="text-center space-y-1.5">
            <h1 className={`${isEmbedMode ? "text-xl" : "text-2xl"} font-bold text-gray-900`}>
              {resultData.title}
            </h1>
            <p className={`${isEmbedMode ? "text-sm" : "text-sm"} text-gray-500`}>{resultData.message}</p>
          </div>

          {/* Score */}
          {(survey?.enableScoring ?? true) && (
            <div className={`text-center ${isEmbedMode ? "py-3" : "py-6"} border-y border-gray-100`}>
              <div className="space-y-1">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                  Pontuação Final
                </p>
                <p className={`${isEmbedMode ? "text-3xl" : "text-4xl"} font-bold text-gray-900`}>{totalScore}</p>
                <p className="text-xs text-gray-400">pontos</p>
              </div>
            </div>
          )}

          {/* Stats - hide in embed mode to save space */}
          {!isEmbedMode && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-gray-900">
                  {result?.answers.length || 0}
                </p>
                <p className="text-[10px] text-gray-500">Perguntas</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-gray-900">
                  {result?.path.length || 0}
                </p>
                <p className="text-[10px] text-gray-500">Passos</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-lg font-bold text-gray-900">100%</p>
                <p className="text-[10px] text-gray-500">Completo</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={`flex gap-2 ${isEmbedMode ? "pt-1" : "pt-2"}`}>
            <button
              onClick={handleRestart}
              className={`flex-1 flex items-center justify-center gap-1.5 ${isEmbedMode ? "py-1.5 text-xs" : "py-2 text-sm"} font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Novamente
            </button>
            {!isEmbedMode && (
              <button
                onClick={handleClose}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Fechar
              </button>
            )}
          </div>
        </div>

        {/* Survey Info */}
        <div className="text-center space-y-1">
          {!isEmbedMode && <p className="text-xs text-gray-500">Pesquisa: {survey.title}</p>}
          {isSaving && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Salvando resposta...</span>
            </div>
          )}
          {saveError && (
            <p className="text-xs text-red-500">{saveError}</p>
          )}
          <p className="text-[11px] text-gray-400">
            Criado com NodeForm
          </p>
        </div>
      </div>
    </div>
  );
}
